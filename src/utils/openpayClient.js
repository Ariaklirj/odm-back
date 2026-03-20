const axios = require('axios');

const openpayClient = axios.create({
  baseURL: `${process.env.OPENPAY_API_URL}${process.env.OPENPAY_COMERCE_ID}`,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: process.env.OPENPAY_SECRET_KEY,
    password: '',
  },
  timeout: 30000,
});

module.exports = openpayClient;
