const { Router } = require('express');
const { createInscription } = require('../controllers/inscriptionController');
const { verifyEmail } = require('../controllers/verifyEmailController');

const router = Router();

router.post('/', createInscription);
router.post('/verify', verifyEmail);

module.exports = router;
