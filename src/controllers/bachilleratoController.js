const Bachillerato = require('../models/Bachillerato');

// GET /api/bachillerato/list
const listBachilleratos = async (req, res, next) => {
  try {
    const items = await Bachillerato.find({ isActive: true }, '_id name slug bannerImageS3').sort({ name: 1 });
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// GET /api/bachillerato
const getAllBachilleratos = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    const items = await Bachillerato.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// GET /api/bachillerato/:id
const getBachilleratoById = async (req, res, next) => {
  try {
    const item = await Bachillerato.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Bachillerato not found.' });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// GET /api/bachillerato/slug/:slug
const getBachilleratoBySlug = async (req, res, next) => {
  try {
    const item = await Bachillerato.findOne({ slug: req.params.slug });
    if (!item) return res.status(404).json({ message: 'Bachillerato not found.' });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// POST /api/bachillerato
const createBachillerato = async (req, res, next) => {
  try {
    const {
      slug, type, name, bannerImageS3,
      heroHighlights, platformDescription, learningObjects,
      targetAudience, lms, generalInfo, costs,
    } = req.body;

    if (!slug || !type || !name) {
      return res.status(400).json({ message: 'slug, type and name are required.' });
    }

    const existing = await Bachillerato.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: 'A Bachillerato with this slug already exists.' });
    }

    const item = await Bachillerato.create({
      slug, type, name, bannerImageS3,
      heroHighlights, platformDescription, learningObjects,
      targetAudience, lms, generalInfo, costs,
    });

    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bachillerato/:id
const updateBachillerato = async (req, res, next) => {
  try {
    const {
      slug, type, name, bannerImageS3,
      heroHighlights, platformDescription, learningObjects,
      targetAudience, lms, generalInfo, costs, isActive,
    } = req.body;

    if (slug) {
      const existing = await Bachillerato.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'A Bachillerato with this slug already exists.' });
      }
    }

    const item = await Bachillerato.findByIdAndUpdate(
      req.params.id,
      {
        slug, type, name, bannerImageS3,
        heroHighlights, platformDescription, learningObjects,
        targetAudience, lms, generalInfo, costs, isActive,
      },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Bachillerato not found.' });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/bachillerato/:id
const deleteBachillerato = async (req, res, next) => {
  try {
    const item = await Bachillerato.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Bachillerato not found.' });
    return res.status(200).json({ success: true, message: 'Bachillerato deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBachilleratos,
  getAllBachilleratos,
  getBachilleratoById,
  getBachilleratoBySlug,
  createBachillerato,
  updateBachillerato,
  deleteBachillerato,
};
