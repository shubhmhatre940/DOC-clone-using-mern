import express from 'express';
import { checkGrammar } from '../controllers/grammarController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Require authentication for grammar checking
router.post('/', protect, checkGrammar);

export default router;
