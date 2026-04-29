const { Schema, model } = require('mongoose');

const heroHighlightSchema = new Schema(
  { value: { type: String, trim: true }, label: { type: String, trim: true } },
  { _id: false }
);

const targetAudienceSchema = new Schema(
  {
    description: { type: String, trim: true, default: '' },
    idealFor:    [{ type: String, trim: true }],
  },
  { _id: false }
);

const lmsSchema = new Schema(
  {
    name:        { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    features:    [{ type: String, trim: true }],
  },
  { _id: false }
);

const generalInfoSchema = new Schema(
  {
    duration:   { type: String, trim: true },
    schedule:   { type: String, trim: true },
    subjects:   { type: String, trim: true },
    graduation: { type: String, trim: true },
  },
  { _id: false }
);

const costsSchema = new Schema(
  {
    tuition:      { type: String, trim: true },
    enrollment:   { type: String, trim: true },
    reenrollment: { type: String, trim: true },
    graduation:   { type: String, trim: true },
  },
  { _id: false }
);

const bachilleratoSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    type: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    bannerImageS3:       { type: String, trim: true, default: '' },
    heroHighlights:      { type: [heroHighlightSchema], default: [] },
    platformDescription: { type: String, trim: true, default: '' },
    learningObjects:     { type: [String], default: [] },
    targetAudience:      { type: targetAudienceSchema, default: {} },
    lms:                 { type: lmsSchema, default: {} },
    generalInfo:         { type: generalInfoSchema, default: {} },
    costs:               { type: costsSchema, default: {} },
    isActive:            { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Bachillerato', bachilleratoSchema);
