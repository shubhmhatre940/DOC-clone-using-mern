# Google Docs Clone (MERN Stack) — Phase 0 & Phase 1

A modern, modular **Google Docs clone** built with the **MERN stack** (MongoDB, Express.js, React, Node.js), styled with Tailwind CSS to accurately mirror the official Google Docs interface and user experience.

---

## 🚀 Overview

- **Phase 0 (Setup & Architecture):** Monorepo structure with `/client` and `/server`, Mongoose database connection, Express middleware, Vite React setup with Tailwind CSS, health check API, and environment configurations.
- **Phase 1 (Core CRUD & Document Management):** Full JWT authentication with bcrypt password hashing, document model and RESTful CRUD endpoints, Google Docs-style dashboard with template picker, paper canvas document editor powered by TipTap, inline document title editing, toolbar formatting, and manual/keyboard saving (`Ctrl+S` / `Cmd+S`).

*Note: Real-time multi-user collaboration (WebSockets / Yjs) will be introduced in subsequent phases. This codebase provides a clean, modular foundation for extension.*

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS (Google Material Design color palette: `#1a73e8` Google Blue, `#f1f3f4` / `#f8f9fa` canvas)
- **Rich Text Editor:** TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-text-align`, `@tiptap/extension-placeholder`)
- **HTTP Client:** Axios (with Bearer token interceptor)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (`jsonwebtoken`) & password hashing with `bcryptjs`
- **Security & Config:** CORS, Dotenv

---

## 📂 Project Structure

```
DOCS_mern/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js        # Configured Axios instance with auth interceptor
│   │   │   └── documents.js    # Document API service
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx          # Top Google Docs search & user bar
│   │   │   │   └── ProtectedRoute.jsx  # Authentication route guard
│   │   │   ├── dashboard/
│   │   │   │   ├── TemplateHeader.jsx  # "+ Blank document" template row
│   │   │   │   ├── DocumentCard.jsx    # Google Docs style document card with menu
│   │   │   │   └── DocumentList.jsx    # Document grid & list display
│   │   │   └── editor/
│   │   │       ├── EditorNavbar.jsx    # Editable title, Google Docs logo, save status
│   │   │       ├── EditorToolbar.jsx   # Formatting toolbar (B, I, U, S, H1-H3, Align, Lists)
│   │   │       └── TiptapEditor.jsx    # Paper-styled page canvas with margins & shadow
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Auth state provider (login, signup, logout)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx           # Clean Google-style Sign In
│   │   │   ├── SignupPage.jsx          # Google-style Account Creation
│   │   │   ├── DashboardPage.jsx       # Docs file picker dashboard
│   │   │   └── EditorPage.jsx          # Paper canvas document editor
│   │   ├── App.jsx                     # Route definitions
│   │   ├── index.css                   # Tailwind CSS & TipTap typography
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Backend (Express + Node + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Auth handler (register, login, getMe)
│   │   └── documentController.js # CRUD handlers for user documents
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   └── errorHandler.js     # Standardized JSON error response
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt password hashing
│   │   └── Document.js         # Document schema (title, content, owner, timestamps)
│   ├── routes/
│   │   ├── healthRoutes.js     # GET /api/health
│   │   ├── authRoutes.js       # /api/auth
│   │   └── documentRoutes.js   # /api/documents
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Getting Started Locally

### Prerequisites
- **Node.js**: v18 or later (tested on v24)
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or a MongoDB Atlas connection string.

---

### 1. Backend Setup

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Verify that `MONGO_URI` matches your running MongoDB instance.*

4. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   Server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open another terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Default points to `http://localhost:5000/api`.*

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### Health Check
- `GET /api/health` — Public server status

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create account (`name`, `email`, `password`)
- `POST /api/auth/login` — Sign in (`email`, `password`) -> Returns JWT
- `GET /api/auth/me` — Get current logged-in user profile (Protected)

### Documents (`/api/documents`) — All Protected
- `POST /api/documents` — Create a new blank document
- `GET /api/documents` — List all documents owned by logged-in user
- `GET /api/documents/:id` — Fetch single document by ID (Owner only)
- `PUT /api/documents/:id` — Update document title and/or content
- `DELETE /api/documents/:id` — Delete document by ID (Owner only)

---

## 🎨 Google Docs UI Features
- **Top App Bar & Search:** Google Docs styled top bar with search filter and profile avatar.
- **Start New Document:** Google Docs template banner with "+ Blank document" card with official colored plus emblem.
- **Document Cards:** Thumbnail preview card showing title, last modified date, and 3-dot dropdown with delete action.
- **Editable Document Title:** In-navbar document title with blur/enter persistence.
- **Save Status Indicator:** Displays `Saved to Drive`, `Saving...`, or `Unsaved changes` with subtle icons.
- **Paper Canvas:** Centered white document sheet with drop shadow (`shadow-md`) on light-gray canvas (`#f8f9fa`).
- **Keyboard Shortcuts:** `Ctrl + S` or `Cmd + S` saves changes instantly.
