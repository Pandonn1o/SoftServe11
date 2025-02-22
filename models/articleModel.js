const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  evaluation: {
    type: String,
    enum: ['like', 'dislike'],
  },
  content: {
    type: String,
    trim: true,
  },
  lastChangedAt: {
    type: Date,
    default: Date.now,
  },
});

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      unique: true,
      minlength: [10, 'Title should be longer than 10 characters'],
    },
    theme: {
      type: String,
      required: [true, 'Theme is required'],
      enum: ['trips', 'shopping', 'beauty', 'art', 'food'],
    },
    description: {
      type: String,
      trim: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    lastChangedAt: {
      type: Date,
      default: Date.now,
    },
    comments: [commentSchema],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual properties for likesQuantity, dislikesQuantity and rating
articleSchema.virtual('likesQuantity').get(function () {
  return this.comments.filter((comment) => comment.evaluation === 'like').length;
});

articleSchema.virtual('dislikesQuantity').get(function () {
  return this.comments.filter((comment) => comment.evaluation === 'dislike').length;
});

articleSchema.virtual('rating').get(function () {
  const totalComments = this.comments.length;
  if (totalComments === 0) {
    return 0;
  }
  const likes = this.likesQuantity;
  const dislikes = this.dislikesQuantity;
  return (likes - dislikes) / totalComments + 1;
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;