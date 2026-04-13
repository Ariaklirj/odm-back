const { Schema, model, Types } = require('mongoose');

const paymentRecordSchema = new Schema(
  {
    monthNumber: { type: Number, required: true },   // mensualidad #1, #2, #3…
    paidAt:      { type: Date,   required: true, default: Date.now },
    amount:      { type: Number, required: true },
    reference:   { type: String, trim: true, default: '' }, // folio / referencia opcional
  },
  { _id: true }
);

const userDataSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    motherLastName: {
      type: String,
      trim: true,
      default: null,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    career: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: String,
      required: true,
      trim: true,
    },
    planLabel: {
      type: String,
      required: true,
      trim: true,
    },
    planTotal: {
      type: Number,
      required: true,
    },
    planMonths: {
      type: Number,
      required: true,
    },
    planDiscount: {
      type: Number,
      required: true,
      default: 0,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    // Total de mensualidades que dura la carrera (se guarda al inscribirse)
    careerDurationMonths: {
      type: Number,
      default: 0,
    },
    // Mensualidades pagadas
    payments: {
      type: [paymentRecordSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('UserData', userDataSchema);
