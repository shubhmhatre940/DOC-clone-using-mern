import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Untitled document'
  },
  content: {
    type: String,
    default: ''
  },
  versionName: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Composite index for fast version lookups sorted by creation date
documentVersionSchema.index({ documentId: 1, createdAt: -1 });

const DocumentVersion = mongoose.model('DocumentVersion', documentVersionSchema);

export default DocumentVersion;
