import asyncHandler from 'express-async-handler';
import Tag from '../models/Tag.js';
import Post from '../models/Post.js';

export const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find().sort('name');
  res.json(tags);
});

export const getTagPosts = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({ slug: req.params.slug });
  if (!tag) {
    res.status(404);
    throw new Error('Tag not found');
  }
  const posts = await Post.find({ tags: tag._id, status: 'published' })
    .populate('author', 'name username avatar')
    .populate('category', 'name slug')
    .sort('-publishedAt');
  res.json({ tag, posts });
});

export const createTag = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Tag name is required');
  }
  let tag = await Tag.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (tag) {
    return res.status(200).json(tag);
  }
  tag = await Tag.create({ name, createdBy: req.user._id });
  res.status(201).json(tag);
});

export const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);
  if (!tag) {
    res.status(404);
    throw new Error('Tag not found');
  }
  await tag.deleteOne();
  res.json({ message: 'Tag deleted' });
});
