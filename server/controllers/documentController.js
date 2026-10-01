import Document from '../models/Document.js';
import mammoth from 'mammoth';
import { createAutoSnapshotIfNeeded } from './versionController.js';
import { sanitizeContent } from '../utils/sanitize.js';
import { logActivity } from '../services/activityService.js';

/**
 * @desc    Create a new blank document
 * @route   POST /api/documents
 * @access  Private
 */
export const createDocument = async (req, res) => {
  try {
    const { title, content, pageSettings } = req.body;

    const document = await Document.create({
      title: title || 'Untitled document',
      content: sanitizeContent(content !== undefined ? content : ''),
      owner: req.user._id,
      ...(pageSettings ? { pageSettings } : {})
    });

    // Create initial version snapshot asynchronously
    createAutoSnapshotIfNeeded(document._id, document.title, document.content, req.user._id);

    // Record activity
    logActivity({
      documentId: document._id,
      userId: req.user._id,
      action: 'created',
      details: `Created document "${document.title}"`
    });

    return res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create document' });
  }
};

/**
 * @desc    Get all documents for logged-in user (owned and/or shared)
 * @route   GET /api/documents
 * @access  Private
 */
export const getDocuments = async (req, res) => {
  try {
    const { type, folderId } = req.query; // 'owned' | 'shared' | 'starred' | 'trash' | undefined (all)

    if (type === 'trash') {
      const trashDocs = await Document.find({
        owner: req.user._id,
        isDeleted: true
      })
        .populate('owner', 'name email')
        .populate('folderId', 'name')
        .sort({ deletedAt: -1, updatedAt: -1 })
        .select('title createdAt updatedAt owner collaborators visibility linkRole folderId isStarred isDeleted deletedAt');

      return res.json(trashDocs);
    }

    if (type === 'shared') {
      const sharedDocs = await Document.find({
        'collaborators.userId': req.user._id,
        isDeleted: { $ne: true }
      })
        .populate('owner', 'name email')
        .populate('folderId', 'name')
        .sort({ updatedAt: -1 })
        .select('title createdAt updatedAt owner collaborators visibility linkRole folderId isStarred isDeleted deletedAt');

      return res.json(sharedDocs);
    }

    if (type === 'starred') {
      const starredDocs = await Document.find({
        $or: [
          { owner: req.user._id },
          { 'collaborators.userId': req.user._id }
        ],
        isStarred: true,
        isDeleted: { $ne: true }
      })
        .populate('owner', 'name email')
        .populate('folderId', 'name')
        .sort({ updatedAt: -1 })
        .select('title createdAt updatedAt owner collaborators visibility linkRole folderId isStarred isDeleted deletedAt');

      return res.json(starredDocs);
    }

    // Default: fetch user's owned documents (optionally filtered by folderId)
    const query = {
      owner: req.user._id,
      isDeleted: { $ne: true }
    };

    if (folderId !== undefined) {
      query.folderId = folderId === 'root' || !folderId ? null : folderId;
    }

    const ownedDocs = await Document.find(query)
      .populate('owner', 'name email')
      .populate('folderId', 'name')
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt owner collaborators visibility linkRole folderId isStarred isDeleted deletedAt');

    return res.json(ownedDocs);
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
};

/**
 * @desc    Get single document by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = async (req, res) => {
  try {
    // If checkDocAccess middleware is applied, req.doc and req.userRole are already populated
    if (req.doc) {
      const docObj = req.doc.toObject();
      docObj.currentUserRole = req.userRole;
      return res.json(docObj);
    }

    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.userId', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const userId = req.user._id.toString();
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();

    let userRole = null;
    if (ownerId === userId) {
      userRole = 'owner';
    } else {
      const collab = document.collaborators.find(
        (c) => (c.userId?._id ? c.userId._id.toString() : c.userId?.toString()) === userId
      );
      if (collab) {
        userRole = collab.role;
      } else if (document.visibility === 'anyone-with-link') {
        userRole = document.linkRole || 'viewer';
      }
    }

    if (!userRole) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    const docObj = document.toObject();
    docObj.currentUserRole = userRole;
    return res.json(docObj);
  } catch (error) {
    console.error('Get document by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document not found' });
    }
    return res.status(500).json({ message: error.message || 'Failed to fetch document' });
  }
};

/**
 * @desc    Update document title and/or content
 * @route   PUT /api/documents/:id
 * @access  Private
 */
export const updateDocument = async (req, res) => {
  try {
    const { title, content, pageSettings } = req.body;
    const document = req.doc || (await Document.findById(req.params.id));

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Verify write permissions (owner or editor)
    const userId = req.user._id.toString();
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();

    let canEdit = ownerId === userId;
    if (!canEdit) {
      const collab = document.collaborators?.find(
        (c) => (c.userId?._id ? c.userId._id.toString() : c.userId?.toString()) === userId
      );
      if (collab && collab.role === 'editor') {
        canEdit = true;
      } else if (document.visibility === 'anyone-with-link' && document.linkRole === 'editor') {
        canEdit = true;
      }
    }

    if (!canEdit) {
      return res.status(403).json({ message: 'Not authorized to modify this document' });
    }

    const previousTitle = document.title;
    let titleChanged = false;

    if (title !== undefined) {
      const nextTitle = title.trim() || 'Untitled document';
      if (nextTitle !== previousTitle) {
        titleChanged = true;
      }
      document.title = nextTitle;
    }

    if (content !== undefined) {
      document.content = sanitizeContent(content);
    }

    if (pageSettings !== undefined) {
      const existing = document.pageSettings ? (document.pageSettings.toObject ? document.pageSettings.toObject() : document.pageSettings) : {};
      document.pageSettings = { ...existing, ...pageSettings };
    }

    const updatedDocument = await document.save();

    if (titleChanged) {
      logActivity({
        documentId: updatedDocument._id,
        userId: req.user._id,
        action: 'renamed',
        details: `Renamed to "${updatedDocument.title}"`
      });
    }

    // Trigger auto-snapshot if enough time has passed
    createAutoSnapshotIfNeeded(updatedDocument._id, updatedDocument.title, updatedDocument.content, req.user._id);

    return res.json(updatedDocument);
  } catch (error) {
    console.error('Update document error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document not found' });
    }
    return res.status(500).json({ message: error.message || 'Failed to update document' });
  }
};

