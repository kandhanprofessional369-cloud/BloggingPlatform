import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';

// @desc    Get published posts (public feed) with filters, search, pagination
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 9, category, tag, author, search, sort = '-publishedAt' } = req.query;

  const query = { status: 'published' };
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (author) query.author = author;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'name username avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Post.countDocuments(query),
  ]);

  res.json({
    posts,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

// @desc    Get single post by slug (increments views)
// @route   GET /api/posts/:slug
// @access  Public
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate('author', 'name username avatar bio socialLinks')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Only allow viewing drafts by the author
  if (post.status === 'draft') {
    if (!req.user || post.author._id.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Post not found');
    }
  } else {
    // Track unique-ish view using hashed IP + user agent, once per session per post
    const identifier = crypto
      .createHash('sha256')
      .update((req.ip || '') + (req.headers['user-agent'] || '') + post._id)
      .digest('hex');
    if (!post.viewedBy.includes(identifier)) {
      post.viewedBy.push(identifier);
      post.views += 1;
      await post.save();
    }
  }

  res.json(post);
});

// @desc    Get single post by id (for editing)
// @route   GET /api/posts/id/:id
// @access  Private (author only)
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('category', 'name').populate('tags', 'name');
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this post');
  }
  res.json(post);
});

// @desc    Create a new post (draft or published)
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, excerpt, category, tags, status } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  const post = await Post.create({
    title,
    content,
    excerpt,
    category: category || undefined,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
    status: status === 'published' ? 'published' : 'draft',
    publishedAt: status === 'published' ? new Date() : undefined,
    coverImage: req.file ? `/uploads/${req.file.filename}` : '',
    author: req.user._id,
  });

  // Notify subscribers if published
  if (post.status === 'published') {
    await notifySubscribers(post, req.user._id);
  }

  res.status(201).json(post);
});

// @desc    Update a post (edit draft, publish, or edit published post)
// @route   PUT /api/posts/:id
// @access  Private (author only)
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this post');
  }

  const wasPublished = post.status === 'published';

  const { title, content, excerpt, category, tags, status } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (excerpt) post.excerpt = excerpt;
  if (category) post.category = category;
  if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(',');
  if (req.file) post.coverImage = `/uploads/${req.file.filename}`;

  if (status && status !== post.status) {
    post.status = status;
    if (status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date();
    }
  }

  const updated = await post.save();

  if (!wasPublished && updated.status === 'published') {
    await notifySubscribers(updated, req.user._id);
  }

  res.json(updated);
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (author only)
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ message: 'Post deleted' });
});

// @desc    Get logged-in user's own posts (drafts + published)
// @route   GET /api/posts/mine/all
// @access  Private
export const getMyPosts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { author: req.user._id };
  if (status) query.status = status;

  const posts = await Post.find(query)
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .sort('-updatedAt');

  res.json(posts);
});

// @desc    Like / unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const idx = post.likes.findIndex((id) => id.toString() === req.user._id.toString());
  let liked;
  if (idx > -1) {
    post.likes.splice(idx, 1);
    liked = false;
  } else {
    post.likes.push(req.user._id);
    liked = true;
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        type: 'like',
        message: `${req.user.name} liked your post "${post.title}"`,
        post: post._id,
      });
    }
  }
  await post.save();

  res.json({ liked, likeCount: post.likes.length });
});

// @desc    Track a social share
// @route   PUT /api/posts/:id/share
// @access  Public
export const trackShare = asyncHandler(async (req, res) => {
  const { platform } = req.body; // facebook, twitter, linkedin, whatsapp, email
  const validPlatforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email'];
  if (!validPlatforms.includes(platform)) {
    res.status(400);
    throw new Error('Invalid platform');
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.shares[platform] = (post.shares[platform] || 0) + 1;
  await post.save();

  res.json({ shares: post.shares, totalShares: post.totalShares });
});

// @desc    Get analytics for a single post (author only)
// @route   GET /api/posts/:id/analytics
// @access  Private (author only)
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const commentCount = await Comment.countDocuments({ post: post._id, status: 'approved' });

  res.json({
    postId: post._id,
    title: post.title,
    views: post.views,
    likes: post.likes.length,
    comments: commentCount,
    shares: post.shares,
    totalShares: post.totalShares,
    publishedAt: post.publishedAt,
  });
});

// @desc    Get aggregate analytics for all of the logged-in user's posts
// @route   GET /api/posts/mine/analytics
// @access  Private
export const getMyAnalytics = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user._id, status: 'published' }).select(
    'title slug views likes shares publishedAt'
  );

  const postIds = posts.map((p) => p._id);
  const commentCounts = await Comment.aggregate([
    { $match: { post: { $in: postIds }, status: 'approved' } },
    { $group: { _id: '$post', count: { $sum: 1 } } },
  ]);
  const commentMap = {};
  commentCounts.forEach((c) => (commentMap[c._id.toString()] = c.count));

  const data = posts.map((p) => ({
    id: p._id,
    title: p.title,
    slug: p.slug,
    views: p.views,
    likes: p.likes.length,
    comments: commentMap[p._id.toString()] || 0,
    totalShares:
      (p.shares.facebook || 0) +
      (p.shares.twitter || 0) +
      (p.shares.linkedin || 0) +
      (p.shares.whatsapp || 0) +
      (p.shares.email || 0),
    publishedAt: p.publishedAt,
  }));

  const totals = data.reduce(
    (acc, p) => {
      acc.views += p.views;
      acc.likes += p.likes;
      acc.comments += p.comments;
      acc.shares += p.totalShares;
      return acc;
    },
    { views: 0, likes: 0, comments: 0, shares: 0 }
  );

  res.json({ posts: data, totals, postCount: data.length });
});

// Helper: notify subscribers when an author publishes a new post
async function notifySubscribers(post, authorId) {
  const subscribers = await User.find({
    $or: [{ subscribedAuthors: authorId }, { subscribedCategories: post.category }],
  }).select('_id');

  if (subscribers.length === 0) return;

  const author = await User.findById(authorId).select('name');
  const notifications = subscribers.map((s) => ({
    recipient: s._id,
    type: 'new_post',
    message: `${author.name} published a new post: "${post.title}"`,
    post: post._id,
  }));

  await Notification.insertMany(notifications);
}
