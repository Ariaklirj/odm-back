const Speciality = require('../models/Speciality');

// GET /api/specialities/list
const listSpecialities = async (req, res, next) => {
  try {
    const specialities = await Speciality.find({ isActive: true }, '_id name slug bannerImageS3').sort({ name: 1 });
    return res.status(200).json({ success: true, data: specialities });
  } catch (error) {
    next(error);
  }
};

// GET /api/specialities
const getAllSpecialities = async (req, res, next) => {
  try {
    const { type, active } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';

    const specialities = await Speciality.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: specialities });
  } catch (error) {
    next(error);
  }
};

// GET /api/specialities/:id
const getSpecialityById = async (req, res, next) => {
  try {
    const speciality = await Speciality.findById(req.params.id);
    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found.' });
    }
    return res.status(200).json({ success: true, data: speciality });
  } catch (error) {
    next(error);
  }
};

// GET /api/specialities/slug/:slug
const getSpecialityBySlug = async (req, res, next) => {
  try {
    const speciality = await Speciality.findOne({ slug: req.params.slug });
    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found.' });
    }
    return res.status(200).json({ success: true, data: speciality });
  } catch (error) {
    next(error);
  }
};

// POST /api/specialities
const createSpeciality = async (req, res, next) => {
  try {
    const {
      slug,
      type,
      name,
      tagline,
      description,
      admissionProfile,
      bannerImageS3,
      generalInfo,
      whatYouWillLearn,
      curriculumStructure,
      graduateProfile,
      costs,
    } = req.body;

    if (!slug || !type || !name) {
      return res.status(400).json({ message: 'slug, type and name are required.' });
    }

    const existing = await Speciality.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: 'A speciality with this slug already exists.' });
    }

    const speciality = await Speciality.create({
      slug,
      type,
      name,
      tagline,
      description,
      admissionProfile,
      bannerImageS3,
      generalInfo,
      whatYouWillLearn,
      curriculumStructure,
      graduateProfile,
      costs,
    });

    return res.status(201).json({ success: true, data: speciality });
  } catch (error) {
    next(error);
  }
};

// PUT /api/specialities/:id
const updateSpeciality = async (req, res, next) => {
  try {
    const {
      slug,
      type,
      name,
      tagline,
      description,
      admissionProfile,
      bannerImageS3,
      generalInfo,
      whatYouWillLearn,
      curriculumStructure,
      graduateProfile,
      costs,
      isActive,
    } = req.body;

    if (slug) {
      const existing = await Speciality.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'A speciality with this slug already exists.' });
      }
    }

    const speciality = await Speciality.findByIdAndUpdate(
      req.params.id,
      {
        slug,
        type,
        name,
        tagline,
        description,
        admissionProfile,
        bannerImageS3,
        generalInfo,
        whatYouWillLearn,
        curriculumStructure,
        graduateProfile,
        costs,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found.' });
    }

    return res.status(200).json({ success: true, data: speciality });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/specialities/:id
const deleteSpeciality = async (req, res, next) => {
  try {
    const speciality = await Speciality.findByIdAndDelete(req.params.id);
    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found.' });
    }
    return res.status(200).json({ success: true, message: 'Speciality deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSpecialities,
  getAllSpecialities,
  getSpecialityById,
  getSpecialityBySlug,
  createSpeciality,
  updateSpeciality,
  deleteSpeciality,
};
