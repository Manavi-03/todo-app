// Load tasks from local storage when the page loads
window.addEventListener("DOMContentLoaded", loadTasks);

// Main function to add a task to the list
function addTask(text = null, completed = false, time = null, priority = "") {
  const taskInput = document.getElementById("task-input");
  const taskTimeInput = document.getElementById("task-time");

  // Use provided text/time if editing, otherwise take user input
  const taskText = text || taskInput.value.trim();
  const taskTime = time || taskTimeInput.value;

  if (taskText === "") return;

  const taskList = document.getElementById("task-list");
  const li = document.createElement("li");
  li.className = "task-item";
  if (completed) li.classList.add("completed");

  // Set task metadata
  li.dataset.time = taskTime;
  li.dataset.priority = priority;
  if (priority) li.classList.add(`priority-${priority}`);

  // === Create Task Text Element ===
  const span = document.createElement("span");
  span.classList.add("task-text");

  const mainText = document.createElement("span");
  mainText.textContent = taskText;
  mainText.classList.add("main-text");
  span.appendChild(mainText);

  // === Time Display (Due Date & Countdown) ===
  if (taskTime) {
    const br = document.createElement("br");
    const timeEl = document.createElement("small");
    const timeObj = new Date(taskTime);
    timeEl.textContent = `⏰ ${timeObj.toLocaleString()}`;
    timeEl.classList.add("task-time");

    const timeLeftEl = document.createElement("div");
    timeLeftEl.classList.add("time-left");

    updateTimeLeft(taskTime, timeLeftEl); // initial call
    setInterval(() => updateTimeLeft(taskTime, timeLeftEl), 60000); // update every minute

    span.appendChild(br);
    span.appendChild(timeEl);
    span.appendChild(timeLeftEl);
  }

  // === Priority Dropdown ===
  const priorityDropdown = document.createElement("select");
  priorityDropdown.className = "priority-dropdown";
  ["", "low", "medium", "high"].forEach(level => {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = level ? level.charAt(0).toUpperCase() + level.slice(1) : "-- Priority --";
    if (priority === level) option.selected = true;
    priorityDropdown.appendChild(option);
  });

  // Update task's priority visually and in storage
  priorityDropdown.onchange = () => {
    li.classList.remove("priority-low", "priority-medium", "priority-high");
    if (priorityDropdown.value) {
      li.classList.add(`priority-${priorityDropdown.value}`);
    }
    li.dataset.priority = priorityDropdown.value;
    saveTasks();
  };

  // === Complete Button ===
  const checkBtn = document.createElement("button");
  checkBtn.textContent = "✔️";
  checkBtn.classList.add("check-btn");
  checkBtn.onclick = () => {
    li.classList.toggle("completed");
    saveTasks();
  };

  // === Delete Button ===
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.onclick = () => {
    li.remove();
    saveTasks();
  };

  // === Append elements and finalize ===
  li.appendChild(checkBtn);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  li.appendChild(priorityDropdown);
  taskList.appendChild(li);

  // Clear input fields only if this is a new task
  if (!text) {
    taskInput.value = "";
    taskTimeInput.value = "";
  }

  saveTasks();
}

// Save all tasks to local storage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("li.task-item").forEach((li) => {
    const text = li.querySelector(".main-text").textContent;
    const time = li.querySelector(".task-time")?.textContent.replace("⏰ ", "") || null;
    const completed = li.classList.contains("completed");
    const priority = li.getAttribute("data-priority") || "";
    tasks.push({ text, time, completed, priority });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load tasks from local storage and render them
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(({ text, time, completed, priority }) => {
    addTask(text, completed, time, priority);
  });
}

// Show how much time is left until task is due
function updateTimeLeft(isoString, element) {
  const now = new Date();
  const taskTime = new Date(isoString);
  const diffMs = taskTime - now;

  if (diffMs <= 0) {
    element.textContent = "⏳ Due now or past due!";
    element.style.color = "#e53e3e";
  } else {
    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    let timeStr = "⏳ Time left: ";
    if (days > 0) timeStr += `${days} day${days > 1 ? "s" : ""} `;
    if (hours > 0) timeStr += `${hours} hr${hours > 1 ? "s" : ""} `;
    timeStr += `${minutes} min${minutes !== 1 ? "s" : ""}`;

    element.textContent = timeStr;
    element.style.color = "#555";
  }
}

// === Button Handlers ===
document.getElementById("add-btn").addEventListener("click", () => addTask());

document.getElementById("task-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

document.getElementById("clear-btn").addEventListener("click", () => {
  document.getElementById("task-list").innerHTML = "";
  localStorage.removeItem("tasks");
});

document.getElementById("priority-filter").addEventListener("change", filterTasksByPriority);

// Filter visible tasks by priority level
function filterTasksByPriority() {
  const selected = document.getElementById("priority-filter").value;

  document.querySelectorAll("li").forEach((li) => {
    const liPriority = li.getAttribute("data-priority") || "";
    li.style.display = selected === "all" || selected === liPriority ? "flex" : "none";
  });
}

// === Feedback Button Logic ===
const feedbackFab = document.getElementById("feedback-fab");
const feedbackPopup = document.getElementById("feedback-popup");
const closeFeedbackBtn = document.getElementById("close-feedback");
const submitFeedbackBtn = document.getElementById("submit-feedback");
const feedbackInput = document.getElementById("feedback-input");
const feedbackMsg = document.getElementById("feedback-message");

feedbackFab.addEventListener("click", () => {
  feedbackPopup.classList.remove("hidden");
});

closeFeedbackBtn.addEventListener("click", () => {
  feedbackPopup.classList.add("hidden");
  feedbackInput.value = "";
  feedbackMsg.classList.add("hidden");
});

submitFeedbackBtn.addEventListener("click", () => {
  if (feedbackInput.value.trim()) {
    console.log("User feedback:", feedbackInput.value);
    feedbackInput.value = "";
    feedbackMsg.classList.remove("hidden");
    setTimeout(() => {
      feedbackPopup.classList.add("hidden");
      feedbackMsg.classList.add("hidden");
    }, 2000);
  }
});

// === Theme Toggle Logic ===
const themeToggle = document.getElementById("theme-toggle");
const emoji = document.querySelector(".slider .emoji");

function setTheme(mode) {
  document.body.classList.toggle("dark", mode === "dark");
  localStorage.setItem("theme", mode);
  emoji.textContent = mode === "dark" ? "🌙" : "☀️";
}

// Set theme on checkbox toggle
themeToggle.addEventListener("change", () => {
  const newTheme = themeToggle.checked ? "dark" : "light";
  setTheme(newTheme);
});

// Load saved theme on initial load
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "light";
  themeToggle.checked = saved === "dark";
  setTheme(saved);
});
