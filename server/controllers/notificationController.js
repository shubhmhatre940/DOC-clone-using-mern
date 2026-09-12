import Notification from '../models/Notification.js';

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('senderId', 'name email')
      .populate('documentId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    return res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('[NotificationController] getNotifications error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch notifications' });
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true }
    )
      .populate('senderId', 'name email')
      .populate('documentId', 'title');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    return res.json({ notification, unreadCount });
  } catch (error) {
    console.error('[NotificationController] markAsRead error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update notification' });
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });

    return res.json({ message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    console.error('[NotificationController] markAllAsRead error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update notifications' });
  }
};
