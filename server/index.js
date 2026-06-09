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

function getTaskUpdates(body) {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, "title")) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return { error: "Title must not be empty." };
    }
    updates.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (!isValidStatus(body.status)) {
      return { error: 'Status must be "todo" or "done".' };
    }
    updates.status = body.status;
  }

  if (Object.prototype.hasOwnProperty.call(body, "priority")) {
    if (!isValidPriority(body.priority)) {
      return { error: 'Priority must be "low", "medium", or "high".' };
    }
    updates.priority = body.priority;
  }

  if (Object.prototype.hasOwnProperty.call(body, "dueDate")) {
    const dueDate = typeof body.dueDate === "string" ? body.dueDate : "";
    if (!isValidDueDate(dueDate)) {
      return { error: "Due date must be a valid date." };
    }
    updates.dueDate = dueDate;
  }

  return { updates };
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

function updateTask(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Task ID must be a number." });
  }

  const task = findTask(id);

  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  const { updates, error } = getTaskUpdates(req.body || {});

  if (error) {
    return res.status(400).json({ error });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "At least one task field is required." });
  }

  Object.assign(task, updates);

  return res.json(task);
}

apiRouter.put("/tasks/:id", updateTask);
apiRouter.patch("/tasks/:id", updateTask);
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
