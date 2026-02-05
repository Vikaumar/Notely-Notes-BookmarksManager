# Personal Notes & Bookmark Manager - Frontend

A modern, responsive web application built with Next.js 14 and Tailwind CSS for managing personal notes and bookmarks.

## Features

- 📝 Create, edit, and delete notes
- 🔖 Save and manage bookmarks with auto-fetched titles
- 🏷️ Tag-based organization
- 🔍 Full-text search
- ⭐ Mark items as favorites
- 📱 Fully responsive design
- 🌙 Beautiful dark theme

## Prerequisites

- Node.js (v18 or higher)
- Backend server running on port 5000

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css       # Global styles & Tailwind
│   │   ├── layout.js         # Root layout
│   │   ├── page.js           # Landing page
│   │   ├── notes/
│   │   │   └── page.js       # Notes page
│   │   └── bookmarks/
│   │       └── page.js       # Bookmarks page
│   ├── components/
│   │   ├── Navbar.js         # Navigation
│   │   ├── NoteCard.js       # Note display
│   │   ├── BookmarkCard.js   # Bookmark display
│   │   ├── Modal.js          # Reusable modal
│   │   ├── SearchBar.js      # Search with tags
│   │   └── TagInput.js       # Tag input
│   └── lib/
│       └── api.js            # API utilities
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── package.json
```

## Environment Variables

Create a `.env.local` file if you need to change the API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Pages

### Home (`/`)
Landing page with navigation to Notes and Bookmarks sections.

### Notes (`/notes`)
- View all notes in a card grid
- Create new notes with title, content, and tags
- Edit and delete existing notes
- Search notes by text
- Filter by tags
- Mark notes as favorites

### Bookmarks (`/bookmarks`)
- View all bookmarks in a card grid
- Add bookmarks with URL, title, description, and tags
- Title is auto-fetched if left empty
- Edit and delete bookmarks
- Search bookmarks by text
- Filter by tags
- Mark bookmarks as favorites

## Technologies

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS
- **React Icons** - Icon library
- **Axios** - HTTP client
