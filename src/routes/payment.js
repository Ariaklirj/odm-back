const { Router } = require('express');
const { createCharge } = require('../controllers/paymentController');

const router = Router();

router.post('/charge', createCharge);

module.exports = router;
