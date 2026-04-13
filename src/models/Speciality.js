const { Schema, model } = require('mongoose');

const learnCategorySchema = new Schema(
  {
    category: { type: String, required: true, trim: true },
    subjects: [{ type: String, trim: true }],
  },
  { _id: false }
);

const generalInfoSchema = new Schema(
  {
    duration: { type: String, trim: true },
    schedule: { type: String, trim: true },
    subjects: { type: String, trim: true },
    graduation: [{ type: String, trim: true }],
  },
  { _id: false }
);

const curriculumGroupSchema = new Schema(
  {
    groupName: { type: String, trim: true },
    subjects: [{ type: String, trim: true }],
  },
  { _id: false }
);

const curriculumBlockSchema = new Schema(
  {
    label: { type: String, trim: true },
    note: { type: String, trim: true, default: '' },
    groups: [curriculumGroupSchema],
  },
  { _id: false }
);

const curriculumStructureSchema = new Schema(
  {
    mandatory: { type: curriculumBlockSchema, default: {} },
    elective: { type: curriculumBlockSchema, default: {} },
  },
  { _id: false }
);

const costsSchema = new Schema(
  {
    tuition: { type: String, trim: true },
    enrollment: { type: String, trim: true },
    reenrollment: { type: String, trim: true },
    graduation: { type: String, trim: true },
  },
  { _id: false }
);

const specialitySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    admissionProfile: {
      type: String,
      trim: true,
      default: '',
    },
    bannerImageS3: {
      type: String,
      trim: true,
      default: '',
    },
    generalInfo: {
      type: generalInfoSchema,
      default: {},
    },
    whatYouWillLearn: {
      type: [learnCategorySchema],
      default: [],
    },
    curriculumStructure: {
      type: curriculumStructureSchema,
      default: {},
    },
    graduateProfile: {
      type: [String],
      default: [],
    },
    costs: {
      type: costsSchema,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model('Speciality', specialitySchema);
