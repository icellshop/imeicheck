const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware de autenticación JWT con soporte para pedidos guest en imei-orders
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Permitir pedidos guest (sin token) SOLO en POST /api/imei-orders si viene guest_email
  if (
    req.method === 'POST' &&
    req.baseUrl === '/api/imei-orders' &&
    (req.path === '/' || req.path === '') &&
    req.body.guest_email
  ) {
    req.user = null; // Explicitamente guest
    return next();
  }

  // Para todas las demás rutas, requiere token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Busca el usuario en la base de datos y lo adjunta a req.user (INCLUYE CAMPOS EXTRAS)
    const user = await User.findByPk(decoded.user_id, {
      attributes: [
        'user_id',
        'username',
        'email',
        'full_name',
        'country',
        'phone',
        'user_type',
        'balance',
        'email_verified',
        'created_at',
        'updated_at'
      ]
    });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};