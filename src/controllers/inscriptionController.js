const crypto = require('crypto');
const UserData = require('../models/UserData');
const transporter = require('../config/mailer');
const buildVerificationEmail = require('../utils/buildVerificationEmail');

const createInscription = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      motherLastName,
      birthDate,
      email,
      phone,
      career,
      plan,
      planLabel,
      planTotal,
      planMonths,
      planDiscount,
    } = req.body;

    if (!firstName || !lastName || !birthDate || !email || !phone || !career || !plan || planTotal == null) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    const verificationToken = crypto.randomUUID();

    const userData = await UserData.create({
      firstName,
      lastName,
      motherLastName: motherLastName || null,
      birthDate,
      email,
      phone,
      career,
      plan,
      planLabel,
      planTotal,
      planMonths,
      planDiscount: planDiscount ?? 0,
      emailVerified: false,
      verificationToken,
    });

    const verificationUrl =
      `${process.env.BASE_FRONT_URL}/inscripcion/paso-3` +
      `?id=${userData._id}` +
      `&token=${verificationToken}` +
      `&plan=${encodeURIComponent(plan)}` +
      `&planLabel=${encodeURIComponent(planLabel)}` +
      `&planTotal=${planTotal}` +
      `&planMonths=${planMonths}` +
      `&planDiscount=${planDiscount ?? 0}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Confirma tu correo y continúa tu inscripción en ODM',
      html: buildVerificationEmail(firstName, verificationUrl),
    });

    return res.status(201).json({ success: true, userDataId: userData._id });
  } catch (error) {
    next(error);
  }
};

module.exports = { createInscription };
