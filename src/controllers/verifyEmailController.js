const crypto = require('crypto');
const UserData = require('../models/UserData');

const verifyEmail = async (req, res, next) => {
  try {
    const { id, token } = req.body;

    if (!id || !token) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos.' });
    }

    const userData = await UserData.findById(id);

    if (!userData) {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }

    if (userData.emailVerified) {
      return res.status(200).json({ success: true, alreadyVerified: true });
    }

    if (userData.verificationToken !== token) {
      return res.status(400).json({ message: 'Token de verificación inválido.' });
    }

    userData.emailVerified = true;
    userData.verificationToken = crypto.randomUUID();
    await userData.save();

    return res.status(200).json({ success: true, alreadyVerified: false });
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyEmail };
