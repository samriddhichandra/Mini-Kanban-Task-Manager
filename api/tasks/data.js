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

export function getTasks() {
  return tasks;
}

export function getTaskById(id) {
  return tasks.find((task) => task.id === id);
}

export function createTask(data) {
  const task = {
    id: nextId,
    title: data.title,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    assignee: "You",
    createdAt: new Date().toISOString(),
  };

  nextId += 1;
  tasks.push(task);
  return task;
}

export function updateTask(id, updates) {
  const task = getTaskById(id);
  if (!task) {
    return null;
  }
  Object.assign(task, updates);
  return task;
}

export function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return false;
  }
  tasks.splice(index, 1);
  return true;
}
