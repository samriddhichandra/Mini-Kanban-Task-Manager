# Mini Kanban Task Manager

A lightweight, full-stack kanban board built with **React + Vite** (frontend) and **Express** (backend). Supports drag-and-drop task management, priority tracking, due dates, and a light/dark theme toggle.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)

---

## Features

- **Kanban board** with `To Do` and `Done` columns
- **Task creation** with title, priority, status, and due date fields
- **Task actions** — update status or delete via a per-card context menu
- **Drag-and-drop** support for moving tasks between columns
- **Light/dark theme** toggle
- **REST API** backend with in-memory task storage

---

## Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React 18, Vite      |
| Backend   | Node.js, Express    |
| Styling   | CSS / Tailwind (TBD)|
| Transport | REST (JSON)         |

---

## Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9 or higher (bundled with Node.js)

Verify your versions:

```bash
node --version   # should be >= 18
npm --version    # should be >= 9
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/mini-kanban.git
cd mini-kanban
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development servers

```bash
npm run dev
```

This command starts both the Express API server and the Vite development server concurrently.

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://127.0.0.1:5173      |
| Backend  | http://localhost:3001      |

Open your browser and navigate to `http://127.0.0.1:5173` to use the app.

---

## Project Structure

mini-kanban/
├── public/               # Static assets
├── src/                  # React application source
│   ├── components/       # UI components (Board, TaskCard, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── App.jsx           # Root component
│   └── main.jsx          # Vite entry point
├── server/               # Express API server
│   └── index.js          # Server entry point and route definitions
├── index.html            # App shell (Vite template)
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies and scripts

---

## Available Scripts

| Script              | Description                                           |
|---------------------|-------------------------------------------------------|
| `npm run dev`       | Starts both Vite and Express servers in watch mode    |
| `npm run build`     | Compiles the React app for production (`dist/`)       |
| `npm run preview`   | Previews the production build locally                 |

---

## API Reference

The Express server exposes a simple REST API at `http://localhost:3001`.

### Tasks

| Method   | Endpoint         | Description              |
|----------|------------------|--------------------------|
| `GET`    | `/api/tasks`     | Fetch all tasks          |
| `POST`   | `/api/tasks`     | Create a new task        |
| `PATCH`  | `/api/tasks/:id` | Update a task's fields   |
| `DELETE` | `/api/tasks/:id` | Delete a task            |

#### Task schema

```json
{
  "id": "string",
  "title": "string",
  "priority": "low | medium | high",
  "status": "todo | done",
  "dueDate": "YYYY-MM-DD"
}
```

---

## Configuration

The Vite development server proxies API requests to Express automatically. No environment variables are required for local development.

For custom ports, update the following:

- **Vite port**: `vite.config.js` → `server.port`
- **Express port**: `server/index.js` → the `PORT` constant (default: `3001`)
- **API base URL**: `src/` → wherever the base URL is defined (e.g., a constants file or `.env`)

---

## Known Limitations

- **No persistent storage** — the Express server uses in-memory storage. All tasks are lost when the server restarts. For persistence, replace with a database (e.g., SQLite, PostgreSQL) or a file-backed store.
- **No authentication** — the API is open with no auth layer. Do not expose this server publicly without adding authentication.
- **Single-user** — no multi-user or real-time sync support.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

