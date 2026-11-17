export function addTask(tasks, title) {
    const usedIds = new Set(tasks.map((task) => task.id));
    let id = 1;
    while (usedIds.has(id)) {
        id += 1;
    }
    return [...tasks, { id, title, status: "todo" }];
}
export function completeTask(tasks, id) {
    return tasks.map((task) => task.id === id ? { ...task, status: "done" } : task);
}
export function advanceTask(tasks, id) {
    return tasks.map((task) => {
        if (task.id !== id) {
            return task;
        }
        switch (task.status) {
            case "todo":
                return { ...task, status: "in-progress" };
            case "in-progress":
                return { ...task, status: "done" };
            case "done":
                return task;
        }
    });
}
export function filterByStatus(tasks, status) {
    return tasks.filter((task) => task.status === status);
}
export function deleteTask(tasks, id) {
    return tasks.filter((task) => task.id !== id);
}
