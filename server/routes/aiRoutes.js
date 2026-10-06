import express from 'express';
import { processAiAction } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/process', protect, processAiAction);

export default router;
