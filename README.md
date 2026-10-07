# Google Docs Clone (MERN Stack)

A modern, full-featured **Google Docs clone** built with the **MERN stack** (MongoDB, Express.js, React, Node.js) and styled with Tailwind CSS to accurately mirror the official Google Docs interface, rich text editing experience, and real-time collaborative workspace.

---

## 🚀 Key Features

### 1. Real-Time Collaboration & Sync
- **Yjs & WebSockets**: Conflict-free replicated data types (CRDTs) powering real-time co-authoring without lock contention.
- **Collaborator Awareness**: Real-time cursor presence and collaborator avatars displayed in the navbar.
- **Auto-Save & Status Indicators**: Seamless background persistence (`Saved to Drive`, `Saving...`, `Unsaved changes`).

### 2. Rich Text Editor & Google Docs Canvas
- **TipTap Rich Text Engine**: Built on ProseMirror, featuring paragraph styles (Title, Subtitle, Headings 1–6), font families, granular font size controls with standard point (`pt`) & pixel (`px`) unit parsing and seamless step increments/decrements, colors, highlights, alignments, lists (bulleted, numbered, checklist), indentations, and blockquotes.
- **Google Paper Canvas**: Centered white document sheet with drop shadow (`shadow-md`) on light-gray canvas (`#f8f9fa`), with toggleable ruler and document outline sidebar.
- **Reading & Viewing Modes**: Switch between **Editing**, **Suggesting**, and **Viewing** modes with dynamic permission-based controls.

### 3. Page-Based Layout Features
- **Pageless ↔ Paginated View**: Toggle between a modern continuous fluid document and a realistic paginated canvas.
- **Page Orientation**: Switch between Portrait (`816px × 1056px`) and Landscape (`1056px × 816px`) layouts on demand.
- **Multi-Column Formatting**: Seamlessly layout sections into 1, 2, or 3 columns.
- **Headers & Footers**: Double-click or menu-driven header and footer editing overlay with customizable margins.
- **Page Numbers**: Insert page numbers in top/bottom corners with dynamic counting.

### 4. Word (.docx) Import & Multi-Format Export
- **Word (.docx) Import**: Upload Word documents with automatic HTML conversion via Mammoth, intelligent typography & font size normalization (preserving standard pt/px formatting), and seamless initial content seeding into Yjs.
- **Multi-Format Export**:
  - **PDF**: Pixel-perfect PDF generation via headless Puppeteer.
  - **Word (.docx)**: Clean `.docx` document generation via `html-to-docx`.
  - **Plain Text (`.txt`)** and **HTML (`.html`)**.

