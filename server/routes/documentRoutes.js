import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
} from '../controllers/documentController.js';
import {
  addCollaborator,
  removeCollaborator,
  updateVisibility,
  getCollaborators
} from '../controllers/shareController.js';
import { exportDocument } from '../controllers/exportController.js';
import { protect } from '../middleware/auth.js';
import { checkDocAccess } from '../middleware/permissions.js';

const router = express.Router();

// All document routes require authentication
router.use(protect);

router.route('/')
  .post(createDocument)
  .get(getDocuments);

// Document CRUD with permission checks
router.route('/:id')
  .get(checkDocAccess('viewer'), getDocumentById)
  .put(checkDocAccess('editor'), updateDocument)
  .delete(deleteDocument);

// Document Export route (requires at least viewer access)
router.route('/:id/export')
  .get(checkDocAccess('viewer'), exportDocument);

// Document Collaboration & Sharing routes (Owner only for management)
router.route('/:id/collaborators')
  .get(checkDocAccess('viewer'), getCollaborators);

router.route('/:id/share')
  .post(checkDocAccess('owner'), addCollaborator);

router.route('/:id/share/:userId')
  .delete(checkDocAccess('owner'), removeCollaborator);

router.route('/:id/visibility')
  .patch(checkDocAccess('owner'), updateVisibility);

export default router;
