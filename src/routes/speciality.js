const { Router } = require('express');
const {
  listSpecialities,
  getAllSpecialities,
  getSpecialityById,
  getSpecialityBySlug,
  createSpeciality,
  updateSpeciality,
  deleteSpeciality,
} = require('../controllers/specialityController');
const adminGuard = require('../middlewares/adminGuard');

const router = Router();

router.get('/list', listSpecialities);
router.get('/', getAllSpecialities);
router.get('/slug/:slug', getSpecialityBySlug);
router.get('/:id', getSpecialityById);
router.post('/', adminGuard, createSpeciality);
router.put('/:id', adminGuard, updateSpeciality);
router.delete('/:id', adminGuard, deleteSpeciality);

module.exports = router;
