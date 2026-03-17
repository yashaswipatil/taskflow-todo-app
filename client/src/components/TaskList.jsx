// client/src/components/TaskList.jsx
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, deletingIds, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-base-content/40 py-10 text-sm">
        No tasks yet. Add one above ☝️
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          isDeleting={deletingIds.has(task.id)}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}