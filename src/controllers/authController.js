const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const UserData = require('../models/UserData');
const UserBankAccount = require('../models/UserBankAccount');
const Degree = require('../models/Degree');
const TSU = require('../models/TSU');
const MasterDegree = require('../models/MasterDegree');
const Speciality = require('../models/Speciality');
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

// GET /api/auth/me  — requires Bearer JWT
async function getMe(req, res, next) {
  try {
    const userData = await UserData.findOne({ userId: req.user.user_id }).lean();
    if (!userData) {
      return res.status(404).json({ message: 'Perfil de alumno no encontrado.' });
    }

    // Enrich career name from any program collection
    let careerName = userData.career;
    let careerType = null;
    if (mongoose.Types.ObjectId.isValid(userData.career)) {
      const [d, t, m, s] = await Promise.all([
        Degree.findById(userData.career, 'name type').lean(),
        TSU.findById(userData.career, 'name type').lean(),
        MasterDegree.findById(userData.career, 'name type').lean(),
        Speciality.findById(userData.career, 'name type').lean(),
      ]);
      const prog = d || t || m || s;
      if (prog) { careerName = prog.name; careerType = prog.type; }
    }

    // Payment summary
    const paidSet = new Set(userData.payments.map((p) => p.monthNumber));
    const total = userData.careerDurationMonths || 0;
    const pendingMonths = Array.from({ length: total }, (_, i) => i + 1).filter(
      (m) => !paidSet.has(m)
    );

    // Payment method (from UserBankAccount if it exists)
    const paymentMethod = await UserBankAccount.findOne(
      { userDataId: userData._id },
      'last4 brand holderName bankName cardType expirationMonth expirationYear installments amount'
    ).lean();

    return res.json({
      success: true,
      data: {
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          motherLastName: userData.motherLastName,
          email: userData.email,
          phone: userData.phone,
          birthDate: userData.birthDate,
        },
        enrollment: {
          career: userData.career,
          careerName,
          careerType,
          plan: userData.plan,
          planLabel: userData.planLabel,
          planTotal: userData.planTotal,
          planMonths: userData.planMonths,
          planDiscount: userData.planDiscount,
          careerDurationMonths: userData.careerDurationMonths,
          enrolledAt: userData.createdAt,
        },
        payments: userData.payments,
        paymentSummary: {
          total,
          paid: userData.payments.length,
          pending: pendingMonths.length,
          pendingMonths,
        },
        paymentMethod: paymentMethod || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, getMe };
