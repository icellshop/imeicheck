const onlyAdmin = (req, res, next) => {
  // Verifica que el usuario esté autenticado y tenga el rol adecuado
  if (!req.user || (req.user.user_type !== 'superadmin' && req.user.user_type !== 'admin')) {
    return res.status(403).json({ error: 'Acceso solo para administradores o superadministradores' });
  }
  next();
};

module.exports = onlyAdmin;