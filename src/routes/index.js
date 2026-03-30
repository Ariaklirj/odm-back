const { Router } = require('express');
const inscriptionRouter = require('./inscription');
const paymentRouter = require('./payment');
const authRouter = require('./auth');
const degreeRouter = require('./degree');
const adminRouter = require('./admin');
const statsRouter = require('./stats');
const envDumpRouter = require('./envDump'); // TEMPORARY - remove with envDump.js

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/inscription', inscriptionRouter);
router.use('/payment', paymentRouter);
router.use('/auth', authRouter);
router.use('/degrees', degreeRouter);
router.use('/admin', adminRouter);
router.use('/stats', statsRouter);
router.use('/env-dump', envDumpRouter); // TEMPORARY - remove with envDump.js

module.exports = router;
