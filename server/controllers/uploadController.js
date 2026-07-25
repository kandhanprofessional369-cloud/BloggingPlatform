import asyncHandler from 'express-async-handler';

// @desc    Upload an image (used by rich text editor for inline images)
// @route   POST /api/upload
// @access  Private
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});
