import express from 'express';
import {
  updateProfile,
  getAuthorPage,
  toggleSubscribeAuthor,
  toggleSubscribeCategory,
  getNotifications,
  markNotificationRead,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.put('/subscribe/author/:id', protect, toggleSubscribeAuthor);
router.put('/subscribe/category/:id', protect, toggleSubscribeCategory);
router.get('/:username', getAuthorPage);

export default router;
