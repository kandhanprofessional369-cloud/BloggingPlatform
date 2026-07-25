import mongoose from 'mongoose';
import slugify from 'slugify';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true },
    content: { type: String, required: [true, 'Content is required'] }, // HTML from rich text editor
    excerpt: { type: String, maxlength: 300 },
    coverImage: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    viewedBy: [{ type: String }], // ip/session hashes to avoid duplicate counts
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: {
      facebook: { type: Number, default: 0 },
      twitter: { type: Number, default: 0 },
      linkedin: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

postSchema.pre('validate', function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  if (!this.excerpt && this.content) {
    const plain = this.content.replace(/<[^>]+>/g, '');
    this.excerpt = plain.substring(0, 200);
  }
  next();
});

postSchema.virtual('totalShares').get(function () {
  const s = this.shares || {};
  return (s.facebook || 0) + (s.twitter || 0) + (s.linkedin || 0) + (s.whatsapp || 0) + (s.email || 0);
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

export default mongoose.model('Post', postSchema);
