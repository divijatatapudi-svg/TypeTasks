import {
  advanceTask,
  addTask,
  completeTask,
  filterByStatus,
  type Task,
  type TaskStatus,
} from "./model.js";

type TaskFilter = "all" | TaskStatus;

const taskForm = document.getElementById("task-form") as HTMLFormElement | null;
const titleInput = document.getElementById("title") as HTMLInputElement | null;
const taskList = document.getElementById("task-list") as HTMLUListElement | null;
const taskCount = document.getElementById("task-count") as HTMLParagraphElement | null;
const filterButtons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");

if (!taskForm || !titleInput || !taskList || !taskCount) {
  throw new Error("TaskNest could not find a required page element.");
}

if (filterButtons.length === 0) {
  throw new Error("TaskNest could not find any task filters.");
}

const formElement = taskForm;
const titleField = titleInput;
const listElement = taskList;
const countElement = taskCount;

let tasks: Task[] = [];
let activeFilter: TaskFilter = "all";

function getTaskFilter(value: string | undefined): TaskFilter {
  switch (value) {
    case "all":
    case "todo":
    case "in-progress":
    case "done":
      return value;
    default:
      throw new Error(`Unknown task filter: ${value ?? "undefined"}`);
  }
}

function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "To Do";
    case "in-progress":
      return "In Progress";
    case "done":
      return "Done";
  }
}

function render(): void {
  const visibleTasks =
    activeFilter === "all" ? tasks : filterByStatus(tasks, activeFilter);
  const completedCount = tasks.filter((task) => task.status === "done").length;

  countElement.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} · ${completedCount} done`;
  listElement.replaceChildren();

  if (visibleTasks.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent =
      tasks.length === 0 || activeFilter === "all"
        ? "Your list is clear. Add a task above to get started."
        : `No ${getStatusLabel(activeFilter).toLowerCase()} tasks right now.`;
    listElement.append(emptyItem);
    return;
  }

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-card${task.status === "done" ? " is-complete" : ""}`;

    const taskDetails = document.createElement("div");
    taskDetails.className = "task-details";

    const status = document.createElement("span");
    status.className = `status-badge status-${task.status}`;
    status.textContent = getStatusLabel(task.status);

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    taskDetails.append(status, title);
    item.append(taskDetails);

    if (task.status !== "done") {
      const isTodo = task.status === "todo";
      const actionButton = document.createElement("button");
      actionButton.className = "complete-button";
      actionButton.type = "button";
      actionButton.textContent = isTodo ? "Start" : "Complete";
      actionButton.setAttribute(
        "aria-label",
        `${isTodo ? "Start" : "Complete"} ${task.title}`,
      );
      actionButton.addEventListener("click", (event: MouseEvent): void => {
        const clickedButton = event.currentTarget;
        if (!(clickedButton instanceof HTMLButtonElement)) {
          throw new Error("Could not identify the task action button.");
        }

        tasks = isTodo
          ? advanceTask(tasks, task.id)
          : completeTask(tasks, task.id);
        render();
      });
      item.append(actionButton);
    }

    listElement.append(item);
  });
}

formElement.addEventListener("submit", (event: SubmitEvent): void => {
  event.preventDefault();
  const title = titleField.value.trim();

  if (title.length === 0) {
    titleField.setCustomValidity("Please enter a task title.");
    titleField.reportValidity();
    return;
  }

  titleField.setCustomValidity("");
  tasks = addTask(tasks, title);
  titleField.value = "";
  render();
  titleField.focus();
});

titleField.addEventListener("input", (): void => {
  titleField.setCustomValidity("");
});

filterButtons.forEach((button) => {
  const filter = getTaskFilter(button.dataset.filter);

  button.addEventListener("click", (event: MouseEvent): void => {
    const clickedButton = event.currentTarget;
    if (!(clickedButton instanceof HTMLButtonElement)) {
      throw new Error("Could not identify the selected task filter.");
    }

    activeFilter = filter;
    filterButtons.forEach((filterButton) => {
      const isSelected = getTaskFilter(filterButton.dataset.filter) === activeFilter;
      filterButton.classList.toggle("is-active", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });
    render();
  });
});

render();
