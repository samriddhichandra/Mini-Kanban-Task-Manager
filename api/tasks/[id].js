import { getTaskById, updateTask, deleteTask } from "./data";

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

  if (req.method === "PUT") {
    if (!currentTask) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    const status = req.body.status;
    if (!isValidStatus(status)) {
      res.status(400).json({ error: 'Status must be "todo" or "done".' });
      return;
    }

    const updatedTask = updateTask(taskId, { status });
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

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
