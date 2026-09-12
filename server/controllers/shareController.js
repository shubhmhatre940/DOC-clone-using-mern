import Document from '../models/Document.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @desc    Add or update a collaborator's role on a document
 * @route   POST /api/documents/:id/share
 * @access  Private (Owner only)
 */
export const addCollaborator = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Collaborator email is required' });
    }

    const validRoles = ['viewer', 'commenter', 'editor'];
    const assignedRole = validRoles.includes(role) ? role : 'viewer';

    // Find the target user by email
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({ message: `No user found with email "${email}"` });
    }

    const document = req.doc;

    // Check if target user is the owner
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    if (targetUser._id.toString() === ownerId) {
      return res.status(400).json({ message: 'Owner already has full document access' });
    }

    // Check if collaborator already exists
    const existingIndex = document.collaborators.findIndex(
      (c) => (c.userId._id ? c.userId._id.toString() : c.userId.toString()) === targetUser._id.toString()
    );

    if (existingIndex > -1) {
      document.collaborators[existingIndex].role = assignedRole;
    } else {
      document.collaborators.push({
        userId: targetUser._id,
        role: assignedRole
      });
    }

    await document.save();

    // Create in-app notification for the invited/updated user
    createNotification({
      userId: targetUser._id,
      senderId: req.user._id,
      type: 'share',
      documentId: document._id,
      message: `${req.user.name || 'Someone'} shared "${document.title}" with you as ${assignedRole}`
    });

    const updatedDoc = await Document.findById(document._id)
      .populate('owner', 'name email')
      .populate('collaborators.userId', 'name email');

    return res.json({
      message: `Collaborator ${existingIndex > -1 ? 'updated' : 'added'} successfully`,
      collaborators: updatedDoc.collaborators
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    return res.status(500).json({ message: error.message || 'Failed to share document' });
  }
};

/**
 * @desc    Remove a collaborator from a document
 * @route   DELETE /api/documents/:id/share/:userId
 * @access  Private (Owner only)
 */
export const removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;
    const document = req.doc;

    document.collaborators = document.collaborators.filter(
      (c) => (c.userId._id ? c.userId._id.toString() : c.userId.toString()) !== userId
    );

    await document.save();

    const updatedDoc = await Document.findById(document._id)
      .populate('owner', 'name email')
      .populate('collaborators.userId', 'name email');

    return res.json({
      message: 'Collaborator removed successfully',
      collaborators: updatedDoc.collaborators
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    return res.status(500).json({ message: error.message || 'Failed to remove collaborator' });
  }
};

/**
 * @desc    Update link-sharing visibility and role
 * @route   PATCH /api/documents/:id/visibility
 * @access  Private (Owner only)
 */
export const updateVisibility = async (req, res) => {
  try {
    const { visibility, linkRole } = req.body;
    const document = req.doc;

    if (visibility !== undefined) {
      if (!['private', 'anyone-with-link'].includes(visibility)) {
        return res.status(400).json({ message: 'Invalid visibility value' });
      }
      document.visibility = visibility;
    }

    if (linkRole !== undefined) {
      if (!['viewer', 'editor'].includes(linkRole)) {
        return res.status(400).json({ message: 'Invalid linkRole value' });
      }
      document.linkRole = linkRole;
    }

    await document.save();

    return res.json({
      message: 'Visibility updated successfully',
      visibility: document.visibility,
      linkRole: document.linkRole
    });
  } catch (error) {
    console.error('Update visibility error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update visibility' });
  }
};

/**
 * @desc    Get collaborators and sharing settings for document
 * @route   GET /api/documents/:id/collaborators
 * @access  Private (Owner or Collaborator)
 */
export const getCollaborators = async (req, res) => {
  try {
    const document = req.doc;
    return res.json({
      owner: document.owner,
      collaborators: document.collaborators,
      visibility: document.visibility,
      linkRole: document.linkRole,
      currentUserRole: req.userRole
    });
  } catch (error) {
    console.error('Get collaborators error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch collaborators' });
  }
};
