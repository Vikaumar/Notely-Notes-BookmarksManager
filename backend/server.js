const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet()); // Set security headers

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://notely-notes-bookmarks.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running',
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notes & Bookmarks API v2.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/logout': 'Logout user (protected)',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/me': 'Get current user (protected)',
        'PUT /api/auth/updatepassword': 'Update password (protected)'
      },
      notes: {
        'POST /api/notes': 'Create note (protected)',
        'GET /api/notes': 'Get all notes (protected)',
        'GET /api/notes/stats': 'Get note statistics (protected)',
        'GET /api/notes/:id': 'Get single note (protected)',
        'PUT /api/notes/:id': 'Update note (protected)',
        'DELETE /api/notes/:id': 'Delete note (protected)',
        'DELETE /api/notes': 'Delete all notes (protected)'
      },
      bookmarks: {
        'POST /api/bookmarks': 'Create bookmark (protected)',
        'GET /api/bookmarks': 'Get all bookmarks (protected)',
        'GET /api/bookmarks/stats': 'Get bookmark statistics (protected)',
        'GET /api/bookmarks/:id': 'Get single bookmark (protected)',
        'PUT /api/bookmarks/:id': 'Update bookmark (protected)',
        'DELETE /api/bookmarks/:id': 'Delete bookmark (protected)',
        'DELETE /api/bookmarks': 'Delete all bookmarks (protected)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Notes & Bookmarks API Server                            ║
╠═══════════════════════════════════════════════════════════╣
║   Environment: ${process.env.NODE_ENV.padEnd(41)}║
║   Port: ${String(PORT).padEnd(49)}║
║   API Docs: http://localhost:${PORT}/api${' '.repeat(23)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
