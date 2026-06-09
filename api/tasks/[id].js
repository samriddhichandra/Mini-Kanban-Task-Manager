import { getTaskById, updateTask, deleteTask } from "./data.js";

function isValidStatus(status) {
  return status === "todo" || status === "done";
}

function isValidPriority(priority) {
  return ["low", "medium", "high"].includes(priority);
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

export default function handler(req, res) {
  const { id } = req.query;
  const taskId = Number(id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ error: "Task ID must be a number." });
    return;
  }

  const currentTask = getTaskById(taskId);

  if (req.method === "GET") {
    if (!currentTask) {
      res.status(404).json({ error: "Task not found." });
      return;
    }
    res.status(200).json(currentTask);
    return;
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    if (!currentTask) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    const { updates, error } = getTaskUpdates(req.body || {});
    if (error) {
      res.status(400).json({ error });
      return;
    }

    if (!updates || Object.keys(updates).length === 0) {
      res.status(400).json({ error: "At least one task field is required." });
      return;
    }

    const updatedTask = updateTask(taskId, updates);
    res.status(200).json(updatedTask);
    return;
  }

  if (req.method === "DELETE") {
    if (!currentTask) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    deleteTask(taskId);
    res.status(204).end();
    return;
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
