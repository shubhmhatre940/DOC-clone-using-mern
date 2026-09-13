import ActivityLog from '../models/ActivityLog.js';

/**
 * @desc    Get paginated activity log / audit trail for a document
 * @route   GET /api/documents/:id/activity
 * @access  Private (viewer+)
 */
export const getActivityLog = async (req, res) => {
  try {
    const documentId = req.params.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      ActivityLog.find({ documentId })
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments({ documentId })
    ]);

    return res.json({
      activities,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch activity log' });
  }
};
