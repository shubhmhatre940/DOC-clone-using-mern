import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Untitled document',
      trim: true,
      maxlength: [120, 'Document title cannot exceed 120 characters']
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Phase 3: Binary Yjs CRDT state for real-time collaborative editing
    yjsState: {
      type: Buffer,
      default: null
    },
    // Phase 4: Collaborators with assigned roles (viewer, commenter, editor)
    collaborators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['viewer', 'commenter', 'editor'],
          default: 'viewer'
        }
      }
    ],
    // Phase 4: Document link-sharing visibility and permissions
    visibility: {
      type: String,
      enum: ['private', 'anyone-with-link'],
      default: 'private'
    },
    linkRole: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer'
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;
