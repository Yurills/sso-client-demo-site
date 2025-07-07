const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/callback', authController.handleOAuthCallback);
router.post('/switch-session', authController.switchToJwt);
router.post('/stay-internal', authController.stayInternal);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;