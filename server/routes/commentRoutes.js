import express from 'express';
import {
  getComments,
  createComment,
  addReply,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { checkDocAccess } from '../middleware/permissions.js';

const router = express.Router();

router.use(protect);

// Document-scoped comments
router.route('/documents/:id/comments')
  .get(checkDocAccess('viewer'), getComments)
  .post(checkDocAccess('viewer'), createComment);

// Specific comment operations
router.route('/comments/:commentId')
  .patch(updateComment)
  .delete(deleteComment);

router.route('/comments/:commentId/replies')
  .post(addReply);

export default router;
