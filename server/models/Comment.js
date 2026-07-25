import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    status: { type: String, enum: ['approved', 'pending', 'spam'], default: 'approved' },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Very basic spam heuristic: too many links or blacklisted words
commentSchema.pre('save', function (next) {
  const spamWords = ['viagra', 'casino', 'crypto-giveaway', 'free money'];
  const linkCount = (this.content.match(/https?:\/\//g) || []).length;
  const lower = this.content.toLowerCase();
  const hasSpamWord = spamWords.some((w) => lower.includes(w));
  if (linkCount > 3 || hasSpamWord) {
    this.status = 'spam';
  }
  next();
});

export default mongoose.model('Comment', commentSchema);
