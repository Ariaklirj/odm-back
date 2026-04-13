const { Router } = require('express');
const { login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, getMe);

module.exports = router;
