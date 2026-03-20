const { Router } = require('express');
const adminGuard = require('../middlewares/adminGuard');
const { createSuperAdmin } = require('../controllers/adminController');

const router = Router();

router.post('/super-admin', adminGuard, createSuperAdmin);

module.exports = router;
