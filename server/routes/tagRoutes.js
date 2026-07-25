import express from 'express';
import { getTags, getTagPosts, createTag, deleteTag } from '../controllers/tagController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTags);
router.get('/:slug/posts', getTagPosts);
router.post('/', protect, createTag);
router.delete('/:id', protect, deleteTag);

export default router;
