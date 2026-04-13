const { Schema, model } = require('mongoose');

const learnAreaSchema = new Schema(
  {
    area: { type: String, required: true, trim: true },
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

const costsSchema = new Schema(
  {
    tuition: { type: String, trim: true },
    enrollment: { type: String, trim: true },
    reenrollment: { type: String, trim: true },
    graduation: { type: String, trim: true },
  },
  { _id: false }
);

const masterDegreeSchema = new Schema(
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
      type: [learnAreaSchema],
      default: [],
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

module.exports = model('MasterDegree', masterDegreeSchema);
