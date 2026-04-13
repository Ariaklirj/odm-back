const { Router } = require('express');
const adminGuard = require('../middlewares/adminGuard');
const { createSuperAdmin, seedInscriptions } = require('../controllers/adminController');

const router = Router();

router.post('/super-admin', adminGuard, createSuperAdmin);
router.post('/seed-inscriptions', adminGuard, seedInscriptions);

module.exports = router;
