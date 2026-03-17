// server/index.js
const express = require("express");

const app = express();
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// 1. MOCK DATA — seeded from JSONPlaceholder structure
//    (mirrors https://jsonplaceholder.typicode.com/todos)
// ─────────────────────────────────────────────────────────────
let tasks = [
  { id: 1, title: "Buy groceries", completed: false, userId: 1 },
  { id: 2, title: "Read a book", completed: true, userId: 1 },
  { id: 3, title: "Write unit tests", completed: false, userId: 1 },
  { id: 4, title: "Deploy to production", completed: false, userId: 2 },
  { id: 5, title: "Review pull requests", completed: true, userId: 2 },
  { id: 6, title: "Update documentation", completed: false, userId: 1 },
  { id: 7, title: "Fix reported bugs", completed: false, userId: 3 },
  { id: 8, title: "Send weekly report", completed: true, userId: 3 },
];
let nextId = 9;

// ─────────────────────────────────────────────────────────────
// 2. BULLMQ-STYLE QUEUE SIMULATION (array-based)
//
//  Real BullMQ uses Redis + Workers. Here we simulate:
//    - Queue  → plain JS array
//    - Job    → { id, taskId, state, createdAt, ... }
//    - States → waiting → active → completed | failed
//    - Worker → setInterval loop (processes 1 job per tick)
// ─────────────────────────────────────────────────────────────
const deletionQueue = []; // acts as the queue
const jobHistory = []; // completed/failed log
let jobCounter = 1;

function enqueueDeleteJob(taskId) {
  const job = {
    id: `job-${jobCounter++}`,
    taskId,
    state: "waiting", // waiting → active → completed|failed
    createdAt: Date.now(),
    processedAt: null,
    error: null,
  };
  deletionQueue.push(job);
  console.log(`[Queue]  ✚ Job ${job.id} enqueued for task #${taskId}`);
  return job;
}

// Worker: runs every 1.5s, picks next "waiting" job
setInterval(() => {
  const job = deletionQueue.find((j) => j.state === "waiting");
  if (!job) return;

  job.state = "active";
  job.processedAt = Date.now();
  console.log(`[Worker] ⚙  Processing ${job.id} (task #${job.taskId})...`);

  // Simulate 10% random failure — realistic queue behaviour
  const fail = Math.random() < 0.1;

  setTimeout(() => {
    if (fail) {
      job.state = "failed";
      job.error = "Transient error — retry manually";
      console.warn(`[Worker] ✖  ${job.id} FAILED`);
    } else {
      tasks = tasks.filter((t) => t.id !== job.taskId);
      job.state = "completed";
      console.log(`[Worker] ✔  ${job.id} done — task #${job.taskId} deleted`);
    }
    // Archive job (keep last 50)
    deletionQueue.splice(deletionQueue.indexOf(job), 1);
    jobHistory.unshift(job);
    if (jobHistory.length > 50) jobHistory.pop();
  }, 800);
}, 1500);

// ─────────────────────────────────────────────────────────────
// 3. ROUTES
// ─────────────────────────────────────────────────────────────

// GET /tasks — fetch all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// POST /tasks — create a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  const task = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    userId: 1,
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH /tasks/:id — toggle completed
app.patch("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`PATCH /tasks/${id} — body:`, req.body); // debug log

  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  // handle both { completed: true } and { completed: "true" }
  if (req.body.completed !== undefined) {
    task.completed =
      req.body.completed === true || req.body.completed === "true";
  }

  res.json(task);
});

// DELETE /tasks/:id — enqueues async deletion (202 Accepted)
app.delete("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  const job = enqueueDeleteJob(task.id);
  // 202 = accepted but not yet processed
  res
    .status(202)
    .json({ message: "Delete queued", jobId: job.id, taskId: task.id });
});

// GET /queue — inspect queue state (for the UI panel)
app.get("/queue", (req, res) => {
  res.json({
    pending: deletionQueue,
    history: jobHistory.slice(0, 10),
  });
});

// ─────────────────────────────────────────────────────────────
// 4. START
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀  API running at http://localhost:${PORT}`);
  console.log(`   GET    /tasks`);
  console.log(`   POST   /tasks`);
  console.log(`   PATCH  /tasks/:id`);
  console.log(`   DELETE /tasks/:id  → async via queue`);
  console.log(`   GET    /queue\n`);
});
