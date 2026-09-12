import Document from '../models/Document.js';

/**
 * @desc    Create a new blank document
 * @route   POST /api/documents
 * @access  Private
 */
export const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    const document = await Document.create({
      title: title || 'Untitled document',
      content: content !== undefined ? content : '',
      owner: req.user._id
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
    const { type } = req.query; // 'owned' | 'shared' | undefined (all)

    if (type === 'shared') {
      const sharedDocs = await Document.find({
        'collaborators.userId': req.user._id
      })
        .populate('owner', 'name email')
        .sort({ updatedAt: -1 })
        .select('title createdAt updatedAt owner collaborators visibility linkRole');

      return res.json(sharedDocs);
    }

    // Default: fetch user's owned documents
    const ownedDocs = await Document.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt owner collaborators visibility linkRole');

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
    const { title, content } = req.body;
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

    if (title !== undefined) {
      document.title = title.trim() || 'Untitled document';
    }

    if (content !== undefined) {
      document.content = content;
    }

    const updatedDocument = await document.save();
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
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only document owner can delete
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this document' });
    }

    await Document.deleteOne({ _id: req.params.id });

    return res.json({ message: 'Document deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete document error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document not found' });
    }
    return res.status(500).json({ message: error.message || 'Failed to delete document' });
  }
};
