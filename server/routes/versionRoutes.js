import express from 'express';
import { protect } from '../middleware/auth.js';
import { checkDocAccess } from '../middleware/permissions.js';
import {
  getVersions,
  getVersionById,
  createVersion,
  restoreVersion
} from '../controllers/versionController.js';

const router = express.Router();

router.use(protect);

// Version history routes
router.get('/:id/versions', checkDocAccess('viewer'), getVersions);
router.get('/:id/versions/:versionId', checkDocAccess('viewer'), getVersionById);
router.post('/:id/versions', checkDocAccess('editor'), createVersion);
router.post('/:id/versions/:versionId/restore', checkDocAccess('editor'), restoreVersion);

export default router;
