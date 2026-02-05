const { validationResult } = require('express-validator');

/**
 * Middleware to validate request using express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages: errors.array().map(e => e.msg)
    });
  }
  next();
};

module.exports = validateRequest;
