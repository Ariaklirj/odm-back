const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { decrypt } = require('../utils/cryptoHelper');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  let decryptedPassword;
  try {
    decryptedPassword = decrypt(user.password);
  } catch {
    return res.status(500).json({ message: 'Error interno al verificar credenciales.' });
  }

  if (decryptedPassword !== password) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  const token = jwt.sign(
    { user_id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.json({ token, user_id: user._id, role: user.role });
}

module.exports = { login };
