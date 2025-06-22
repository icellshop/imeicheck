const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op, fn, col } = require('sequelize');
const User = require('../models/user');
const Payment = require('../models/payment');
const ImeiOrder = require('../models/imei_order');
const { sendMail } = require('../utils/mailer');
const getUserBalance = require('../utils/getUserBalance');

// --- REGISTRO ---
exports.register = async (req, res) => {
  try {
    const { username, email, password, country, phone, full_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ where: { email: normalizedEmail } });
    if (userExists) {
      if (userExists.email_verified) {
        return res.status(409).json({ error: 'El correo ya está registrado y verificado.' });
      }
      return res.status(409).json({
        error: 'El correo ya está registrado pero no verificado. Por favor revisa tu correo o pide un nuevo código de verificación.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verification_code = Math.floor(100000 + Math.random() * 900000).toString();
    const verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      username,
      email: normalizedEmail,
      password_hash: hashedPassword,
      user_type: 'pending',
      email_verification_code: verification_code,
      email_verification_expires: verification_expires,
      email_verified: false,
      country: country || null,
      phone: phone || null,
      full_name: full_name || null
    });

    await sendMail({
      to: user.email,
      type: 'verification',
      data: { code: verification_code }
    });

    res.status(201).json({
      message: 'Usuario registrado. Por favor verifica tu correo electrónico para activar tu cuenta.',
      user_id: user.user_id
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// --- LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Debes verificar tu correo electrónico antes de iniciar sesión.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor (JWT Secret)' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, user_type: user.user_type },
      secret,
      { expiresIn: '7d' }
    );

    // Calcula el balance real en login también
    const liveBalance = await getUserBalance(user.user_id);

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        country: user.country,
        balance: liveBalance,
        phone: user.phone,
        full_name: user.full_name
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// --- PERFIL AUTENTICADO ---
exports.me = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    // Calcula el balance real en tiempo real
    const liveBalance = await getUserBalance(user.user_id);
    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      country: user.country,
      user_type: user.user_type,
      balance: liveBalance,
      phone: user.phone
    });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// --- PERFIL AUTENTICADO (LEGACY) ---
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    const liveBalance = await getUserBalance(user.user_id);
    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
      country: user.country,
      full_name: user.full_name,
      balance: liveBalance,
      phone: user.phone
    });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// --- BUSCAR USUARIOS POR EMAIL (AUTOCOMPLETADO) ---
exports.searchByEmail = async (req, res) => {
  try {
    const email = req.query.email || '';
    if (!email) return res.json([]);
    const users = await User.findAll({
      where: { email: { [Op.like]: `%${email}%` } },
      attributes: ['email'],
      limit: 10
    });
    res.json(users);
  } catch (error) {
    console.error('Error en searchByEmail:', error);
    res.status(500).json({ error: 'Error al buscar usuarios por email' });
  }
};

// --- LISTA ADMIN: usuarios con stats (para tabla users del dashboard) ---
exports.adminList = async (req, res) => {
  try {
    // Usuarios básicos
    const users = await User.findAll({
      attributes: [
        'user_id', 'email', 'country', 'created_at', 'user_type'
      ],
      order: [['created_at', 'DESC']],
      raw: true,
    });

    // Pagos aprobados por usuario (total y monto)
    const payments = await Payment.findAll({
      where: { status: 'approved' },
      attributes: [
        'user_id',
        [fn('COUNT', col('payment_id')), 'total_payments'],
        [fn('SUM', col('amount')), 'total_payments_amount'],
      ],
      group: ['user_id'],
      raw: true,
    });

    // Órdenes completadas + total $ por usuario
    const imeiOrders = await ImeiOrder.findAll({
      where: { status: 'completed' },
      attributes: [
        'user_id',
        [fn('COUNT', col('order_id')), 'completed_orders'],
        [fn('SUM', col('price_used')), 'completed_orders_amount']
      ],
      group: ['user_id'],
      raw: true,
    });

    // Map stats by user_id for easy lookup
    const paymentsByUser = Object.fromEntries(payments.map(p => [String(p.user_id), p]));
    const ordersByUser = Object.fromEntries(imeiOrders.map(o => [String(o.user_id), o]));

    // Merge stats into user objects
    const rows = users.map(u => {
      const payments = paymentsByUser[String(u.user_id)] || {};
      const orders = ordersByUser[String(u.user_id)] || {};
      return {
        ...u,
        total_payments: parseInt(payments.total_payments) || 0,
        total_payments_amount: payments.total_payments_amount ? parseFloat(payments.total_payments_amount) : 0,
        completed_orders: parseInt(orders.completed_orders) || 0,
        completed_orders_amount: orders.completed_orders_amount ? parseFloat(orders.completed_orders_amount) : 0
      };
    });

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error fetching users admin list', details: e.message });
  }
};

