import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Post from '../models/Post.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  const withCounts = await Promise.all(
    categories.map(async (c) => ({
      ...c.toObject(),
      postCount: await Post.countDocuments({ category: c._id, status: 'published' }),
    }))
  );
  res.json(withCounts);
});

export const getCategoryPosts = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  const posts = await Post.find({ category: category._id, status: 'published' })
    .populate('author', 'name username avatar')
    .populate('tags', 'name slug')
    .sort('-publishedAt');
  res.json({ category, posts });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  const exists = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (exists) {
    res.status(400);
    throw new Error('Category already exists');
  }
  const category = await Category.create({ name, description, createdBy: req.user._id });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  category.name = req.body.name ?? category.name;
  category.description = req.body.description ?? category.description;
  const updated = await category.save();
  res.json(updated);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.json({ message: 'Category deleted' });
});
