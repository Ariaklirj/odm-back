const { Router } = require('express');
const inscriptionRouter = require('./inscription');
const paymentRouter = require('./payment');
const authRouter = require('./auth');
const degreeRouter = require('./degree');
const tsuRouter = require('./tsu');
const masterDegreeRouter = require('./masterDegree');
const specialityRouter = require('./speciality');
const bachilleratoRouter = require('./bachillerato');
const adminRouter = require('./admin');
const statsRouter = require('./stats');
const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/inscription', inscriptionRouter);
router.use('/payment', paymentRouter);
router.use('/auth', authRouter);
router.use('/degrees', degreeRouter);
router.use('/tsu', tsuRouter);
router.use('/master-degrees', masterDegreeRouter);
router.use('/specialities', specialityRouter);
router.use('/bachillerato', bachilleratoRouter);
router.use('/admin', adminRouter);
router.use('/stats', statsRouter);

module.exports = router;
