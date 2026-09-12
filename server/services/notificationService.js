import Notification from '../models/Notification.js';

/**
 * Creates an in-app notification safely without blocking or breaking calling transactions
 */
export async function createNotification({
  userId,
  senderId,
  type,
  documentId,
  commentId = null,
  message
}) {
  try {
    if (!userId || !senderId || !type || !documentId || !message) return null;
    
    // Don't notify users of their own actions
    if (userId.toString() === senderId.toString()) return null;

    const notification = await Notification.create({
      userId,
      senderId,
      type,
      documentId,
      commentId,
      message
    });

    return notification;
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
    return null;
  }
}
