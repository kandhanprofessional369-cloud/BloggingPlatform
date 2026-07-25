import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Get approved comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
export const getPostComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId, status: 'approved' })
    .populate('author', 'name username avatar')
    .sort('createdAt');
  res.json(comments);
});

// @desc    Add a comment to a post
// @route   POST /api/comments/post/:postId
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;
  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Comment content is required');
  }

  const post = await Post.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content: content.trim(),
    parentComment: parentComment || null,
  });

  if (comment.status === 'approved' && post.author.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: post.author,
      type: 'comment',
      message: `${req.user.name} commented on your post "${post.title}"`,
      post: post._id,
    });
  }

  const populated = await comment.populate('author', 'name username avatar');
  res.status(201).json(populated);
});

// @desc    Edit own comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this comment');
  }
  comment.content = req.body.content?.trim() || comment.content;
  comment.edited = true;
  const updated = await comment.save();
  res.json(updated);
});

// @desc    Delete own comment (or post author / admin can moderate)
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate('post', 'author');
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const isCommentAuthor = comment.author.toString() === req.user._id.toString();
  const isPostAuthor = comment.post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});

// @desc    Moderate a comment (approve / mark spam) - post author or admin
// @route   PUT /api/comments/:id/moderate
// @access  Private
export const moderateComment = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'approved' | 'spam' | 'pending'
  const comment = await Comment.findById(req.params.id).populate('post', 'author');
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const isPostAuthor = comment.post.author.toString() === req.user._id.toString();
  if (!isPostAuthor && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to moderate this comment');
  }

  comment.status = status;
  const updated = await comment.save();
  res.json(updated);
});

// @desc    Get comments pending moderation for the logged-in author's posts
// @route   GET /api/comments/moderation
// @access  Private
export const getModerationQueue = asyncHandler(async (req, res) => {
  const myPosts = await Post.find({ author: req.user._id }).select('_id');
  const postIds = myPosts.map((p) => p._id);

  const comments = await Comment.find({ post: { $in: postIds }, status: { $in: ['pending', 'spam'] } })
    .populate('author', 'name username avatar')
    .populate('post', 'title slug')
    .sort('-createdAt');

  res.json(comments);
});
