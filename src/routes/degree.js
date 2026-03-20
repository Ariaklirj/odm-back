const { Router } = require('express');
const {
  listDegrees,
  getAllDegrees,
  getDegreeById,
  getDegreeBySlug,
  createDegree,
  updateDegree,
  deleteDegree,
} = require('../controllers/degreeController');
const adminGuard = require('../middlewares/adminGuard');

const router = Router();

router.get('/list', listDegrees);
router.get('/', getAllDegrees);
router.get('/slug/:slug', getDegreeBySlug);
router.get('/:id', getDegreeById);
router.post('/', adminGuard, createDegree);
router.put('/:id', adminGuard, updateDegree);
router.delete('/:id', adminGuard, deleteDegree);

module.exports = router;
