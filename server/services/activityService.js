import ActivityLog from '../models/ActivityLog.js';

/**
 * Log an activity entry safely without throwing or interrupting the primary operation
 * @param {Object} param0
 * @param {string|ObjectId} param0.documentId
 * @param {string|ObjectId} param0.userId
 * @param {string} param0.action
 * @param {string} param0.details
 */
export async function logActivity({ documentId, userId, action, details = '' }) {
  try {
    if (!documentId || !userId || !action) return null;

    return await ActivityLog.create({
      documentId,
      userId,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      timestamp: new Date()
    });
  } catch (err) {
    // Fail non-blockingly so primary controller operations never fail due to audit logging
    console.warn('[ActivityService] Warning: Failed to write activity log:', err.message);
    return null;
  }
}
