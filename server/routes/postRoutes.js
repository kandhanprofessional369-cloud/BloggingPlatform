import express from 'express';
import {
  getPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  toggleLike,
  trackShare,
  getPostAnalytics,
  getMyAnalytics,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/mine/all', protect, getMyPosts);
router.get('/mine/analytics', protect, getMyAnalytics);
router.get('/id/:id', protect, getPostById);
router.get('/:slug', optionalAuth, getPostBySlug);

router.post('/', protect, upload.single('coverImage'), createPost);
router.put('/:id', protect, upload.single('coverImage'), updatePost);
router.delete('/:id', protect, deletePost);

router.put('/:id/like', protect, toggleLike);
router.put('/:id/share', trackShare);
router.get('/:id/analytics', protect, getPostAnalytics);

export default router;
