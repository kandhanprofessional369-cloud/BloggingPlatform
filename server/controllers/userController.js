import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name ?? user.name;
  user.bio = req.body.bio ?? user.bio;
  if (req.body.socialLinks) {
    // socialLinks arrives as a JSON string when sent via multipart/form-data
    let parsedLinks = req.body.socialLinks;
    if (typeof parsedLinks === 'string') {
      try {
        parsedLinks = JSON.parse(parsedLinks);
      } catch (e) {
        parsedLinks = {};
      }
    }
    user.socialLinks = { ...user.socialLinks.toObject(), ...parsedLinks };
  }
  if (req.file) {
    user.avatar = `/uploads/${req.file.filename}`;
  }

  const updated = await user.save();
  res.json(updated);
});

// @desc    Get author public page (profile + their posts)
// @route   GET /api/users/:username
// @access  Public
export const getAuthorPage = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    res.status(404);
    throw new Error('Author not found');
  }

  const posts = await Post.find({ author: user._id, status: 'published' })
    .sort({ publishedAt: -1 })
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  res.json({
    author: {
      _id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt,
    },
    posts,
    postCount: posts.length,
  });
});

// @desc    Subscribe/unsubscribe to an author
// @route   PUT /api/users/subscribe/author/:id
// @access  Private
export const toggleSubscribeAuthor = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot subscribe to yourself');
  }

  const user = await User.findById(req.user._id);
  const authorExists = await User.findById(req.params.id);
  if (!authorExists) {
    res.status(404);
    throw new Error('Author not found');
  }

  const idx = user.subscribedAuthors.findIndex((id) => id.toString() === req.params.id);
  let subscribed;
  if (idx > -1) {
    user.subscribedAuthors.splice(idx, 1);
    subscribed = false;
  } else {
    user.subscribedAuthors.push(req.params.id);
    subscribed = true;
  }
  await user.save();

  res.json({ subscribed, subscribedAuthors: user.subscribedAuthors });
});

// @desc    Subscribe/unsubscribe to a category
// @route   PUT /api/users/subscribe/category/:id
// @access  Private
export const toggleSubscribeCategory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const idx = user.subscribedCategories.findIndex((id) => id.toString() === req.params.id);
  let subscribed;
  if (idx > -1) {
    user.subscribedCategories.splice(idx, 1);
    subscribed = false;
  } else {
    user.subscribedCategories.push(req.params.id);
    subscribed = true;
  }
  await user.save();

  res.json({ subscribed, subscribedCategories: user.subscribedCategories });
});

// @desc    Get my notifications
// @route   GET /api/users/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('post', 'title slug');
  res.json(notifications);
});

// @desc    Mark notification(s) as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  notification.read = true;
  await notification.save();
  res.json(notification);
});
