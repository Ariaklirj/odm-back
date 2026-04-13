const { Router } = require('express');
const {
  listMasterDegrees,
  getAllMasterDegrees,
  getMasterDegreeById,
  getMasterDegreeBySlug,
  createMasterDegree,
  updateMasterDegree,
  deleteMasterDegree,
} = require('../controllers/masterDegreeController');
const adminGuard = require('../middlewares/adminGuard');

const router = Router();

router.get('/list', listMasterDegrees);
router.get('/', getAllMasterDegrees);
router.get('/slug/:slug', getMasterDegreeBySlug);
router.get('/:id', getMasterDegreeById);
router.post('/', adminGuard, createMasterDegree);
router.put('/:id', adminGuard, updateMasterDegree);
router.delete('/:id', adminGuard, deleteMasterDegree);

module.exports = router;
