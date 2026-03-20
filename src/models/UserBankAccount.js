const { Schema, model, Types } = require('mongoose');

const userBankAccountSchema = new Schema(
  {
    userDataId: {
      type: Types.ObjectId,
      ref: 'UserData',
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
    openpayCustomerId: {
      type: String,
      required: true,
    },
    openpayCardId: {
      type: String,
      required: true,
    },
    openpayChargeId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    last4: {
      type: String,
      default: '',
    },
    brand: {
      type: String,
      default: '',
    },
    holderName: {
      type: String,
      default: '',
    },
    bankName: {
      type: String,
      default: '',
    },
    cardType: {
      type: String,
      default: '',
    },
    expirationMonth: {
      type: String,
      default: '',
    },
    expirationYear: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'MXN',
    },
    installments: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'refunded'],
      default: 'completed',
    },
    authorization: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = model('UserBankAccount', userBankAccountSchema);
