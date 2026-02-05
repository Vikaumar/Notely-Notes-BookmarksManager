const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Note = require('../models/Note');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Validation rules for notes
const noteValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
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
    .withMessage('isPinned must be a boolean'),
  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string')
];

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', noteValidation, validateRequest, async (req, res, next) => {
  try {
    const { title, content, tags, isFavorite, isPinned, color } = req.body;
    
    const note = await Note.create({
      user: req.user._id,
      title,
      content,
      tags: tags || [],
      isFavorite: isFavorite || false,
      isPinned: isPinned || false,
      color: color || null
    });

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notes
// @desc    Get all notes for current user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { q, tags, favorites, pinned } = req.query;
    let query = { user: req.user._id };

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
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

    const notes = await Note.find(query)
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notes/stats
// @desc    Get note statistics for current user
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await Note.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
          pinned: { $sum: { $cond: ['$isPinned', 1, 0] } }
        }
      }
    ]);

    // Get unique tags
    const tags = await Note.distinct('tags', { user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        totalNotes: stats[0]?.totalNotes || 0,
        favorites: stats[0]?.favorites || 0,
        pinned: stats[0]?.pinned || 0,
        totalTags: tags.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    const { title, content, tags, isFavorite, isPinned, color } = req.body;

    let note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, isFavorite, isPinned, color },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notes
// @desc    Delete all notes for current user
// @access  Private
router.delete('/', async (req, res, next) => {
  try {
    const result = await Note.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} notes`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
