const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Bookmark = require('../models/Bookmark');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth');
const { fetchPageTitle } = require('../utils/fetchMetadata');

// All routes require authentication
router.use(protect);

// Validation rules for bookmarks
const bookmarkValidation = [
  body('url')
    .notEmpty()
    .withMessage('URL is required')
    .matches(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)
    .withMessage('Please provide a valid URL'),
  body('title')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Title cannot exceed 300 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean')
];

// @route   POST /api/bookmarks
// @desc    Create a new bookmark (auto-fetches title if not provided)
// @access  Private
router.post('/', bookmarkValidation, validateRequest, async (req, res, next) => {
  try {
    let { url, title, description, tags, isFavorite, isPinned } = req.body;

    // Auto-fetch title if not provided
    if (!title || title.trim() === '') {
      const fetchedTitle = await fetchPageTitle(url);
      title = fetchedTitle || url;
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      url,
      title,
      description: description || '',
      tags: tags || [],
      isFavorite: isFavorite || false,
      isPinned: isPinned || false
    });

    res.status(201).json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookmarks
// @desc    Get all bookmarks for current user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { q, tags, favorites, pinned } = req.query;
    let query = { user: req.user._id };

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { url: { $regex: q, $options: 'i' } }
      ];
    }

    // Tag filter
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    // Favorites filter
    if (favorites === 'true') {
      query.isFavorite = true;
    }

    // Pinned filter
    if (pinned === 'true') {
      query.isPinned = true;
    }

    const bookmarks = await Bookmark.find(query)
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookmarks/stats
// @desc    Get bookmark statistics for current user
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await Bookmark.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalBookmarks: { $sum: 1 },
          favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
          pinned: { $sum: { $cond: ['$isPinned', 1, 0] } }
        }
      }
    ]);

    // Get unique tags
    const tags = await Bookmark.distinct('tags', { user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        totalBookmarks: stats[0]?.totalBookmarks || 0,
        favorites: stats[0]?.favorites || 0,
        pinned: stats[0]?.pinned || 0,
        totalTags: tags.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookmarks/:id
// @desc    Get single bookmark by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bookmarks/:id
// @desc    Update a bookmark
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    const { url, title, description, tags, isFavorite, isPinned } = req.body;

    let bookmark = await Bookmark.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found'
      });
    }

    bookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      { url, title, description, tags, isFavorite, isPinned },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/bookmarks/:id
// @desc    Delete a bookmark
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found'
      });
    }

    await bookmark.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/bookmarks
// @desc    Delete all bookmarks for current user
// @access  Private
router.delete('/', async (req, res, next) => {
  try {
    const result = await Bookmark.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} bookmarks`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
