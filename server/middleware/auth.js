const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Coloca este middleware en cualquier ruta que quieras proteger:
 *   router.get('/ruta-protegida', protect, controller)
 */
const protect = async (req, res, next) => {
  let token;

  // Busca el token en el header Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

/**
 * MIDDLEWARE DE ROL ADMIN
 * Úsalo después de protect para rutas solo de administrador:
 *   router.delete('/ruta-admin', protect, adminOnly, controller)
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: solo Administradores' });
  }
};

module.exports = { protect, adminOnly };
