# Personal Notes & Bookmark Manager - Backend

A RESTful API built with Node.js, Express, and MongoDB for managing personal notes and bookmarks.

## Features

- Full CRUD operations for notes and bookmarks
- Search functionality by text
- Filter by tags
- Mark items as favorites
- Auto-fetch page title for bookmarks
- Input validation and error handling

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (or copy from `.env.example`):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/notes-bookmarks
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

### Notes API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notes` | Create a new note |
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/:id` | Get a single note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

#### Query Parameters (GET /api/notes)
- `q` - Search term (searches in title and content)
- `tags` - Comma-separated tags to filter by
- `favorites` - Set to `true` to show only favorites

#### Request Body (POST/PUT)
```json
{
  "title": "My Note",
  "content": "Note content here...",
  "tags": ["personal", "ideas"],
  "isFavorite": false
}
```

### Bookmarks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookmarks` | Create a new bookmark |
| GET | `/api/bookmarks` | Get all bookmarks |
| GET | `/api/bookmarks/:id` | Get a single bookmark |
| PUT | `/api/bookmarks/:id` | Update a bookmark |
| DELETE | `/api/bookmarks/:id` | Delete a bookmark |

#### Query Parameters (GET /api/bookmarks)
- `q` - Search term (searches in title, description, URL)
- `tags` - Comma-separated tags to filter by
- `favorites` - Set to `true` to show only favorites

#### Request Body (POST/PUT)
```json
{
  "url": "https://example.com",
  "title": "Example Site",
  "description": "A great website",
  "tags": ["reference", "tools"],
  "isFavorite": false
}
```

> **Note**: If `title` is left empty when creating a bookmark, it will be automatically fetched from the URL.

## Sample cURL Requests

### Create a Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Note","content":"This is the content","tags":["personal"]}'
```

### Get All Notes
```bash
curl http://localhost:5000/api/notes
```

### Search Notes
```bash
curl "http://localhost:5000/api/notes?q=first&tags=personal"
```

### Create a Bookmark
```bash
curl -X POST http://localhost:5000/api/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com","description":"GitHub Homepage"}'
```

### Get All Bookmarks
```bash
curl http://localhost:5000/api/bookmarks
```

## Project Structure

```
backend/
├── config/
│   └── db.js           # MongoDB connection
├── middleware/
│   ├── errorHandler.js # Global error handler
│   └── validateRequest.js
├── models/
│   ├── Note.js         # Note schema
│   └── Bookmark.js     # Bookmark schema
├── routes/
│   ├── notes.js        # Notes API routes
│   └── bookmarks.js    # Bookmarks API routes
├── utils/
│   └── fetchMetadata.js # URL metadata fetcher
├── .env.example
├── package.json
├── README.md
└── server.js           # Express app entry point
```
