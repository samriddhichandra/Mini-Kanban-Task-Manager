import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = "/tasks";

const columns = [
  { id: "todo", title: "To Do", caption: "Ideas and planned work" },
  { id: "done", title: "Done", caption: "Completed and shipped" },
];

const priorities = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

const avatars = ["AK", "LM", "RS", "ND", "VP"];

async function requestJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatDueDate(dueDate) {
  if (!dueDate) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(dueDate));
}

function getAvatar(task) {
  return avatars[task.id % avatars.length];
}

function Toast({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="toast" role="status">
      <span aria-hidden="true">i</span>
      {message}
    </div>
  );
}

function ConfirmDialog({ task, onCancel, onConfirm }) {
  if (!task) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="dialog-icon" aria-hidden="true">!</div>
        <h2 id="delete-title">Delete task?</h2>
        <p>This will permanently remove "{task.title}" from the board.</p>
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="danger-button" type="button" onClick={() => onConfirm(task.id)}>
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ title }) {
  return (
    <div className="empty-state">
      <div className="empty-illustration" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>No tasks in {title}.</p>
    </div>
  );
}

function TaskCard({ task, onDragStart, onAskDelete, onChangeStatus }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  function toggleMenu(event) {
    event.stopPropagation();
    setIsMenuOpen((current) => !current);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handleDocumentClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [isMenuOpen]);

  return (
    <article
      className="task-card"
      draggable
      onDragStart={(event) => onDragStart(event, task.id)}
    >
      <div className="task-card-top">
        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
        <div className="menu-wrapper" ref={menuRef}>
          <button
            className="menu-button"
            type="button"
            title="Task actions"
            aria-label="Task actions"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            ...
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown" role="menu">
              {columns.map((column) => (
                <button
                  key={column.id}
                  type="button"
                  className="menu-item"
                  disabled={task.status === column.id}
                  onClick={() => {
                    onChangeStatus(task.id, column.id);
                    closeMenu();
                  }}
                >
                  {column.title}
                </button>
              ))}
              <div className="menu-divider" />
              <button
                type="button"
                className="menu-item menu-delete-item"
                onClick={() => {
                  onAskDelete(task);
                  closeMenu();
                }}
              >
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>
      <h3>{task.title}</h3>
      <div className="task-meta">
        <span className="avatar">{getAvatar(task)}</span>
        <span>{task.assignee || "You"}</span>
        <span className="dot-separator" aria-hidden="true" />
        <span>{formatDueDate(task.dueDate)}</span>
      </div>
    </article>
  );
}

