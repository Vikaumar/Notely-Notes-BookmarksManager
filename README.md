# ✨ Notely

> Your personal notes & bookmark manager

A full-stack web application for saving, searching, and organizing notes and bookmarks.

**Built for Dev Innovations Labs - Developer Assignment**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js, MongoDB |
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Auth** | JWT (Access + Refresh Tokens) |

---

## ✨ Features

### Core
- ✅ Notes CRUD with tags
- ✅ Bookmarks with auto-fetch titles
- ✅ Full-text search
- ✅ Filter by tags

### Bonus
- ✅ JWT Authentication
- ✅ Favorites
- ✅ Dark/Light Mode
- ✅ Export (JSON/HTML)
- ✅ Rate Limiting
- ✅ Security Headers

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure MongoDB URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**URLs:**
- App: http://localhost:3000
- API: http://localhost:5002

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |

### Notes & Bookmarks
| Method | Endpoint |
|--------|----------|
| GET | `/api/notes` |
| POST | `/api/notes` |
| PUT | `/api/notes/:id` |
| DELETE | `/api/notes/:id` |

Same pattern for `/api/bookmarks`

**Query:** `?q=search&tags=tag1,tag2&favorites=true`

---

## � Environment Variables

### Backend (.env)
```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/notely
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

---

## 👤 Author

**Vishal Kumar** - vikumar162006@gmail.com

---

*Created for Dev Innovations Labs hiring assignment*
