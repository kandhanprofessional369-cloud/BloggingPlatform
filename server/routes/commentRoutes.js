import express from 'express';
import {
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
  moderateComment,
  getModerationQueue,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/post/:postId', getPostComments);
router.post('/post/:postId', protect, addComment);
router.get('/moderation', protect, getModerationQueue);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/moderate', protect, moderateComment);

export default router;
