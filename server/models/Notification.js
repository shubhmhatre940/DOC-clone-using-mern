import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['share', 'comment', 'reply', 'mention'],
      required: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);
