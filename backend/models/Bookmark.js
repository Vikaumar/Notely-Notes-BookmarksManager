const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
        },
        message: props => `${props.value} is not a valid URL`
      }
    },
    title: {
      type: String,
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    tags: {
      type: [String],
      default: []
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    favicon: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user queries
bookmarkSchema.index({ user: 1, createdAt: -1 });
bookmarkSchema.index({ user: 1, isFavorite: 1 });

// Text index for search
bookmarkSchema.index({ title: 'text', description: 'text', url: 'text' });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
