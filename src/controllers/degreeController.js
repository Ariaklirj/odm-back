const Degree = require('../models/Degree');

// GET /api/degrees/list
const listDegrees = async (req, res, next) => {
  try {
    const degrees = await Degree.find({ isActive: true }, '_id name slug bannerImageS3').sort({ name: 1 });
    return res.status(200).json({ success: true, data: degrees });
  } catch (error) {
    next(error);
  }
};

// GET /api/degrees
const getAllDegrees = async (req, res, next) => {
  try {
    const { type, active } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';

    const degrees = await Degree.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: degrees });
  } catch (error) {
    next(error);
  }
};

// GET /api/degrees/:id
const getDegreeById = async (req, res, next) => {
  try {
    const degree = await Degree.findById(req.params.id);
    if (!degree) {
      return res.status(404).json({ message: 'Degree not found.' });
    }
    return res.status(200).json({ success: true, data: degree });
  } catch (error) {
    next(error);
  }
};

// GET /api/degrees/slug/:slug
const getDegreeBySlug = async (req, res, next) => {
  try {
    const degree = await Degree.findOne({ slug: req.params.slug });
    if (!degree) {
      return res.status(404).json({ message: 'Degree not found.' });
    }
    return res.status(200).json({ success: true, data: degree });
  } catch (error) {
    next(error);
  }
};

// POST /api/degrees
const createDegree = async (req, res, next) => {
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

    const existing = await Degree.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: 'A degree with this slug already exists.' });
    }

    const degree = await Degree.create({
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

    return res.status(201).json({ success: true, data: degree });
  } catch (error) {
    next(error);
  }
};

// PUT /api/degrees/:id
const updateDegree = async (req, res, next) => {
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
      const existing = await Degree.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'A degree with this slug already exists.' });
      }
    }

    const degree = await Degree.findByIdAndUpdate(
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

    if (!degree) {
      return res.status(404).json({ message: 'Degree not found.' });
    }

    return res.status(200).json({ success: true, data: degree });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/degrees/:id
const deleteDegree = async (req, res, next) => {
  try {
    const degree = await Degree.findByIdAndDelete(req.params.id);
    if (!degree) {
      return res.status(404).json({ message: 'Degree not found.' });
    }
    return res.status(200).json({ success: true, message: 'Degree deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDegrees,
  getAllDegrees,
  getDegreeById,
  getDegreeBySlug,
  createDegree,
  updateDegree,
  deleteDegree,
};
