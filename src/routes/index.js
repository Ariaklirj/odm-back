const { Router } = require('express');
const inscriptionRouter = require('./inscription');
const paymentRouter = require('./payment');
const authRouter = require('./auth');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/inscription', inscriptionRouter);
router.use('/payment', paymentRouter);
router.use('/auth', authRouter);

module.exports = router;
