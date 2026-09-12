import DocumentVersion from '../models/DocumentVersion.js';
import Document from '../models/Document.js';
import { broadcastDocEvent } from '../services/collabServer.js';

/**
 * Automatically create a snapshot if none exists or if > 5 minutes have passed since the last snapshot
 */
export async function createAutoSnapshotIfNeeded(docId, title, content, userId) {
  try {
    const latest = await DocumentVersion.findOne({ documentId: docId }).sort({ createdAt: -1 });
    const now = new Date();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (!latest || (now.getTime() - new Date(latest.createdAt).getTime() > FIVE_MINUTES)) {
      await DocumentVersion.create({
        documentId: docId,
        title: title || 'Untitled document',
        content: content || '',
        versionName: latest ? '' : 'Initial version',
        createdBy: userId
      });
    }
  } catch (err) {
    console.error('[VersionController] Auto-snapshot error:', err.message);
  }
}

/**
 * @desc    Get all versions for a document
 * @route   GET /api/documents/:id/versions
 * @access  Private (viewer, commenter, editor, owner)
 */
export const getVersions = async (req, res) => {
  try {
    const { id } = req.params;

    const versions = await DocumentVersion.find({ documentId: id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json(versions);
  } catch (error) {
    console.error('[VersionController] getVersions error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch version history' });
  }
};

/**
 * @desc    Get a specific version snapshot with content
 * @route   GET /api/documents/:id/versions/:versionId
 * @access  Private
 */
export const getVersionById = async (req, res) => {
  try {
    const { id, versionId } = req.params;

    const version = await DocumentVersion.findOne({
      _id: versionId,
      documentId: id
    }).populate('createdBy', 'name email');

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    return res.json(version);
  } catch (error) {
    console.error('[VersionController] getVersionById error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch version' });
  }
};

/**
 * @desc    Create a manual named version snapshot
 * @route   POST /api/documents/:id/versions
 * @access  Private (editor, owner)
 */
export const createVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { versionName, title, content } = req.body;

    const doc = req.doc || (await Document.findById(id));
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const version = await DocumentVersion.create({
      documentId: id,
      title: title !== undefined ? title : doc.title,
      content: content !== undefined ? content : doc.content,
      versionName: versionName?.trim() || '',
      createdBy: req.user._id
    });

    const populated = await DocumentVersion.findById(version._id).populate('createdBy', 'name email');
    return res.status(201).json(populated);
  } catch (error) {
    console.error('[VersionController] createVersion error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create version snapshot' });
  }
};

/**
 * @desc    Restore document to a previous version
 * @route   POST /api/documents/:id/versions/:versionId/restore
 * @access  Private (editor, owner)
 */
export const restoreVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;

    const targetVersion = await DocumentVersion.findOne({
      _id: versionId,
      documentId: id
    });

    if (!targetVersion) {
      return res.status(404).json({ message: 'Version to restore not found' });
    }

    const document = req.doc || (await Document.findById(id));
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Before restoring, save a snapshot of the current state so user never loses current changes
    await DocumentVersion.create({
      documentId: id,
      title: document.title,
      content: document.content,
      versionName: `Before restore to ${new Date(targetVersion.createdAt).toLocaleDateString()}`,
      createdBy: req.user._id
    });

    // Update the live document
    document.title = targetVersion.title || document.title;
    document.content = targetVersion.content || '';
    await document.save();

    // Broadcast version restore event over WebSocket so open collaborator tabs receive update
    broadcastDocEvent(id, {
      type: 'version:restored',
      documentId: id,
      title: document.title,
      content: document.content,
      restoredFromVersionId: versionId,
      restoredBy: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.json({
      message: 'Document restored successfully',
      document: {
        _id: document._id,
        title: document.title,
        content: document.content
      }
    });
  } catch (error) {
    console.error('[VersionController] restoreVersion error:', error);
    return res.status(500).json({ message: error.message || 'Failed to restore version' });
  }
};