### 5. Comprehensive Google Docs Menu Bar
- **File**: New, Open, Make a copy, Share, Email, Export/Download, Rename, Move to folder, Move to trash, Version history, Details, Page setup, Print.
- **Edit**: Undo, Redo, Cut, Copy, Paste, Select all, Find & Replace.
- **View**: Mode selection, Ruler toggle, Document outline, Full screen, Pageless view.
- **Insert**: Images, Interactive Tables, Charts (Bar, Column, Line, Pie), Drawings, Math/Equations, Watermarks, Smart Chips (Date, Person, File), Dropdowns, Special Characters, Horizontal Lines, Page & Section Breaks, Bookmarks, Table of Contents.
- **Format**: Text styles, Capitalization, Line spacing, Alignment, Indentation, Columns, Headers & Footers, Page numbers, Page orientation, Clear formatting (`Ctrl+\`).
- **Tools**: Word & character count statistics, Voice typing (Web Speech API), Citations & bibliography, Dictionary & thesaurus, Document translation, Spelling & grammar review.
- **Extensions & Help**: Add-ons showcase, Keyboard shortcuts modal.

### 6. Sharing, Permissions & Collaboration
- **Role-Based Access Control**: Granular roles: **Owner**, **Editor**, **Commenter**, and **Viewer**.
- **Share Modal**: Invite collaborators by email or generate public shareable links (`Restricted` or `Anyone with link`).
- **Comments & Mentions**: Add comments to selections, reply to threads, and resolve comment items.
- **Version History**: Review chronological revisions, view auto-snapshots, and restore past versions.
- **Activity Log & Notifications**: Track document edits, renames, permissions changes, and notifications.

### 7. Dashboard & File Organization
- **Google Docs File Picker**: Clean dashboard with search, grid/list view toggles, and sorting.
- **Template Gallery**: Pre-built templates (Resume, Project Proposal, Meeting Notes, Newsletter, etc.) with category filtering.
- **Folder Management**: Create folders and organize documents with drag-and-drop or menu actions.
- **Starred & Trash**: Quick-access starred documents and soft-delete trash bin with restore and permanent delete capabilities.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router v7
- **Styling:** Vanilla CSS & Tailwind CSS (Google Material Design color palette)
- **Rich Text Editor:** TipTap (`@tiptap/react`, `@tiptap/starter-kit`, custom extensions for columns, page layout, text styling)
- **Real-Time Collaboration:** `yjs`, `y-websocket`
- **HTTP Client:** Axios (with Bearer token interceptor)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js with WebSockets (`ws`)
- **Database:** MongoDB with Mongoose
- **Real-Time Sync:** Yjs WebSocket server (`y-websocket/bin/utils`)
- **File Processing & Conversion:**
  - `mammoth`: Word `.docx` → HTML conversion
  - `multer`: Multipart file uploads
  - `puppeteer`: High-fidelity PDF export
  - `html-to-docx`: HTML → Word `.docx` export
- **Auth & Security:** JWT (`jsonwebtoken`), `bcryptjs`, CORS, Rate Limiting (`express-rate-limit`), Sanitization (`isomorphic-dompurify`)

---

## 📂 Project Structure

```
DOCS_mern/
├── client/                                 # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                            # Axios API services (auth, documents, comments, versions, folders)
│   │   ├── components/
│   │   │   ├── activity/                   # Activity log modal & drawer
│   │   │   ├── comments/                   # Comment bubbles, sidebars & reply threads
│   │   │   ├── common/                     # Navbar, search, modals, protected routes
│   │   │   ├── dashboard/                  # Template gallery, document grid & list cards
│   │   │   ├── editor/                     # Editor canvas, toolbar, menu bar, page layout container
│   │   │   ├── history/                    # Version history timeline & snapshot diffs
│   │   │   ├── insert/                     # Modals for charts, drawings, equations, watermarks, etc.
│   │   │   ├── notifications/              # Notification dropdown & alerts
│   │   │   └── tools/                      # Word count, voice typing, citations, dictionary modals
│   │   ├── context/                        # AuthContext, NotificationContext
│   │   ├── hooks/                          # Custom React hooks
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx               # Google-style Sign In
│   │   │   ├── SignupPage.jsx              # Google-style Sign Up
│   │   │   ├── DashboardPage.jsx           # File dashboard
│   │   │   └── EditorPage.jsx              # Main document editor workspace
│   │   ├── App.jsx                         # Route definitions
│   │   └── index.css                       # Design system & paper typography styles
│   └── package.json
│
├── server/                                 # Backend (Express + WebSockets + Mongoose)
│   ├── config/                             # MongoDB connection
│   ├── controllers/                        # Business logic for auth, documents, export, share, etc.
│   ├── middleware/                         # Auth verification, permissions, rate limiters, error handling
│   ├── models/                             # Mongoose schemas (User, Document, Comment, Version, Folder, Notification)
│   ├── routes/                             # Express REST API routes
│   ├── services/                           # Background services (snapshots, notifications)
│   ├── utils/                              # Content sanitization, activity log helpers
│   ├── server.js                           # Express app + HTTP & WebSocket server initialization
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

1. Open a terminal and navigate to `server/`:
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
   *Verify that `MONGO_URI` points to your MongoDB instance (e.g. `mongodb://localhost:27017/google-docs-clone`).*

4. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend API and WebSocket server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open another terminal and navigate to `client/`:
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
   *Default API URL points to `http://localhost:5000/api`.*

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📡 API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/auth/me` — Get current logged-in user profile

### Documents (`/api/documents`)
- `POST /api/documents` — Create a blank or template-seeded document
- `POST /api/documents/upload` — Upload and convert a Word `.docx` file
- `GET /api/documents` — List user's documents (supports `?type=shared`, `?type=owned`, `?folder=...`)
- `GET /api/documents/:id` — Fetch document by ID with permission checks
- `PUT /api/documents/:id` — Update title, content, or page settings
- `DELETE /api/documents/:id` — Soft-delete to trash
- `PATCH /api/documents/:id/restore` — Restore from trash
- `DELETE /api/documents/:id/permanent` — Permanently delete
- `PATCH /api/documents/:id/star` — Toggle starred status
- `PATCH /api/documents/:id/move` — Move document to folder
- `GET /api/documents/search` — Search documents by query

### Sharing & Collaboration
- `GET /api/documents/:id/collaborators` — List collaborators
- `POST /api/documents/:id/collaborators` — Add collaborator by email
- `DELETE /api/documents/:id/collaborators/:userId` — Remove collaborator
- `PATCH /api/documents/:id/visibility` — Update visibility (`restricted` / `anyone-with-link`)

### Export (`/api/documents/:id/export`)
- `GET /api/documents/:id/export?format=pdf` — Export as PDF (Puppeteer)
- `GET /api/documents/:id/export?format=docx` — Export as Word document
- `GET /api/documents/:id/export?format=txt` — Export as plain text
- `GET /api/documents/:id/export?format=html` — Export as HTML

### Versions & History (`/api/documents/:id/versions`)
- `GET /api/documents/:id/versions` — List saved revisions & snapshots
- `POST /api/documents/:id/versions` — Create a named version
- `POST /api/documents/:id/versions/:versionId/restore` — Rollback document to revision

### Comments (`/api/documents/:id/comments`)
- `GET /api/documents/:id/comments` — Get document comments
- `POST /api/documents/:id/comments` — Add comment or reply
- `PATCH /api/documents/:id/comments/:commentId` — Resolve/edit comment

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