// --- UPDATE USER TYPE (admin/superadmin) ---
exports.updateType = async (req, res) => {
  try {
    const user_id = req.params.id;
    const { user_type } = req.body;
    if (!user_type) return res.status(400).json({ error: 'user_type is required' });

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.user_type = user_type;
    await user.save();

    res.json({ success: true, user_id: user.user_id, user_type: user.user_type });
  } catch (e) {
    res.status(500).json({ error: 'Error updating user type', details: e.message });
  }
};

// --- OBTENER TODOS LOS USUARIOS (ADMIN/SUPERADMIN) ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// --- OBTENER USUARIO POR ID ---
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// --- ACTUALIZAR USUARIO ---
exports.updateUser = async (req, res) => {
  try {
    const { username, email, user_type, balance, country, phone, full_name } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (email) user.email = email.trim().toLowerCase();
    if (username) user.username = username;
    if (user_type) user.user_type = user_type;
    if (typeof balance !== 'undefined') user.balance = balance;
    if (typeof country !== 'undefined') user.country = country;
    if (typeof phone !== 'undefined') user.phone = phone;
    if (typeof full_name !== 'undefined') user.full_name = full_name;

    await user.save();

    res.json({ message: 'Usuario actualizado', user });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// --- ELIMINAR USUARIO ---
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await user.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// --- REQUEST PASSWORD RESET ---
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.json({ message: 'Si el email existe, se enviará un código de recuperación.' });
    }

    const reset_code = Math.floor(100000 + Math.random() * 900000).toString();
    const reset_code_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    user.reset_code = reset_code;
    user.reset_code_expires = reset_code_expires;
    await user.save();

    await sendMail({
      to: user.email,
      type: 'password_reset',
      data: { code: reset_code }
    });

    res.json({ message: 'Si el email existe, se enviará un código de recuperación.' });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    res.status(500).json({ error: 'Error al solicitar recuperación de contraseña' });
  }
};

// --- RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ error: 'Email, código y nueva contraseña requeridos' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user || !user.reset_code || !user.reset_code_expires) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    if (
      user.reset_code !== code ||
      new Date() > user.reset_code_expires
    ) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    user.password_hash = await bcrypt.hash(new_password, 10);
    user.reset_code = null;
    user.reset_code_expires = null;
    await user.save();

    res.json({ message: 'Contraseña cambiada correctamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};

// --- VERIFICAR EMAIL ---
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ error: 'Email y código son requeridos' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (
      !user ||
      !user.email_verification_code ||
      !user.email_verification_expires
    ) {
      return res.status(400).json({ error: 'No existe proceso de verificación pendiente para este usuario' });
    }

    if (
      user.email_verification_code !== code ||
      new Date() > user.email_verification_expires
    ) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    user.email_verified = true;
    user.email_verification_code = null;
    user.email_verification_expires = null;
    user.user_type = 'registered';
    await user.save();

    res.json({ message: 'Correo verificado correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    res.status(500).json({ error: 'Error al verificar el correo' });
  }
};

// --- REENVIAR VERIFICACIÓN EMAIL ---
exports.resendVerificationEmail = async (req, res) => {
  try {
    const email = (req.body.email || req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'Si el email existe, se reenviará el código de verificación.' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'El correo ya está verificado.' });
    }

    const new_code = Math.floor(100000 + Math.random() * 900000).toString();
    const new_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.email_verification_code = new_code;
    user.email_verification_expires = new_expires;
    await user.save();

    await sendMail({
      to: user.email,
      type: 'verification',
      data: { code: new_code }
    });

    res.json({ message: 'Si el email existe, se reenviará el código de verificación.' });
  } catch (error) {
    console.error('Error en resendVerificationEmail:', error);
    res.status(500).json({ error: 'Error al reenviar código de verificación' });
  }
};

// --- RECARGA MANUAL (NOT IMPLEMENTED) ---
exports.rechargeUserBalance = async (req, res) => {
  try {
    return res.status(501).json({ error: 'Not implemented yet' });
  } catch (error) {
    console.error('Error en rechargeUserBalance:', error);
    res.status(500).json({ error: 'Error al recargar balance' });
  }
};

// --- CAMBIAR PASSWORD AUTENTICADO ---
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Faltan campos.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.password_hash = newHash;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo cambiar la contraseña.' });
  }
};