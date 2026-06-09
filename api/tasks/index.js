import { getTasks, createTask } from "./data.js";

function isValidStatus(status) {
  return status === "todo" || status === "done";
}

function isValidPriority(priority) {
  return ["low", "medium", "high"].includes(priority);
}

function isValidDueDate(dueDate) {
  return dueDate === "" || typeof dueDate === "undefined" || !Number.isNaN(Date.parse(dueDate));
}

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(getTasks());
    return;
  }

  if (req.method === "POST") {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const status = req.body.status || "todo";
    const priority = req.body.priority || "medium";
    const dueDate = typeof req.body.dueDate === "string" ? req.body.dueDate : "";

    if (!title) {
      res.status(400).json({ error: "Title must not be empty." });
      return;
    }

    if (!isValidStatus(status)) {
      res.status(400).json({ error: 'Status must be "todo" or "done".' });
      return;
    }

    if (!isValidPriority(priority)) {
      res.status(400).json({ error: 'Priority must be "low", "medium", or "high".' });
      return;
    }

    if (!isValidDueDate(dueDate)) {
      res.status(400).json({ error: "Due date must be a valid date." });
      return;
    }

    const task = createTask({
      title,
      status,
      priority,
      dueDate,
    });

    res.status(201).json(task);
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
