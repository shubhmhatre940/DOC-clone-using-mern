import express from 'express';
import { TEMPLATES } from '../data/templates.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Require auth for template endpoints
router.use(protect);

/**
 * @desc    Get all available document templates
 * @route   GET /api/templates
 * @access  Private
 */
router.get('/', (req, res) => {
  return res.json(TEMPLATES);
});

/**
 * @desc    Get single template by ID
 * @route   GET /api/templates/:id
 * @access  Private
 */
router.get('/:id', (req, res) => {
  const template = TEMPLATES.find((t) => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  return res.json(template);
});

export default router;
