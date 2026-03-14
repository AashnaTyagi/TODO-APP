/**
 * auth.js — Authentication routes
 */

const router = require('express').Router();
const { signup, login, getMe, updateTheme } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { signupValidation, loginValidation } = require('../middleware/validate');

router.post('/signup', signupValidation, signup);
router.post('/login',  loginValidation,  login);
router.get('/me',      protect,          getMe);
router.patch('/theme', protect,          updateTheme);

module.exports = router;