/**
 * @desc    Delete a document
 * @route   DELETE /api/documents/:id
 * @access  Private (Owner only)
 */
export const deleteDocument = async (req, res) => {
  try {
    const document = req.doc || (await Document.findById(req.params.id));

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only document owner can delete
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this document' });
    }

    // Soft delete: move to trash
    document.isDeleted = true;
    document.deletedAt = new Date();
    await document.save();

    return res.json({
      success: true,
      message: 'Document moved to trash',
      id: req.params.id,
      isDeleted: true
    });
  } catch (error) {
    console.error('Delete document error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document not found' });
    }
    return res.status(500).json({ message: error.message || 'Failed to delete document' });
  }
};

/**
 * @desc    Restore a soft-deleted document from trash
 * @route   PATCH /api/documents/:id/restore
 * @access  Private (Owner only)
 */
export const restoreDocument = async (req, res) => {
  try {
    const document = req.doc || (await Document.findById(req.params.id));
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can restore this document' });
    }

    document.isDeleted = false;
    document.deletedAt = null;
    await document.save();

    return res.json({ success: true, message: 'Document restored successfully', id: req.params.id });
  } catch (error) {
    console.error('Restore document error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to restore document' });
  }
};

/**
 * @desc    Permanently delete a document forever
 * @route   DELETE /api/documents/:id/permanent
 * @access  Private (Owner only)
 */
export const permanentDeleteDocument = async (req, res) => {
  try {
    const document = req.doc || (await Document.findById(req.params.id));
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can permanently delete this document' });
    }

    await Document.deleteOne({ _id: req.params.id });

    return res.json({ success: true, message: 'Document permanently deleted', id: req.params.id });
  } catch (error) {
    console.error('Permanent delete document error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete document permanently' });
  }
};

