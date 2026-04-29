const MasterDegree = require('../models/MasterDegree');

// GET /api/master-degrees/list
const listMasterDegrees = async (req, res, next) => {
  try {
    const masterDegrees = await MasterDegree.find({ isActive: true }, '_id name slug bannerImageS3').sort({ name: 1 });
    return res.status(200).json({ success: true, data: masterDegrees });
  } catch (error) {
    next(error);
  }
};

// GET /api/master-degrees
const getAllMasterDegrees = async (req, res, next) => {
  try {
    const { type, active } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';

    const masterDegrees = await MasterDegree.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: masterDegrees });
  } catch (error) {
    next(error);
  }
};

// GET /api/master-degrees/:id
const getMasterDegreeById = async (req, res, next) => {
  try {
    const masterDegree = await MasterDegree.findById(req.params.id);
    if (!masterDegree) {
      return res.status(404).json({ message: 'MasterDegree not found.' });
    }
    return res.status(200).json({ success: true, data: masterDegree });
  } catch (error) {
    next(error);
  }
};

// GET /api/master-degrees/slug/:slug
const getMasterDegreeBySlug = async (req, res, next) => {
  try {
    const masterDegree = await MasterDegree.findOne({ slug: req.params.slug });
    if (!masterDegree) {
      return res.status(404).json({ message: 'MasterDegree not found.' });
    }
    return res.status(200).json({ success: true, data: masterDegree });
  } catch (error) {
    next(error);
  }
};

// POST /api/master-degrees
const createMasterDegree = async (req, res, next) => {
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
      costs,
    } = req.body;

    if (!slug || !type || !name) {
      return res.status(400).json({ message: 'slug, type and name are required.' });
    }

    const existing = await MasterDegree.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: 'A master degree with this slug already exists.' });
    }

    const masterDegree = await MasterDegree.create({
      slug,
      type,
      name,
      tagline,
      description,
      bannerImageS3,
      generalInfo,
      whatYouWillLearn,
      graduateProfile,
      costs,
    });

    return res.status(201).json({ success: true, data: masterDegree });
  } catch (error) {
    next(error);
  }
};

// PUT /api/master-degrees/:id
const updateMasterDegree = async (req, res, next) => {
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
      costs,
      isActive,
    } = req.body;

    if (slug) {
      const existing = await MasterDegree.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'A master degree with this slug already exists.' });
      }
    }

    const masterDegree = await MasterDegree.findByIdAndUpdate(
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
        costs,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!masterDegree) {
      return res.status(404).json({ message: 'MasterDegree not found.' });
    }

    return res.status(200).json({ success: true, data: masterDegree });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/master-degrees/:id
const deleteMasterDegree = async (req, res, next) => {
  try {
    const masterDegree = await MasterDegree.findByIdAndDelete(req.params.id);
    if (!masterDegree) {
      return res.status(404).json({ message: 'MasterDegree not found.' });
    }
    return res.status(200).json({ success: true, message: 'MasterDegree deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMasterDegrees,
  getAllMasterDegrees,
  getMasterDegreeById,
  getMasterDegreeBySlug,
  createMasterDegree,
  updateMasterDegree,
  deleteMasterDegree,
};