function KanbanColumn({ column, tasks, onDropTask, onDragStart, onAskDelete, onChangeStatus }) {
  return (
    <section
      className="column"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDropTask(event, column.id)}
      aria-labelledby={`${column.id}-heading`}
    >
      <header className="column-header">
        <div>
          <h2 id={`${column.id}-heading`}>{column.title}</h2>
          <p>{column.caption}</p>
        </div>
        <span>{tasks.length}</span>
      </header>
      <div className="task-list">
        {tasks.length === 0 ? (
          <EmptyState title={column.title} />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onAskDelete={onAskDelete}
              onChangeStatus={onChangeStatus}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [theme, setTheme] = useState("light");

  const groupedTasks = useMemo(
    () =>
      columns.reduce((groups, column) => {
        groups[column.id] = tasks.filter((task) => task.status === column.id);
        return groups;
      }, {}),
    [tasks],
  );

  const completionRate = tasks.length
    ? Math.round((groupedTasks.done.length / tasks.length) * 100)
    : 0;
  const highPriorityCount = tasks.filter((task) => task.priority === "high").length;

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function loadTasks() {
    setIsLoading(true);
    setError("");

    try {
      const data = await requestJson(API_URL);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function updateForm(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleCreateTask(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title must not be empty.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const createdTask = await requestJson(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          priority: form.priority,
          status: form.status,
          dueDate: form.dueDate,
        }),
      });

      setTasks((currentTasks) => [...currentTasks, createdTask]);
      setForm({ title: "", priority: "medium", status: "todo", dueDate: "" });
      showToast("Task created");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function moveTask(id, status) {
    const task = tasks.find((item) => item.id === id);

    if (!task || task.status === status) {
      return;
    }

    const previousTasks = tasks;
    setTasks((currentTasks) =>
      currentTasks.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setError("");

    try {
      const updatedTask = await requestJson(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      setTasks((currentTasks) =>
        currentTasks.map((item) => (item.id === id ? updatedTask : item)),
      );
      showToast(`Moved to ${columns.find((column) => column.id === status).title}`);
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  }

  function handleDragStart(event, id) {
    event.dataTransfer.setData("text/plain", String(id));
  }

  function handleDropTask(event, status) {
    const id = Number(event.dataTransfer.getData("text/plain"));
    moveTask(id, status);
  }

  async function handleDeleteTask(id) {
    setError("");

    try {
      await requestJson(`${API_URL}/${id}`, { method: "DELETE" });
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
      setTaskToDelete(null);
      showToast("Task deleted");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className={`app-shell ${theme}`}>
      <Toast message={toast} />
      <ConfirmDialog
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
      />

      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Workspace dashboard</span>
          <h1>Mini Kanban Task Manager</h1>
          <p>Plan work, track momentum, and keep delivery visible across your board.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-button" type="button" onClick={loadTasks} disabled={isLoading}>
            Refresh
          </button>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
        </div>
      </header>

      <section className="analytics-grid" aria-label="Board analytics">
        <article className="analytics-card">
          <div className="analytics-icon">T</div>
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
          <div className="progress-track">
            <span style={{ width: tasks.length ? "100%" : "8%" }} />
          </div>
        </article>
        <article className="analytics-card">
          <div className="analytics-icon">D</div>
          <span>Done</span>
          <strong>{groupedTasks.done.length}</strong>
          <div className="progress-track">
            <span style={{ width: `${tasks.length ? (groupedTasks.done.length / tasks.length) * 100 : 8}%` }} />
          </div>
        </article>
        <article className="analytics-card">
          <div className="analytics-icon">C</div>
          <span>Completion</span>
          <strong>{completionRate}%</strong>
          <div className="progress-track">
            <span style={{ width: `${Math.max(completionRate, 8)}%` }} />
          </div>
        </article>
        <article className="analytics-card">
          <div className="analytics-icon">H</div>
          <span>High priority</span>
          <strong>{highPriorityCount}</strong>
          <div className="progress-track">
            <span style={{ width: `${tasks.length ? (highPriorityCount / tasks.length) * 100 : 8}%` }} />
          </div>
        </article>
      </section>

      <section className="creation-panel" aria-labelledby="create-task-heading">
        <div className="panel-copy">
          <h2 id="create-task-heading">Create task</h2>
          <p>Add enough context for the team to understand what needs to move next.</p>
        </div>
        <form className="task-form" onSubmit={handleCreateTask}>
          <label>
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              placeholder="Design project dashboard"
              onChange={(event) => updateForm("title", event.target.value)}
              disabled={isCreating}
            />
          </label>
          <label>
            <span>Priority</span>
            <select
              value={form.priority}
              onChange={(event) => updateForm("priority", event.target.value)}
              disabled={isCreating}
            >
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
              disabled={isCreating}
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Due date</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => updateForm("dueDate", event.target.value)}
              disabled={isCreating}
            />
          </label>
          <button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create task"}
          </button>
        </form>
      </section>

      {error ? (
        <div className="status-message error" role="alert">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="status-message">Loading workspace...</div>
      ) : (
        <section className="board" aria-label="Kanban board">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={groupedTasks[column.id]}
              onDropTask={handleDropTask}
              onDragStart={handleDragStart}
              onAskDelete={setTaskToDelete}
              onChangeStatus={moveTask}
            />
          ))}
        </section>
      )}
    </main>
  );
}
