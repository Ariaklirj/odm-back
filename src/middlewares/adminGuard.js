const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_ROLES = ['superAdmin', 'root'];

/**
 * Allows access if:
 *  1. x-root-key header matches ROOT_SECRET_KEY env var, OR
 *  2. A valid JWT with role superAdmin or root is provided.
 */
function adminGuard(req, res, next) {
  const rootKey = req.headers['x-root-key'];
  if (rootKey && rootKey === process.env.ROOT_SECRET_KEY) {
    req.user = { role: 'root' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso no autorizado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!ADMIN_ROLES.includes(payload.role)) {
      return res.status(403).json({ message: 'Permisos insuficientes.' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}

module.exports = adminGuard;
