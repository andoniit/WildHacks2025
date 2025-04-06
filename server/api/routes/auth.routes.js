const express = require('express');
const router = express.Router();
const { validateUserRegistration } = require('../middleware/validation.middleware');
const { register, login, logout, verifyToken, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { verifyToken: authMiddleware } = require('../middleware/auth.middleware');

// Registration route
router.post('/signup', validateUserRegistration, register);

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', logout);

// Verify token route
router.get('/verify', verifyToken);

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router;