/**
 * @desc    Toggle document starred status
 * @route   PATCH /api/documents/:id/star
 * @access  Private (Owner or Collaborator)
 */
export const toggleStarDocument = async (req, res) => {
  try {
    const document = req.doc || (await Document.findById(req.params.id));
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.isStarred = !document.isStarred;
    await document.save();

    return res.json({ success: true, isStarred: document.isStarred, id: document._id });
  } catch (error) {
    console.error('Toggle star error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to toggle star' });
  }
};

/**
 * @desc    Move document to a folder (or root)
 * @route   PATCH /api/documents/:id/move
 * @access  Private (Owner only)
 */
export const moveDocumentToFolder = async (req, res) => {
  try {
    const { folderId } = req.body;
    const document = req.doc || (await Document.findById(req.params.id));
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can move this document' });
    }

    document.folderId = folderId || null;
    await document.save();

    return res.json({
      success: true,
      message: 'Document moved successfully',
      folderId: document.folderId,
      id: document._id
    });
  } catch (error) {
    console.error('Move document error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to move document' });
  }
};

/**
 * @desc    Upload a Word (.docx) document, convert to HTML via mammoth, and save as new document
 * @route   POST /api/documents/upload
 * @access  Private
 */
export const uploadWordDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a Word document (.docx) to upload' });
    }

    // Validate filename extension
    const originalName = req.file.originalname || 'Uploaded document.docx';
    if (!originalName.toLowerCase().endsWith('.docx')) {
      return res.status(400).json({
        message: 'Could not read this file — only valid .docx files are supported'
      });
    }

    // Convert Word .docx buffer to clean HTML using mammoth
    let convertedHtml = '';
    try {
      console.log(`[Upload DOCX] Received file: ${originalName}, buffer size: ${req.file.buffer.length} bytes`);
      const result = await mammoth.convertToHtml({ buffer: req.file.buffer });
      convertedHtml = result.value || '<p></p>';
      console.log(`[Upload DOCX] Converted HTML length: ${convertedHtml.length} characters`);
      if (result.messages && result.messages.length > 0) {
        console.log('[Mammoth Conversion Messages]:', result.messages);
      }
    } catch (parseErr) {
      console.error('[Upload DOCX] Mammoth parsing error details:', parseErr);
      const detail = parseErr?.message ? ` (${parseErr.message})` : '';
      return res.status(400).json({
        message: `Could not read this file — please make sure it is a valid, uncorrupted .docx file${detail}`
      });
    }

    // Derive title from filename
    const docTitle = originalName.replace(/\.docx$/i, '').trim() || 'Imported Document';

    // Create new document in database owned by current user
    const document = await Document.create({
      title: docTitle,
      content: sanitizeContent(convertedHtml),
      owner: req.user._id
    });
    console.log(`[Upload DOCX] Created document ${document._id} with title "${docTitle}"`);

    // Record activity
    logActivity({
      documentId: document._id,
      userId: req.user._id,
      action: 'created',
      details: `Imported "${originalName}" from Word (.docx)`
    });

    return res.status(201).json(document);
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to upload and process document'
    });
  }
};

/**
 * @desc    Search documents by title and content
 * @route   GET /api/documents/search?q=...
 * @access  Private (accessible documents only: owned or shared)
 */
export const searchDocuments = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    const trimmedQuery = q.trim();
    // Escape regex special chars
    const safeRegex = new RegExp(trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const searchCriteria = {
      $and: [
        { isDeleted: { $ne: true } },
        {
          $or: [
            { owner: req.user._id },
            { 'collaborators.userId': req.user._id }
          ]
        },
        {
          $or: [
            { title: { $regex: safeRegex } },
            { content: { $regex: safeRegex } }
          ]
        }
      ]
    };

    const results = await Document.find(searchCriteria)
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt owner collaborators visibility linkRole isStarred folderId');

    return res.json(results);
  } catch (error) {
    console.error('Search documents error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to search documents' });
  }
};

