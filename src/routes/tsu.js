const { Router } = require('express');
const {
  listTSUs,
  getAllTSUs,
  getTSUById,
  getTSUBySlug,
  createTSU,
  updateTSU,
  deleteTSU,
} = require('../controllers/tsuController');
const adminGuard = require('../middlewares/adminGuard');

const router = Router();

router.get('/list', listTSUs);
router.get('/', getAllTSUs);
router.get('/slug/:slug', getTSUBySlug);
router.get('/:id', getTSUById);
router.post('/', adminGuard, createTSU);
router.put('/:id', adminGuard, updateTSU);
router.delete('/:id', adminGuard, deleteTSU);

module.exports = router;
