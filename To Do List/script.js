let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let dragIndex = null;

// Request notification permission
if ("Notification" in window) {
  Notification.requestPermission();
}

function addTask() {
  const text = taskInput.value.trim();
  const date = dueDate.value;
  const time = dueTime.value;
  const prio = priority.value;

  if (!text) return;

  const id = Date.now();
  tasks.push({ id, text, completed: false, priority: prio, dueDate: date, dueTime: time, reminder: true });
  taskInput.value = "";
  dueDate.value = "";
  dueTime.value = "";
  priority.value = "Low";

  save();
}

function toggleComplete(i) {
  tasks[i].completed = !tasks[i].completed;
  save();
}

function editTask(i) {
  const newText = prompt("Edit task", tasks[i].text);
  if (newText) {
    tasks[i].text = newText;
    save();
  }
}

function deleteTask(i) {
  tasks.splice(i, 1);
  save();
}

function filterTasks(type) {
  currentFilter = type;
  render();
}

function clearAll() {
  if(confirm("Are you sure you want to delete all tasks?")){
    tasks = [];
    save();
  }
}

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
  checkReminders();
}

function render() {
  taskList.innerHTML = "";
  const today = new Date().toISOString().split("T")[0];

  tasks.forEach((task, i) => {
    if (
      (currentFilter === "completed" && !task.completed) ||
      (currentFilter === "pending" && task.completed) ||
      (currentFilter === "overdue" && (!task.dueDate || task.dueDate >= today))
    ) return;

    const li = document.createElement("li");
    li.className = task.priority.toLowerCase();
    li.draggable = true;

    let overdueText = "";
    if(task.dueDate && task.dueDate < today && !task.completed) overdueText = " ⚠️ Overdue";

    li.innerHTML = `
      <span>
        <input type="checkbox" ${task.completed ? "checked" : ""} onclick="toggleComplete(${i})">
        ${task.text} ${task.dueDate ? `(${task.dueDate} ${task.dueTime || ""})` : ""}${overdueText}
      </span>
      <div class="actions">
        <span onclick="editTask(${i})"><i class="fas fa-edit"></i></span>
        <span onclick="deleteTask(${i})"><i class="fas fa-trash"></i></span>
      </div>
    `;

    // Drag events
    li.addEventListener("dragstart", () => dragIndex = i);
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", () => {
      if(dragIndex === i) return;
      const dragged = tasks[dragIndex];
      tasks.splice(dragIndex, 1);
      tasks.splice(i, 0, dragged);
      save();
    });

    taskList.appendChild(li);
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// Reminders
function checkReminders() {
  const now = new Date();
  tasks.forEach(task => {
    if(task.reminder && task.dueDate && task.dueTime && !task.completed){
      const taskTime = new Date(task.dueDate + "T" + task.dueTime);
      const diff = (taskTime - now) / 1000 / 60; // minutes
      if(diff > 0 && diff <= 5){
        notify(task.text);
        task.reminder = false; // avoid multiple notifications
      }
    }
  });
}

// Browser notification
function notify(msg){
  if(Notification.permission === "granted"){
    new Notification("Task Reminder ⏰", { body: msg });
  }
}

// Check reminders every minute
setInterval(checkReminders, 60000);

render();
