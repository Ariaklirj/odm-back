const { Router } = require('express');
const adminGuard = require('../middlewares/adminGuard');
const { getInscriptionStats, getStudents, getCareerRanking } = require('../controllers/statsController');

const router = Router();

router.use(adminGuard);

router.get('/inscriptions', getInscriptionStats);
router.get('/students', getStudents);
router.get('/careers', getCareerRanking);

module.exports = router;
