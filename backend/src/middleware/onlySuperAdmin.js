const onlySuperAdmin = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso solo para superadministradores' });
  }

  next();
};

module.exports = onlySuperAdmin;