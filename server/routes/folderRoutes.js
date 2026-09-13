import express from 'express';
import {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder
} from '../controllers/folderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createFolder)
  .get(getFolders);

router.route('/:id')
  .patch(renameFolder)
  .delete(deleteFolder);

export default router;
