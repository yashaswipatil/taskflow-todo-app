# TaskFlow — Async To-Do App

A full-stack to-do list app built with React, Node.js, TailwindCSS/DaisyUI, and a BullMQ-style async deletion queue.

---

## 🚀 Tech Stack & Why

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React 18 + Vite | Fast dev server, great ecosystem, component model fits well |
| Styling | TailwindCSS v3 + DaisyUI v4 | Utility-first CSS with pre-built accessible components |
| HTTP Client | Axios | Cleaner API than fetch, easy error handling |
| Backend | Node.js + Express | Lightweight, perfect for a mock REST API |
| Queue | Array-based simulation | Mirrors BullMQ concepts without needing Redis |

---

## 📁 Project Structure

```
taskflow-todo-app/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddTaskForm.jsx    # Input + validation
│   │   │   ├── TaskItem.jsx       # Single task row
│   │   │   ├── TaskList.jsx       # Renders all tasks
│   │   │   └── QueuePanel.jsx     # Live queue visualiser
│   │   ├── hooks/
│   │   │   └── useTasks.js        # All state + API logic
│   │   ├── utils/
│   │   │   └── api.js             # Axios API calls
│   │   ├── App.jsx                # Main layout
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind directives
│   ├── vite.config.js             # Vite + proxy config
│   ├── tailwind.config.js         # Tailwind + DaisyUI config
│   ├── postcss.config.js          # PostCSS config
│   └── package.json
├── server/
│   ├── index.js                   # Express API + queue worker
│   └── package.json
└── README.md
```

---

## ⚙️ Setup & Running

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/taskflow-todo-app.git
cd taskflow-todo-app
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
# API running at http://localhost:3001
```

### 3. Start the frontend

```bash
cd client
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/tasks` | Fetch all tasks |
| POST | `/tasks` | Create a new task |
| PATCH | `/tasks/:id` | Toggle task completed |
| DELETE | `/tasks/:id` | Queue task for async deletion |
| GET | `/queue` | Inspect queue state |

---

## 🗂️ BullMQ-Style Queue — How It Works

Real BullMQ uses Redis-backed queues with Workers. This app simulates the same concepts using plain JavaScript:

```
Real BullMQ          →   Our Simulation
─────────────────────────────────────────
Redis queue          →   JS array (deletionQueue)
Job object           →   Plain JS object { id, taskId, state }
Worker process       →   setInterval loop (runs every 1.5s)
Job states           →   waiting → active → completed | failed
Retry / failure      →   10% random failure simulation
```

### Flow when you delete a task:

```
1. DELETE /tasks/:id hits the API
2. Server returns 202 Accepted (not deleted yet!)
3. Job added to deletionQueue array with state: "waiting"
4. Worker picks it up every 1.5s → state: "active"
5. After 800ms → state: "completed" (task removed) or "failed"
6. Frontend polls /queue every 2s and updates the UI
```

---

## 🎨 Styling Choices

- **DaisyUI `light` theme** — dark theme applied via `data-theme="light"` on `<html>`
- **Vite proxy** — all API calls go through `/api` prefix, forwarded to port 3001. This avoids CORS issues entirely in development
- **Optimistic UI** — checkbox toggles update instantly, rollback on error

---

## 🛠️ Key Design Decisions

**Why Vite proxy instead of CORS?**
During development, routing API calls through Vite's built-in proxy (`/api → localhost:3001`) is cleaner than configuring CORS headers. Both the frontend and API appear to be on the same origin.

**Why array-based queue instead of real BullMQ?**
BullMQ requires Redis. An array-based simulation keeps the project dependency-free while demonstrating the same job lifecycle concepts: enqueue, process, complete/fail.

**Why custom `useTasks` hook?**
Separating all state logic into a custom hook keeps `App.jsx` clean and makes the data layer easy to test or swap out independently.

---

## 📸 Features

- ✅ Fetch tasks from Node.js API (JSONPlaceholder-style mock data)
- ✅ Add new tasks with validation
- ✅ Toggle tasks complete/incomplete with optimistic updates
- ✅ Async deletion via BullMQ-style queue simulation
- ✅ Live queue inspector panel (auto-polls every 2s)
- ✅ Error handling with user-friendly messages
- ✅ Responsive layout with TailwindCSS + DaisyUI
- ✅ Dark theme (DaisyUI light)