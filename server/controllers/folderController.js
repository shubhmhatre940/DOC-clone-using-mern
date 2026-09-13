import Folder from '../models/Folder.js';
import Document from '../models/Document.js';

/**
 * @desc    Create a new folder
 * @route   POST /api/folders
 * @access  Private
 */
export const createFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    const folder = await Folder.create({
      name: name.trim(),
      owner: req.user._id,
      parentFolder: parentFolder || null
    });

    return res.status(201).json(folder);
  } catch (error) {
    console.error('Create folder error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create folder' });
  }
};

/**
 * @desc    Get all folders for current user (with document count)
 * @route   GET /api/folders
 * @access  Private
 */
export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id }).sort({ name: 1 }).lean();

    // Attach count of active (non-deleted) documents inside each folder
    const folderIds = folders.map((f) => f._id);
    const docCounts = await Document.aggregate([
      {
        $match: {
          folderId: { $in: folderIds },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$folderId',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = {};
    docCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const populatedFolders = folders.map((f) => ({
      ...f,
      docCount: countMap[f._id.toString()] || 0
    }));

    return res.json(populatedFolders);
  } catch (error) {
    console.error('Get folders error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch folders' });
  }
};

/**
 * @desc    Rename a folder
 * @route   PATCH /api/folders/:id
 * @access  Private (Owner only)
 */
export const renameFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'New folder name is required' });
    }

    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    folder.name = name.trim();
    await folder.save();

    return res.json(folder);
  } catch (error) {
    console.error('Rename folder error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to rename folder' });
  }
};

/**
 * @desc    Delete a folder (unsets folderId for contained documents so they move to root)
 * @route   DELETE /api/folders/:id
 * @access  Private (Owner only)
 */
export const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Move all documents in this folder back to root
    await Document.updateMany({ folderId: folder._id }, { $set: { folderId: null } });

    await Folder.deleteOne({ _id: folder._id });

    return res.json({ success: true, message: 'Folder deleted, documents moved to root', id: folder._id });
  } catch (error) {
    console.error('Delete folder error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete folder' });
  }
};
