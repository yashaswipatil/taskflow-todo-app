export default function TaskItem({ task, isDeleting, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border border-base-300
      transition-all duration-300 ${isDeleting ? "opacity-40" : "hover:bg-base-200"}`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        className="checkbox checkbox-primary"
        checked={task.completed}
        onChange={e => onToggle(task.id, e.target.checked)}
        disabled={isDeleting}
      />

      {/* Title */}
      <span className={`flex-1 text-sm ${task.completed ? "line-through text-base-content/40" : ""}`}>
        {task.title}
      </span>

      {/* User badge */}
      <span className="badge badge-ghost badge-sm">u:{task.userId}</span>

      {/* Delete button / spinner */}
      {isDeleting ? (
        <span className="loading loading-spinner loading-sm text-warning" title="Queued for deletion…" />
      ) : (
        <button
          className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-white"
          onClick={() => onDelete(task.id)}
          title="Delete (async)"
        >
          ✕
        </button>
      )}
    </div>
  );
}