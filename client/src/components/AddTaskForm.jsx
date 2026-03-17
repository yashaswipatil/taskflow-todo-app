// client/src/components/AddTaskForm.jsx
import { useState } from "react";

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");
    const result = await onAdd(title.trim());
    if (result.success) {
      setTitle("");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          className="input input-bordered flex-1 focus:outline-none"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          disabled={loading}
        />
        <button
          type="submit"
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
    </form>
  );
}
