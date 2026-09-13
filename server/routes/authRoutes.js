import express from 'express';
import { registerUser, loginUser, getMe, updatePreferences } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);

export default router;
