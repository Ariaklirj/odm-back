const UserData = require('../models/UserData');
const User = require('../models/User');
const UserBankAccount = require('../models/UserBankAccount');
const openpayClient = require('../utils/openpayClient');
const { encrypt } = require('../utils/cryptoHelper');
const generatePassword = require('../utils/generatePassword');
const buildWelcomeEmail = require('../utils/buildWelcomeEmail');
const transporter = require('../config/mailer');

const VALID_INSTALLMENTS = [3, 6, 12];

const createCharge = async (req, res, next) => {
  try {
    const { userDataId, tokenId, deviceSessionId, installments } = req.body;

    if (!userDataId || !tokenId || !deviceSessionId) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    const months = Number(installments);
    if (!VALID_INSTALLMENTS.includes(months)) {
      return res
        .status(400)
        .json({ message: 'Selecciona 3, 6 o 12 meses sin intereses.' });
    }

    const userData = await UserData.findById(userDataId);
    if (!userData) {
      return res
        .status(404)
        .json({ message: 'Registro de inscripción no encontrado.' });
    }

    if (!userData.emailVerified) {
      return res
        .status(400)
        .json({ message: 'El correo electrónico no ha sido verificado.' });
    }

    // Idempotency — one charge per inscription
    const existingCharge = await UserBankAccount.findOne({ userDataId });
    if (existingCharge) {
      return res
        .status(409)
        .json({ message: 'Este proceso de inscripción ya cuenta con un pago registrado.' });
    }

    const orderId = `odm-${userDataId}-${Date.now()}`;

    // 1. Create OpenPay customer
    const { data: customer } = await openpayClient.post('/customers', {
      name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone_number: userData.phone,
      requires_account: false,
    });

    // 2. Add card via token
    const { data: card } = await openpayClient.post(
      `/customers/${customer.id}/cards`,
      { token_id: tokenId, device_session_id: deviceSessionId }
    );

    // 3. Create charge
    const chargePayload = {
      source_id: card.id,
      method: 'card',
      amount: userData.planTotal,
      currency: 'MXN',
      description: `Inscripción ODM — ${userData.planLabel}`,
      order_id: orderId,
      device_session_id: deviceSessionId,
      payment_plan: { payments: months },
    };

    const { data: charge } = await openpayClient.post(
      `/customers/${customer.id}/charges`,
      chargePayload
    );

    // Extract safe card metadata from response
    const cardMeta = charge.card || card;
    const maskedNumber = cardMeta.card_number || '';
    const last4 = maskedNumber.replace(/[^0-9]/g, '').slice(-4);

    // 4. Persist UserBankAccount
    const bankAccount = await UserBankAccount.create({
      userDataId: userData._id,
      openpayCustomerId: customer.id,
      openpayCardId: card.id,
      openpayChargeId: charge.id,
      orderId,
      last4,
      brand: cardMeta.brand || '',
      holderName: cardMeta.holder_name || '',
      bankName: cardMeta.bank_name || '',
      cardType: cardMeta.type || '',
      expirationMonth: cardMeta.expiration_month || '',
      expirationYear: cardMeta.expiration_year || '',
      amount: charge.amount,
      installments: months,
      status: 'completed',
      authorization: charge.authorization || '',
    });

    // 5. Create auth User (password stored AES-encrypted for recovery)
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      const rawPassword = generatePassword();
      const passwordEncrypted = encrypt(rawPassword);

      user = await User.create({
        email: userData.email,
        username: userData.email,
        password: passwordEncrypted,
      });

      bankAccount.userId = user._id;
      await bankAccount.save();

      userData.userId = user._id;
      await userData.save();

      const portalUrl = `${process.env.FRONTEND_BASE_URL}/portal`;
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: userData.email,
        subject: '🎉 Bienvenido(a) a ODM | Acceso a tu portal académico',
        html: buildWelcomeEmail(userData.firstName, userData.email, rawPassword, portalUrl),
      });
    }

    return res.status(201).json({
      success: true,
      chargeId: charge.id,
      last4,
      brand: cardMeta.brand || '',
    });
  } catch (error) {
    if (error.response?.data) {
      const { error_code: code, description } = error.response.data;

      if (code === 3005) {
        return res
          .status(409)
          .json({ message: 'Este pago ya fue procesado anteriormente.' });
      }

      const CARD_ERRORS = {
        3001: 'Tarjeta declinada. Intenta con otra tarjeta.',
        3002: 'Tarjeta vencida.',
        3003: 'Fondos insuficientes.',
        3006: 'Esta tarjeta no soporta meses sin intereses. Selecciona otra opción.',
        3009: 'Tarjeta reportada como robada o extraviada.',
        2004: 'Código de seguridad (CVV) inválido.',
      };

      if (CARD_ERRORS[code]) {
        return res.status(402).json({ message: CARD_ERRORS[code] });
      }

      return res
        .status(402)
        .json({ message: description || 'Error al procesar el pago.' });
    }

    next(error);
  }
};

module.exports = { createCharge };
