import path from 'path';

/**
 * @desc    Upload media file (audio or image)
 * @route   POST /api/media/upload
 * @access  Private
 */
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    return res.status(201).json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('[MediaController] Upload error:', error);
    return res.status(500).json({ message: error.message || 'Failed to upload media file' });
  }
};
