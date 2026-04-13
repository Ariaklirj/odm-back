const { Router } = require('express');
const adminGuard = require('../middlewares/adminGuard');
const {
  getInscriptionStats,
  getStudents,
  getCareerRanking,
  getStudentById,
  addStudentPayment,
  removeStudentPayment,
} = require('../controllers/statsController');

const router = Router();

router.use(adminGuard);

router.get('/inscriptions', getInscriptionStats);
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.post('/students/:id/payments', addStudentPayment);
router.delete('/students/:id/payments/:paymentId', removeStudentPayment);
router.get('/careers', getCareerRanking);

module.exports = router;
