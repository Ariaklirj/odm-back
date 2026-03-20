const User = require('../models/User');
const { encrypt } = require('../utils/cryptoHelper');

// POST /api/admin/super-admin
const createSuperAdmin = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'email, username y password son requeridos.' });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase().trim() }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email o username.' });
    }

    const user = await User.create({
      email: email.toLowerCase().trim(),
      username,
      password: encrypt(password),
      role: 'superAdmin',
    });

    return res.status(201).json({
      success: true,
      data: { _id: user._id, email: user.email, username: user.username, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSuperAdmin };
