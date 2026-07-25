import express from 'express';
import {
  getCategories,
  getCategoryPosts,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug/posts', getCategoryPosts);
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
