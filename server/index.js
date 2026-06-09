import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3001;

let nextId = 3;
const tasks = [
  {
    id: 1,
    title: "System work",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignee: "You",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Work for clients",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignee: "You",
    createdAt: new Date().toISOString(),
  },
];
const allowedStatuses = ["todo", "done"];
const allowedPriorities = ["low", "medium", "high"];

app.use(cors());
app.use(express.json());

function findTask(id) {
  return tasks.find((task) => task.id === id);
}

function isValidStatus(status) {
  return allowedStatuses.includes(status);
}

function isValidPriority(priority) {
  return allowedPriorities.includes(priority);
}

function isValidDueDate(dueDate) {
  return dueDate === "" || typeof dueDate === "undefined" || !Number.isNaN(Date.parse(dueDate));
}

app.get("/tasks", (_req, res) => {
  res.json(tasks);
});

const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
  console.log("API router request:", req.method, req.originalUrl);
  next();
});

apiRouter.get("/tasks", (_req, res) => {
  res.json(tasks);
});

function createTask(req, res) {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const status = req.body.status || "todo";
  const priority = req.body.priority || "medium";
  const dueDate = typeof req.body.dueDate === "string" ? req.body.dueDate : "";

  if (!title) {
    return res.status(400).json({ error: "Title must not be empty." });
  }

  if (!isValidStatus(status)) {
    return res.status(400).json({ error: 'Status must be "todo" or "done".' });
  }

  if (!isValidPriority(priority)) {
    return res.status(400).json({ error: 'Priority must be "low", "medium", or "high".' });
  }

  if (!isValidDueDate(dueDate)) {
    return res.status(400).json({ error: "Due date must be a valid date." });
  }

  const task = {
    id: nextId,
    title,
    status,
    priority,
    dueDate,
    assignee: "You",
    createdAt: new Date().toISOString(),
  };

  nextId += 1;
  tasks.push(task);

  return res.status(201).json(task);
}

apiRouter.post("/tasks", createTask);

function updateTaskStatus(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Task ID must be a number." });
  }

  if (!isValidStatus(req.body.status)) {
    return res.status(400).json({ error: 'Status must be "todo" or "done".' });
  }

  const task = findTask(id);

  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  task.status = req.body.status;

  return res.json(task);
}

apiRouter.put("/tasks/:id", updateTaskStatus);
apiRouter.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Task ID must be a number." });
  }

  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found." });
  }

  tasks.splice(index, 1);

  return res.status(204).send();
});

app.use("/api", apiRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "..", "dist");

app.use(express.static(distPath));
app.get(/^(?!\/(?:api|tasks)).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
