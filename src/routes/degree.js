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

const router = Router();

router.get('/list', listDegrees);
router.get('/', getAllDegrees);
router.get('/slug/:slug', getDegreeBySlug);
router.get('/:id', getDegreeById);
router.post('/', createDegree);
router.put('/:id', updateDegree);
router.delete('/:id', deleteDegree);

module.exports = router;
