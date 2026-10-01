import express from 'express';
import multer from 'multer';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  uploadWordDocument,
  searchDocuments,
  restoreDocument,
  permanentDeleteDocument,
  toggleStarDocument,
  moveDocumentToFolder
} from '../controllers/documentController.js';
import {
  addCollaborator,
  removeCollaborator,
  updateVisibility,
  getCollaborators
} from '../controllers/shareController.js';
import { getActivityLog } from '../controllers/activityController.js';
import { exportDocument } from '../controllers/exportController.js';
import { protect } from '../middleware/auth.js';
import { checkDocAccess } from '../middleware/permissions.js';
import { uploadLimiter, createDocLimiter, exportLimiter, pdfExportLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Configure Multer for memory buffer upload (limit 20MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

// All document routes require authentication
router.use(protect);

// Upload a Word (.docx) document with Multer error handling
router.post(
  '/upload',
  uploadLimiter,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('[Upload MulterError]:', err);
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        console.error('[Upload Unknown Middleware Error]:', err);
        return res.status(400).json({ message: `Upload error: ${err.message || 'Unknown error'}` });
      }
      next();
    });
  },
  uploadWordDocument
);

router.route('/')
  .post(createDocLimiter, createDocument)
  .get(getDocuments);

// Backend-powered search across title & content (must be before /:id)
router.get('/search', searchDocuments);

// Document CRUD with permission checks
router.route('/:id')
  .get(checkDocAccess('viewer'), getDocumentById)
  .put(checkDocAccess('editor'), updateDocument)
  .delete(checkDocAccess('owner'), deleteDocument);

// Starring, Folder moving, and Trash operations
router.patch('/:id/star', checkDocAccess('viewer'), toggleStarDocument);
router.patch('/:id/move', checkDocAccess('owner'), moveDocumentToFolder);
router.patch('/:id/restore', checkDocAccess('owner'), restoreDocument);
router.delete('/:id/permanent', checkDocAccess('owner'), permanentDeleteDocument);

// Document Export route (PDF gets a stricter limiter; other formats use exportLimiter)
router.get('/:id/export', (req, res, next) => {
  const format = (req.query.format || 'txt').toLowerCase();
  if (format === 'pdf') return pdfExportLimiter(req, res, next);
  return exportLimiter(req, res, next);
}, checkDocAccess('viewer'), exportDocument);

// Document Activity Log / Audit Trail (requires at least viewer access)
router.get('/:id/activity', checkDocAccess('viewer'), getActivityLog);

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
