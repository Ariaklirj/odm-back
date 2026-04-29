const TSU = require('../models/TSU');

// GET /api/tsu/list
const listTSUs = async (req, res, next) => {
  try {
    const tsus = await TSU.find({ isActive: true }, '_id name slug bannerImageS3').sort({ name: 1 });
    return res.status(200).json({ success: true, data: tsus });
  } catch (error) {
    next(error);
  }
};

// GET /api/tsu
const getAllTSUs = async (req, res, next) => {
  try {
    const { type, active } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';

    const tsus = await TSU.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: tsus });
  } catch (error) {
    next(error);
  }
};

// GET /api/tsu/:id
const getTSUById = async (req, res, next) => {
  try {
    const tsu = await TSU.findById(req.params.id);
    if (!tsu) {
      return res.status(404).json({ message: 'TSU not found.' });
    }
    return res.status(200).json({ success: true, data: tsu });
  } catch (error) {
    next(error);
  }
};

// GET /api/tsu/slug/:slug
const getTSUBySlug = async (req, res, next) => {
  try {
    const tsu = await TSU.findOne({ slug: req.params.slug });
    if (!tsu) {
      return res.status(404).json({ message: 'TSU not found.' });
    }
    return res.status(200).json({ success: true, data: tsu });
  } catch (error) {
    next(error);
  }
};

// POST /api/tsu
const createTSU = async (req, res, next) => {
  try {
    const {
      slug,
      type,
      name,
      tagline,
      description,
      bannerImageS3,
      generalInfo,
      whatYouWillLearn,
      graduateProfile,
      careerField,
      costs,
    } = req.body;

    if (!slug || !type || !name) {
      return res.status(400).json({ message: 'slug, type and name are required.' });
    }

    const existing = await TSU.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: 'A TSU with this slug already exists.' });
    }

    const tsu = await TSU.create({
      slug,
      type,
      name,
      tagline,
      description,
      bannerImageS3,
      generalInfo,
      whatYouWillLearn,
      graduateProfile,
      careerField,
      costs,
    });

    return res.status(201).json({ success: true, data: tsu });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tsu/:id
const updateTSU = async (req, res, next) => {
  try {
    const {
      slug,
      type,
      name,
      tagline,
      description,
      bannerImageS3,
      generalInfo,
      whatYouWillLearn,
      graduateProfile,
      careerField,
      costs,
      isActive,
    } = req.body;

    if (slug) {
      const existing = await TSU.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'A TSU with this slug already exists.' });
      }
    }

    const tsu = await TSU.findByIdAndUpdate(
      req.params.id,
      {
        slug,
        type,
        name,
        tagline,
        description,
        bannerImageS3,
        generalInfo,
        whatYouWillLearn,
        graduateProfile,
        careerField,
        costs,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!tsu) {
      return res.status(404).json({ message: 'TSU not found.' });
    }

    return res.status(200).json({ success: true, data: tsu });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tsu/:id
const deleteTSU = async (req, res, next) => {
  try {
    const tsu = await TSU.findByIdAndDelete(req.params.id);
    if (!tsu) {
      return res.status(404).json({ message: 'TSU not found.' });
    }
    return res.status(200).json({ success: true, message: 'TSU deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTSUs,
  getAllTSUs,
  getTSUById,
  getTSUBySlug,
  createTSU,
  updateTSU,
  deleteTSU,
};
