import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    slug: { type: String, unique: true },
    description: { type: String, maxlength: 300, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export default mongoose.model('Category', categorySchema);
