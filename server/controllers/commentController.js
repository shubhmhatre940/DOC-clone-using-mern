import Comment from '../models/Comment.js';
import Document from '../models/Document.js';
import { createNotification } from '../services/notificationService.js';
import { broadcastDocEvent } from '../services/collabServer.js';
import { logActivity } from '../services/activityService.js';

// Helper to determine user role on a document
async function getUserRole(document, userId) {
  if (!document || !userId) return null;
  const uId = userId.toString();
  const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
  if (ownerId === uId) return 'owner';

  const collab = document.collaborators?.find((c) => {
    const cId = c.userId?._id ? c.userId._id.toString() : c.userId?.toString();
    return cId === uId;
  });
  if (collab) return collab.role;

  if (document.visibility === 'anyone-with-link') {
    return document.linkRole || 'viewer';
  }

  return null;
}

/**
 * @desc    Get all comments for a document
 * @route   GET /api/documents/:id/comments
 * @access  Private (viewer+)
 */
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ documentId: req.params.id })
      .populate('authorId', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('replies.authorId', 'name email')
      .sort({ createdAt: 1 });

    return res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch comments' });
  }
};

/**
 * @desc    Create a new comment on a document
 * @route   POST /api/documents/:id/comments
 * @access  Private (viewer+)
 */
export const createComment = async (req, res) => {
  try {
    const { text, selectedText, selectionRange, mentionedUserIds } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const document = req.doc || (await Document.findById(req.params.id));
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const comment = await Comment.create({
      documentId: document._id,
      authorId: req.user._id,
      text: text.trim(),
      selectedText: selectedText || '',
      selectionRange: selectionRange || { from: 0, to: 0 }
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'name email')
      .populate('replies.authorId', 'name email');

    const senderIdStr = req.user._id.toString();
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    const notifiedUserIds = new Set();

    // 1. Send mention notifications to mentioned users
    if (Array.isArray(mentionedUserIds) && mentionedUserIds.length > 0) {
      for (const mId of mentionedUserIds) {
        const mIdStr = mId.toString();
        if (mIdStr !== senderIdStr) {
          await createNotification({
            userId: mIdStr,
            senderId: req.user._id,
            type: 'mention',
            documentId: document._id,
            commentId: comment._id,
            message: `${req.user.name || 'A collaborator'} mentioned you in a comment on "${document.title}"`
          });
          notifiedUserIds.add(mIdStr);
        }
      }
    }

    // 2. Notify document owner if author is not the owner and not already notified via mention
    if (ownerId !== senderIdStr && !notifiedUserIds.has(ownerId)) {
      await createNotification({
        userId: ownerId,
        senderId: req.user._id,
        type: 'comment',
        documentId: document._id,
        commentId: comment._id,
        message: `${req.user.name || 'A collaborator'} commented on "${document.title}": "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
      });
    }

    // Broadcast live over existing WebSocket channel
    broadcastDocEvent(document._id, {
      type: 'comment:new',
      comment: populatedComment
    });

    // Record activity
    logActivity({
      documentId: document._id,
      userId: req.user._id,
      action: 'commented',
      details: `Added comment: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
    });

    return res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create comment' });
  }
};

/**
 * @desc    Add a reply to a comment thread
 * @route   POST /api/comments/:commentId/replies
 * @access  Private (viewer+)
 */
export const addReply = async (req, res) => {
  try {
    const { text, mentionedUserIds } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const document = await Document.findById(comment.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const userRole = await getUserRole(document, req.user._id);
    if (!userRole) {
      return res.status(403).json({ message: 'Not authorized to reply to this comment' });
    }

    comment.replies.push({
      authorId: req.user._id,
      text: text.trim()
    });

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('replies.authorId', 'name email');

    // Collect all participants in thread to notify
    const participantIds = new Set();
    const commentAuthorIdStr = comment.authorId._id ? comment.authorId._id.toString() : comment.authorId.toString();
    participantIds.add(commentAuthorIdStr);
    comment.replies.forEach((r) => {
      const aId = r.authorId?._id ? r.authorId._id.toString() : r.authorId?.toString();
      if (aId) participantIds.add(aId);
    });

    const senderIdStr = req.user._id.toString();
    const notifiedUserIds = new Set();

    // 1. Send mention notifications if users were mentioned in the reply
    if (Array.isArray(mentionedUserIds) && mentionedUserIds.length > 0) {
      for (const mId of mentionedUserIds) {
        const mIdStr = mId.toString();
        if (mIdStr !== senderIdStr) {
          await createNotification({
            userId: mIdStr,
            senderId: req.user._id,
            type: 'mention',
            documentId: document._id,
            commentId: comment._id,
            message: `${req.user.name || 'A collaborator'} mentioned you in a reply on "${document.title}"`
          });
          notifiedUserIds.add(mIdStr);
        }
      }
    }

    // 2. Notify thread participants who weren't mentioned and aren't the sender
    for (const pId of participantIds) {
      if (pId !== senderIdStr && !notifiedUserIds.has(pId)) {
        await createNotification({
          userId: pId,
          senderId: req.user._id,
          type: 'reply',
          documentId: document._id,
          commentId: comment._id,
          message: `${req.user.name || 'A collaborator'} replied to a comment on "${document.title}"`
        });
      }
    }

    // Broadcast live over WebSocket
    broadcastDocEvent(document._id, {
      type: 'comment:reply',
      comment: updatedComment
    });

    return res.json(updatedComment);
  } catch (error) {
    console.error('Add reply error:', error);
    return res.status(500).json({ message: error.message || 'Failed to add reply' });
  }
};

/**
 * @desc    Update a comment (resolve, reopen, edit)
 * @route   PATCH /api/comments/:commentId
 * @access  Private
 */
export const updateComment = async (req, res) => {
  try {
    const { resolved, text } = req.body;

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const document = await Document.findById(comment.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const userRole = await getUserRole(document, req.user._id);
    if (!userRole) {
      return res.status(403).json({ message: 'Not authorized to modify this comment' });
    }

    // Resolving/Reopening: Requires editor or owner role
    if (resolved !== undefined) {
      if (userRole !== 'owner' && userRole !== 'editor') {
        return res.status(403).json({ message: 'Only editors or the owner can resolve/reopen comments' });
      }
      comment.resolved = !!resolved;
      comment.resolvedBy = resolved ? req.user._id : null;
    }

    // Editing text: Must be the original comment author
    if (text !== undefined) {
      const authorId = comment.authorId._id ? comment.authorId._id.toString() : comment.authorId.toString();
      if (authorId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only edit your own comments' });
      }
      comment.text = text.trim();
    }

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('replies.authorId', 'name email');

    // Broadcast live over WebSocket
    broadcastDocEvent(document._id, {
      type: 'comment:update',
      comment: updatedComment
    });

    return res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update comment' });
  }
};

/**
 * @desc    Delete a comment thread
 * @route   DELETE /api/comments/:commentId
 * @access  Private (Author or Document Owner)
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const document = await Document.findById(comment.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const userId = req.user._id.toString();
    const authorId = comment.authorId._id ? comment.authorId._id.toString() : comment.authorId.toString();
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();

    // Permission check: comment author OR document owner
    if (userId !== authorId && userId !== ownerId) {
      return res.status(403).json({ message: 'Only the comment author or document owner can delete this comment' });
    }

    const docId = comment.documentId;
    await comment.deleteOne();

    // Broadcast live over WebSocket
    broadcastDocEvent(docId, {
      type: 'comment:delete',
      commentId: req.params.commentId
    });

    return res.json({ message: 'Comment deleted successfully', commentId: req.params.commentId });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete comment' });
  }
};
