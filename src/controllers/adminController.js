const User = require('../models/User');
const UserData = require('../models/UserData');
const UserBankAccount = require('../models/UserBankAccount');
const Degree = require('../models/Degree');
const TSU = require('../models/TSU');
const MasterDegree = require('../models/MasterDegree');
const Speciality = require('../models/Speciality');
const { encrypt } = require('../utils/cryptoHelper');

/* ── Fake data pools ── */
const FIRST_NAMES = [
  'Sofía','Valentina','Camila','Isabella','Valeria',
  'Mariana','Fernanda','Daniela','Gabriela','Paola',
  'Santiago','Mateo','Sebastián','Emiliano','Diego',
  'Andrés','Carlos','Miguel','Alejandro','Luis',
  'Andrea','Lucía','Regina','Natalia','Karla',
  'Ricardo','Eduardo','Fernando','Jorge','Arturo',
];
const LAST_NAMES = [
  'García','Martínez','López','González','Hernández',
  'Pérez','Sánchez','Ramírez','Torres','Flores',
  'Rivera','Morales','Jiménez','Reyes','Gutiérrez',
  'Cruz','Vargas','Mendoza','Castillo','Ramos',
  'Vega','Medina','Aguilar','Ortega','Delgado',
  'Herrera','Ruiz','Romero','Navarro','Salinas',
];
const PLANS = [
  { plan: 'mensual',       planLabel: 'Plan Mensual',       planTotal: 3500,  planMonths: 1,  planDiscount: 0  },
  { plan: 'cuatrimestral', planLabel: 'Plan Cuatrimestral', planTotal: 10500, planMonths: 4,  planDiscount: 0  },
  { plan: 'beca_25',       planLabel: 'Beca 25%',           planTotal: 2625,  planMonths: 1,  planDiscount: 25 },
  { plan: 'beca_50',       planLabel: 'Beca 50%',           planTotal: 1750,  planMonths: 1,  planDiscount: 50 },
  { plan: 'beca_65',       planLabel: 'Beca 65%',           planTotal: 1225,  planMonths: 1,  planDiscount: 65 },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomDate(monthsBack = 12) {
  const now = Date.now();
  const from = now - monthsBack * 30 * 24 * 60 * 60 * 1000;
  return new Date(from + Math.random() * (now - from));
}

function randomPhone() {
  return `55${String(Math.floor(Math.random() * 90000000) + 10000000)}`;
}

function randomBirthDate() {
  const year = 1975 + Math.floor(Math.random() * 30); // 1975–2004
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

const SEED_PASSWORD = 'Odm2026!';
const CARD_BRANDS_SEED = ['visa', 'mastercard'];
const BANK_NAMES_SEED = ['BBVA', 'Banamex', 'Santander', 'HSBC', 'Banorte'];

// Durations in months per program type (approximate)
const DURATION_BY_TYPE = {
  tsu:        18,
  degree:     36,
  master:     24,
  speciality: 12,
};

function buildSamplePayments(careerDurationMonths, enrolledAt, planTotal) {
  // Pay between 0 and (months since enrollment) consecutive mensualidades
  const monthsSinceEnroll = Math.max(
    0,
    Math.floor((Date.now() - enrolledAt.getTime()) / (30 * 24 * 60 * 60 * 1000))
  );
  const maxPaid = Math.min(monthsSinceEnroll, careerDurationMonths);
  const paid = Math.floor(Math.random() * (maxPaid + 1));
  return Array.from({ length: paid }, (_, i) => ({
    monthNumber: i + 1,
    amount: planTotal,
    paidAt: new Date(enrolledAt.getTime() + i * 30 * 24 * 60 * 60 * 1000),
    reference: '',
  }));
}

// POST /api/admin/seed-inscriptions
const seedInscriptions = async (req, res, next) => {
  try {
    const body = req.body || {};
    const count = Math.min(Number(body.count) || 60, 300);
    const clear = body.clear === true;

    if (clear) {
      await UserData.deleteMany({});
    }

    // Collect all active programs from every collection
    const [degrees, tsus, masters, specialities] = await Promise.all([
      Degree.find({ isActive: true }, '_id name').lean(),
      TSU.find({ isActive: true }, '_id name').lean(),
      MasterDegree.find({ isActive: true }, '_id name').lean(),
      Speciality.find({ isActive: true }, '_id name').lean(),
    ]);

    const programs = [
      ...degrees.map((d) => ({ id: d._id.toString(), type: 'degree' })),
      ...tsus.map((d) => ({ id: d._id.toString(), type: 'tsu' })),
      ...masters.map((d) => ({ id: d._id.toString(), type: 'master' })),
      ...specialities.map((d) => ({ id: d._id.toString(), type: 'speciality' })),
    ];

    if (programs.length === 0) {
      return res.status(422).json({ message: 'No hay programas activos. Crea al menos uno antes de sembrar datos.' });
    }

    const docs = Array.from({ length: count }, (_, i) => {
      const firstName = pick(FIRST_NAMES);
      const lastName  = pick(LAST_NAMES);
      const mother    = pick(LAST_NAMES);
      const planData  = pick(PLANS);
      const createdAt = randomDate(12);
      const program   = pick(programs);
      const careerDurationMonths = DURATION_BY_TYPE[program.type] || 36;
      const payments  = buildSamplePayments(careerDurationMonths, createdAt, planData.planTotal);
      return {
        firstName,
        lastName,
        motherLastName: mother,
        birthDate: randomBirthDate(),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: randomPhone(),
        career: program.id,
        ...planData,
        emailVerified: Math.random() > 0.3,
        verificationToken: null,
        careerDurationMonths,
        payments,
        createdAt,
        updatedAt: createdAt,
      };
    });

    const insertedData = await UserData.insertMany(docs, { timestamps: false });

    // ── Create User accounts for all seeded students ──────────────────────────
    const userDocs = insertedData.map((d) => ({
      email: d.email,
      username: d.email,
      password: encrypt(SEED_PASSWORD),
      role: 'user',
    }));
    let insertedUsers = [];
    try {
      insertedUsers = await User.insertMany(userDocs, { ordered: false });
    } catch (e) {
      insertedUsers = e.insertedDocs || [];
    }

    // Map email → userId
    const userEmailMap = {};
    for (const u of insertedUsers) { userEmailMap[u.email] = u._id; }

    // Link userId on UserData documents
    await Promise.all(
      insertedData
        .filter((d) => userEmailMap[d.email])
        .map((d) =>
          UserData.updateOne({ _id: d._id }, { $set: { userId: userEmailMap[d.email] } })
        )
    );

    // ── Create fake UserBankAccount for ~65 % of students ────────────────────
    const now = Date.now();
    const bankDocs = insertedData
      .filter((d) => userEmailMap[d.email] && Math.random() > 0.35)
      .map((d) => ({
        userDataId: d._id,
        userId: userEmailMap[d.email],
        openpayCustomerId: `cust_seed_${d._id}`,
        openpayCardId: `card_seed_${d._id}`,
        openpayChargeId: `ch_seed_${d._id}`,
        orderId: `odm-seed-${d._id}-${now}`,
        last4: String(1000 + Math.floor(Math.random() * 9000)),
        brand: pick(CARD_BRANDS_SEED),
        holderName: `${d.firstName.toUpperCase()} ${d.lastName.toUpperCase()}`,
        bankName: pick(BANK_NAMES_SEED),
        cardType: 'debit',
        expirationMonth: String(1 + Math.floor(Math.random() * 12)).padStart(2, '0'),
        expirationYear: String(26 + Math.floor(Math.random() * 5)),
        amount: d.planTotal,
        installments: pick([1, 3, 6, 12]),
        status: 'completed',
        authorization: `AUTH${Math.floor(100000 + Math.random() * 900000)}`,
      }));
    try {
      await UserBankAccount.insertMany(bankDocs, { ordered: false });
    } catch (e) { /* ignore orderId conflicts */ }

    return res.status(201).json({
      success: true,
      inserted: insertedData.length,
      usersCreated: insertedUsers.length,
      cleared: clear,
      seedPassword: SEED_PASSWORD,
    });
  } catch (error) {
    next(error);
  }
};

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

module.exports = { createSuperAdmin, seedInscriptions };
