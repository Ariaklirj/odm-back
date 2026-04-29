const { Router } = require('express');
const {
  listBachilleratos,
  getAllBachilleratos,
  getBachilleratoById,
  getBachilleratoBySlug,
  createBachillerato,
  updateBachillerato,
  deleteBachillerato,
} = require('../controllers/bachilleratoController');
const adminGuard = require('../middlewares/adminGuard');

const router = Router();

router.get('/list',        listBachilleratos);
router.get('/',            getAllBachilleratos);
router.get('/slug/:slug',  getBachilleratoBySlug);
router.get('/:id',         getBachilleratoById);
router.post('/',           adminGuard, createBachillerato);
router.put('/:id',         adminGuard, updateBachillerato);
router.delete('/:id',      adminGuard, deleteBachillerato);

module.exports = router;
