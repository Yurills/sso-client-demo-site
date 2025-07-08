import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';

router.get('/callback', authController.handleOAuthCallback);
router.get('/session/status', authController.checkInternalSession);

router.post('/session/switch', authController.switchToJwt);
router.post('/session/stay-internal', authController.stayInternal);
router.post('/session/login', authController.login);
router.post('/session/logout', authController.logout);

export default router;