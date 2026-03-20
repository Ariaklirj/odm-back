const mongoose = require('mongoose');
const UserData = require('../models/UserData');
const Degree = require('../models/Degree');

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

    // Try to enrich career field with degree name
    const degreeIds = [
      ...new Set(
        students
          .map((s) => s.career)
          .filter((c) => mongoose.Types.ObjectId.isValid(c))
      ),
    ];

    let degreeMap = {};
    if (degreeIds.length) {
      const degrees = await Degree.find({ _id: { $in: degreeIds } }).select('_id name').lean();
      degreeMap = Object.fromEntries(degrees.map((d) => [d._id.toString(), d.name]));
    }

    const enriched = students.map((s) => ({
      ...s,
      careerName: degreeMap[s.career] || s.career,
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

    // Enrich with degree names
    const degreeIds = ranking
      .map((r) => r._id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    let degreeMap = {};
    if (degreeIds.length) {
      const degrees = await Degree.find({ _id: { $in: degreeIds } }).select('_id name type').lean();
      degreeMap = Object.fromEntries(degrees.map((d) => [d._id.toString(), { name: d.name, type: d.type }]));
    }

    const enriched = ranking.map((r) => ({
      career: r._id,
      careerName: degreeMap[r._id]?.name || r._id,
      careerType: degreeMap[r._id]?.type || null,
      count: r.count,
    }));

    return res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInscriptionStats, getStudents, getCareerRanking };
