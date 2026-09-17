import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialTasks = [
  {
    id: "1",
    title: "Complete Bellman Ford Assignment",
    description: "Implement, test and verify the DAA solution.",
    subject: "DAA",
    type: "Assignment",
    priority: "High",
    dueDate: "2026-09-19",
    completed: false
  },
  {
    id: "2",
    title: "Revise Operating Systems",
    description: "Review deadlocks and memory management.",
    subject: "OS",
    type: "Revision",
    priority: "Medium",
    dueDate: "2026-09-20",
    completed: false
  },
  {
    id: "3",
    title: "Submit HCI Report",
    description: "Final review and submission of the HCI report.",
    subject: "HCI",
    type: "Assignment",
    priority: "High",
    dueDate: "2026-09-18",
    completed: true
  }
];

const initialResources = [
  {
    id: "1",
    title: "React Documentation",
    type: "Bookmark",
    link: "https://react.dev"
  },
  {
    id: "2",
    title: "MongoDB Documentation",
    type: "Bookmark",
    link: "https://www.mongodb.com/docs/"
  }
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [tasks, setTasks] = useState(initialTasks);
  const [resources, setResources] = useState(initialResources);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showResourceForm, setShowResourceForm] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    subject: "",
    type: "Assignment",
    priority: "Medium",
    dueDate: ""
  });

  const [resourceForm, setResourceForm] = useState({
    title: "",
    link: ""
  });

  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;

  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Pending" && !task.completed) ||
        (filter === "Completed" && task.completed) ||
        (filter === "High Priority" && task.priority === "High");

      const value = search.toLowerCase();

      const matchesSearch =
        task.title.toLowerCase().includes(value) ||
        task.subject.toLowerCase().includes(value) ||
        task.type.toLowerCase().includes(value);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("studypilot_tasks");
    const savedResources = localStorage.getItem("studypilot_resources");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedResources) setResources(JSON.parse(savedResources));
  }, []);

  useEffect(() => {
    localStorage.setItem("studypilot_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("studypilot_resources", JSON.stringify(resources));
  }, [resources]);

  function openAddTask() {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      subject: "",
      type: "Assignment",
      priority: "Medium",
      dueDate: ""
    });
    setShowForm(true);
  }

  function openEditTask(task) {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      subject: task.subject,
      type: task.type,
      priority: task.priority,
      dueDate: task.dueDate
    });
    setShowForm(true);
  }

  function handleTaskSubmit(e) {
    e.preventDefault();

    if (!taskForm.title.trim()) return;

    if (editingTask) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskForm }
          : task
      ));
    } else {
      setTasks([
        {
          id: Date.now().toString(),
          ...taskForm,
          completed: false
        },
        ...tasks
      ]);
    }

    setShowForm(false);
  }

  function deleteTask(id) {
    setTasks(tasks.filter(task => task.id !== id));
  }

  function toggleTask(id) {
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    ));
  }

  function addResource(e) {
    e.preventDefault();

    if (!resourceForm.title.trim() || !resourceForm.link.trim()) return;

    setResources([
      {
        id: Date.now().toString(),
        title: resourceForm.title,
        type: "Bookmark",
        link: resourceForm.link
      },
      ...resources
    ]);

    setResourceForm({
      title: "",
      link: ""
    });

    setShowResourceForm(false);
  }

  function deleteResource(id) {
    setResources(resources.filter(resource => resource.id !== id));
  }

  function formatDate(date) {
    if (!date) return "No deadline";

    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });
  }

  function getDueText(date, completed) {
    if (completed) return "Completed";

    if (!date) return "No deadline";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(date + "T00:00:00");
    const difference = Math.ceil(
      (due - today) / (1000 * 60 * 60 * 24)
    );

    if (difference < 0) return "Overdue";
    if (difference === 0) return "Due today";
    if (difference === 1) return "Due tomorrow";

    return `${difference} days left`;
  }

  return (
    <div className="app">

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            <h2>StudyPilot</h2>
            <span>Your academic co-pilot</span>
          </div>
        </div>

        <nav>
          <button
            className={page === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={page === "tasks" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("tasks")}
          >
            <span>✓</span>
            Tasks
            <b>{pending}</b>
          </button>

          <button
            className={page === "exams" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("exams")}
          >
            <span>◷</span>
            Exams
          </button>

          <button
            className={page === "resources" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("resources")}
          >
            <span>◇</span>
            Resources
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-box">
            <div className="streak-icon">🔥</div>
            <div>
              <strong>3 day streak</strong>
              <span>Keep going!</span>
            </div>
          </div>

          <div className="quote">
            <span>“</span>
            Small progress every day adds up to big results.
          </div>
        </div>
      </aside>

      <main className="main">

        <header className="topbar">
          <div>
            <p className="eyebrow">STUDENT WORKSPACE</p>
            <h1>
              {page === "dashboard" && "Good morning 👋"}
              {page === "tasks" && "My Tasks"}
              {page === "exams" && "Exam Planner"}
              {page === "resources" && "Study Resources"}
            </h1>
          </div>

          <button className="add-main-btn" onClick={openAddTask}>
            <span>+</span> Add Task
          </button>
        </header>

        {page === "dashboard" && (
          <Dashboard
            tasks={tasks}
            completed={completed}
            pending={pending}
            progress={progress}
            setPage={setPage}
            openAddTask={openAddTask}
            formatDate={formatDate}
            getDueText={getDueText}
          />
        )}

        {page === "tasks" && (
          <section className="page-section">

            <div className="section-heading">
              <div>
                <p className="eyebrow">STAY ON TRACK</p>
                <h2>Everything you need to get done</h2>
              </div>

              <div className="search">
                <span>⌕</span>
                <input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-row">
              {["All", "Pending", "Completed", "High Priority"].map(item => (
                <button
                  key={item}
                  className={filter === item ? "filter active" : "filter"}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="task-list">
              {filteredTasks.length === 0 ? (
                <div className="empty">
                  <div>✓</div>
                  <h3>No tasks found</h3>
                  <p>Try changing your filters or create a new task.</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    openEditTask={openEditTask}
                    formatDate={formatDate}
                    getDueText={getDueText}
                  />
                ))
              )}
            </div>

          </section>
        )}

        {page === "exams" && (
          <section className="page-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ACADEMIC PLANNER</p>
                <h2>Upcoming exams</h2>
              </div>
            </div>

            <div className="exam-grid">
              {tasks
                .filter(task => task.type === "Exam")
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .map(task => (
                  <div className="exam-card" key={task.id}>
                    <div className="exam-date">
                      <strong>
                        {task.dueDate
                          ? new Date(task.dueDate + "T00:00:00").getDate()
                          : "--"}
                      </strong>
                      <span>
                        {task.dueDate
                          ? new Date(task.dueDate + "T00:00:00")
                              .toLocaleDateString("en-IN", { month: "short" })
                              .toUpperCase()
                          : "DATE"}
                      </span>
                    </div>

                    <div>
                      <span className="subject-label">{task.subject}</span>
                      <h3>{task.title}</h3>
                      <p>{getDueText(task.dueDate, task.completed)}</p>
                    </div>
                  </div>
                ))}

              {tasks.filter(task => task.type === "Exam").length === 0 && (
                <div className="empty">
                  <div>◷</div>
                  <h3>No exams added yet</h3>
                  <p>Create a task and select "Exam" as the type.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {page === "resources" && (
          <section className="page-section">

            <div className="section-heading">
              <div>
                <p className="eyebrow">LEARNING MATERIAL</p>
                <h2>Your study resources</h2>
              </div>

              <button
                className="secondary-btn"
                onClick={() => setShowResourceForm(true)}
              >
                + Add Bookmark
              </button>
            </div>

            {showResourceForm && (
              <form className="resource-form" onSubmit={addResource}>
                <input
                  placeholder="Resource title"
                  value={resourceForm.title}
                  onChange={e =>
                    setResourceForm({
                      ...resourceForm,
                      title: e.target.value
                    })
                  }
                />

                <input
                  placeholder="https://example.com"
                  value={resourceForm.link}
                  onChange={e =>
                    setResourceForm({
                      ...resourceForm,
                      link: e.target.value
                    })
                  }
                />

                <button className="primary-btn">Save</button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowResourceForm(false)}
                >
                  Cancel
                </button>
              </form>
            )}

            <div className="resource-grid">
              {resources.map(resource => (
                <div className="resource-card" key={resource.id}>
                  <div className="resource-icon">🔗</div>

                  <div className="resource-info">
                    <span>{resource.type}</span>
                    <h3>{resource.title}</h3>
                    <a href={resource.link} target="_blank" rel="noreferrer">
                      Open resource ↗
                    </a>
                  </div>

                  <button
                    className="icon-delete"
                    onClick={() => deleteResource(resource.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

          </section>
        )}

      </main>

      {showForm && (
        <div className="modal-overlay">
          <form className="task-modal" onSubmit={handleTaskSubmit}>

            <div className="modal-header">
              <div>
                <p className="eyebrow">TASK MANAGEMENT</p>
                <h2>{editingTask ? "Edit task" : "Create a task"}</h2>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label>Task title *</label>
            <input
              autoFocus
              placeholder="e.g. Complete DBMS assignment"
              value={taskForm.title}
              onChange={e =>
                setTaskForm({
                  ...taskForm,
                  title: e.target.value
                })
              }
            />

            <label>Description</label>
            <textarea
              placeholder="Add a little context..."
              value={taskForm.description}
              onChange={e =>
                setTaskForm({
                  ...taskForm,
                  description: e.target.value
                })
              }
            />

            <div className="form-grid">

              <div>
                <label>Subject</label>
                <input
                  placeholder="e.g. DAA"
                  value={taskForm.subject}
                  onChange={e =>
                    setTaskForm({
                      ...taskForm,
                      subject: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label>Type</label>
                <select
                  value={taskForm.type}
                  onChange={e =>
                    setTaskForm({
                      ...taskForm,
                      type: e.target.value
                    })
                  }
                >
                  <option>Assignment</option>
                  <option>Exam</option>
                  <option>Revision</option>
                  <option>Project</option>
                  <option>General</option>
                </select>
              </div>

              <div>
                <label>Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={e =>
                    setTaskForm({
                      ...taskForm,
                      priority: e.target.value
                    })
                  }
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div>
                <label>Due date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e =>
                    setTaskForm({
                      ...taskForm,
                      dueDate: e.target.value
                    })
                  }
                />
              </div>

            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button className="primary-btn">
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

function Dashboard({
  tasks,
  completed,
  pending,
  progress,
  setPage,
  openAddTask,
  formatDate,
  getDueText
}) {
  const upcoming = [...tasks]
    .filter(task => !task.completed && task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  return (
    <section className="dashboard">

      <div className="welcome-card">
        <div>
          <span className="welcome-label">YOUR DAY AT A GLANCE</span>
          <h2>Let's make today count.</h2>
          <p>
            You have <strong>{pending} pending tasks</strong>.
            Keep your momentum going.
          </p>

          <button onClick={() => setPage("tasks")}>
            View my tasks →
          </button>
        </div>

        <div className="progress-ring">
          <div>
            <strong>{progress}%</strong>
            <span>complete</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          icon="◎"
          value={tasks.length}
          label="Total tasks"
          detail="All your academic work"
        />

        <StatCard
          icon="◌"
          value={pending}
          label="Pending"
          detail="Still to be completed"
        />

        <StatCard
          icon="✓"
          value={completed}
          label="Completed"
          detail="Tasks you've finished"
        />

        <StatCard
          icon="⚡"
          value={`${progress}%`}
          label="Progress"
          detail="Overall completion"
        />

      </div>

      <div className="dashboard-columns">

        <div className="panel">

          <div className="panel-header">
            <div>
              <span className="eyebrow">UP NEXT</span>
              <h3>Upcoming deadlines</h3>
            </div>

            <button onClick={() => setPage("tasks")}>
              View all
            </button>
          </div>

          <div className="deadline-list">

            {upcoming.length === 0 ? (
              <div className="empty-small">
                No upcoming deadlines 🎉
              </div>
            ) : (
              upcoming.map(task => (
                <div className="deadline" key={task.id}>

                  <div className="deadline-date">
                    <strong>
                      {task.dueDate
                        ? new Date(task.dueDate + "T00:00:00").getDate()
                        : "--"}
                    </strong>

                    <span>
                      {task.dueDate
                        ? new Date(task.dueDate + "T00:00:00")
                            .toLocaleDateString("en-IN", {
                              month: "short"
                            })
                            .toUpperCase()
                        : ""}
                    </span>
                  </div>

                  <div className="deadline-info">
                    <h4>{task.title}</h4>
                    <span>{task.subject || "General"} • {task.type}</span>
                  </div>

                  <span className={`priority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>

                </div>
              ))
            )}

          </div>

        </div>

        <div className="panel focus-panel">

          <div className="panel-header">
            <div>
              <span className="eyebrow">TODAY'S FOCUS</span>
              <h3>One step at a time</h3>
            </div>

            <span className="focus-star">✦</span>
          </div>

          {pending > 0 ? (
            <>
              <div className="focus-task">
                <div className="focus-check">○</div>

                <div>
                  <span>Next priority</span>
                  <h3>
                    {tasks.find(task => !task.completed)?.title}
                  </h3>
                </div>
              </div>

              <button
                className="focus-btn"
                onClick={() => setPage("tasks")}
              >
                Start working →
              </button>
            </>
          ) : (
            <div className="focus-complete">
              <div>🎉</div>
              <h3>You're all caught up!</h3>
              <p>Enjoy your free time.</p>
            </div>
          )}

        </div>

      </div>

      <div className="quick-actions">

        <button onClick={openAddTask}>
          <span>+</span>
          <div>
            <strong>Add a task</strong>
            <small>What needs to get done?</small>
          </div>
        </button>

        <button onClick={() => setPage("exams")}>
          <span>◷</span>
          <div>
            <strong>Plan exams</strong>
            <small>Keep deadlines visible</small>
          </div>
        </button>

        <button onClick={() => setPage("resources")}>
          <span>◇</span>
          <div>
            <strong>Study resources</strong>
            <small>Keep useful links close</small>
          </div>
        </button>

      </div>

    </section>
  );
}

function StatCard({ icon, value, label, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-value">{value}</span>
      </div>

      <h3>{label}</h3>
      <p>{detail}</p>
    </div>
  );
}

function TaskCard({
  task,
  toggleTask,
  deleteTask,
  openEditTask,
  formatDate,
  getDueText
}) {
  return (
    <div className={task.completed ? "task-card completed" : "task-card"}>

      <button
        className={task.completed ? "task-check checked" : "task-check"}
        onClick={() => toggleTask(task.id)}
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="task-main">

        <div className="task-title-row">
          <h3>{task.title}</h3>

          <span className={`priority ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>

        <p>{task.description || "No description added."}</p>

        <div className="task-meta">
          <span>📚 {task.subject || "General"}</span>
          <span>◈ {task.type}</span>
          <span className={getDueText(task.dueDate, task.completed) === "Overdue" ? "overdue" : ""}>
            📅 {formatDate(task.dueDate)} · {getDueText(task.dueDate, task.completed)}
          </span>
        </div>

      </div>

      <div className="task-actions">
        <button onClick={() => openEditTask(task)}>Edit</button>
        <button onClick={() => deleteTask(task.id)}>Delete</button>
      </div>

    </div>
  );
}

export default App;