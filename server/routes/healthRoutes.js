import express from 'express';

const router = express.Router();

/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Google Docs Clone Backend API is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
