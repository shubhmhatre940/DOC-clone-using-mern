import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: [
        'created',
        'edited',
        'shared',
        'commented',
        'renamed',
        'role_changed',
        'removed_collaborator',
        'restored_version',
        'visibility_changed'
      ],
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: false }
);

export default mongoose.model('ActivityLog', ActivityLogSchema);
