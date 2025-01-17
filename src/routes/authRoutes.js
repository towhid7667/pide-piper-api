const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = new AuthController();

router.post('/register', auth.register);
router.post('/verify-email', auth.verifyEmail);
router.post('/login', auth.login);
router.post('/google-signin', auth.googleSignIn);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.put('/profile', auth.authenticateToken, auth.updateProfile);

module.exports = router;