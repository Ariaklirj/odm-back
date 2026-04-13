const mongoose = require('mongoose');
const UserData = require('../models/UserData');
const Degree = require('../models/Degree');
const TSU = require('../models/TSU');
const MasterDegree = require('../models/MasterDegree');
const Speciality = require('../models/Speciality');

async function buildProgramMap(ids) {
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) return {};
  const [degrees, tsus, masters, specialities] = await Promise.all([
    Degree.find({ _id: { $in: validIds } }, '_id name type').lean(),
    TSU.find({ _id: { $in: validIds } }, '_id name type').lean(),
    MasterDegree.find({ _id: { $in: validIds } }, '_id name type').lean(),
    Speciality.find({ _id: { $in: validIds } }, '_id name type').lean(),
  ]);
  return Object.fromEntries(
    [...degrees, ...tsus, ...masters, ...specialities].map((p) => [
      p._id.toString(),
      { name: p.name, type: p.type },
    ])
  );
}

/**
 * Build a match filter from query params.
 * Supported: dateFrom, dateTo (ISO strings), career (degree _id or string)
 */
function buildMatch({ dateFrom, dateTo, career }) {
  const match = {};

  if (dateFrom || dateTo) {
    match.createdAt = {};
    if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  if (career) {
    match.career = career;
  }

  return match;
}

// GET /api/stats/inscriptions
// Query: dateFrom, dateTo, career
// Returns: { total, byPlan, byMonth }
const getInscriptionStats = async (req, res, next) => {
  try {
    const match = buildMatch(req.query);

    const [totals, byPlan, byMonth] = await Promise.all([
      UserData.countDocuments(match),

      UserData.aggregate([
        { $match: match },
        { $group: { _id: '$planLabel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, plan: '$_id', count: 1 } },
      ]),

      UserData.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            count: 1,
          },
        },
      ]),
    ]);

    return res.json({ success: true, data: { total: totals, byPlan, byMonth } });
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/students
// Query: dateFrom, dateTo, career, page (default 1), limit (default 20)
// Returns paginated student list
const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const match = buildMatch(req.query);

    const [students, total] = await Promise.all([
      UserData.find(match)
        .select('firstName lastName motherLastName email phone career planLabel planTotal planDiscount emailVerified createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      UserData.countDocuments(match),
    ]);

    const programIds = [...new Set(students.map((s) => s.career))];
    const programMap = await buildProgramMap(programIds);

    const enriched = students.map((s) => ({
      ...s,
      careerName: programMap[s.career]?.name || s.career,
    }));

    return res.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/careers
// Returns careers ranked by number of inscriptions
const getCareerRanking = async (req, res, next) => {
  try {
    const match = buildMatch(req.query);

    const ranking = await UserData.aggregate([
      { $match: match },
      { $group: { _id: '$career', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const programMap = await buildProgramMap(ranking.map((r) => r._id));

    const enriched = ranking.map((r) => ({
      career: r._id,
      careerName: programMap[r._id]?.name || r._id,
      careerType: programMap[r._id]?.type || null,
      count: r.count,
    }));

    return res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/students/:id
// Returns student detail + computed payment status (paid / pending mensualidades)
const getStudentById = async (req, res, next) => {
  try {
    const student = await UserData.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Alumno no encontrado.' });

    const programMap = await buildProgramMap([student.career]);
    const careerInfo = programMap[student.career] || {};

    const paidSet = new Set(student.payments.map((p) => p.monthNumber));
    const total = student.careerDurationMonths || 0;
    const pendingMonths = Array.from({ length: total }, (_, i) => i + 1).filter(
      (m) => !paidSet.has(m)
    );

    return res.json({
      success: true,
      data: {
        ...student,
        careerName: careerInfo.name || student.career,
        careerType: careerInfo.type || null,
        paymentSummary: {
          total,
          paid: student.payments.length,
          pending: pendingMonths.length,
          pendingMonths,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stats/students/:id/payments
// Body: { monthNumber, amount, paidAt?, reference? }
const addStudentPayment = async (req, res, next) => {
  try {
    const { monthNumber, amount, paidAt, reference } = req.body;

    if (!monthNumber || !amount) {
      return res.status(400).json({ message: 'monthNumber y amount son requeridos.' });
    }

    const student = await UserData.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Alumno no encontrado.' });

    // Avoid duplicate month entries
    const alreadyPaid = student.payments.some((p) => p.monthNumber === Number(monthNumber));
    if (alreadyPaid) {
      return res.status(409).json({ message: `La mensualidad #${monthNumber} ya fue registrada.` });
    }

    student.payments.push({
      monthNumber: Number(monthNumber),
      amount: Number(amount),
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      reference: reference || '',
    });

    await student.save();

    const paidSet = new Set(student.payments.map((p) => p.monthNumber));
    const total = student.careerDurationMonths || 0;
    const pendingMonths = Array.from({ length: total }, (_, i) => i + 1).filter(
      (m) => !paidSet.has(m)
    );

    return res.status(201).json({
      success: true,
      payments: student.payments,
      paymentSummary: {
        total,
        paid: student.payments.length,
        pending: pendingMonths.length,
        pendingMonths,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/stats/students/:id/payments/:paymentId
const removeStudentPayment = async (req, res, next) => {
  try {
    const student = await UserData.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Alumno no encontrado.' });

    const before = student.payments.length;
    student.payments = student.payments.filter(
      (p) => p._id.toString() !== req.params.paymentId
    );

    if (student.payments.length === before) {
      return res.status(404).json({ message: 'Pago no encontrado.' });
    }

    await student.save();

    return res.json({ success: true, payments: student.payments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInscriptionStats,
  getStudents,
  getCareerRanking,
  getStudentById,
  addStudentPayment,
  removeStudentPayment,
};
