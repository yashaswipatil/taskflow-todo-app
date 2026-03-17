// client/src/hooks/useTasks.js
// Encapsulates all task + queue state logic away from components

import { useState, useEffect, useCallback } from "react";
import {
  fetchTasks,
  createTask,
  toggleTask,
  deleteTask,
  fetchQueue,
} from "../utils/api";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [queue, setQueue] = useState({ pending: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track task IDs that are "pending delete" in the queue (show spinner on them)
  const [deletingIds, setDeletingIds] = useState(new Set());

  // ── Load tasks from API ──────────────────────────────────────
 const loadTasks = useCallback(async () => {
   try {
     setError(null);
     const data = await fetchTasks();
     // Ensure we always set an array
     setTasks(Array.isArray(data) ? data : []);
   } catch (_err) {
    console.log("loadtasks" , _err)
     setError("Failed to load tasks. Is the server running?");
   } finally {
     setLoading(false);
   }
 }, []);

  // ── Poll queue every 2s to reflect async deletions ──────────
const pollQueue = useCallback(async () => {
  try {
    const data = await fetchQueue();

    // Safety check — ensure data has the right shape
    const safe = {
      pending: Array.isArray(data?.pending) ? data.pending : [],
      history: Array.isArray(data?.history) ? data.history : [],
    };

    setQueue(safe);

    // If a task is no longer in the queue, refresh tasks
    const pendingTaskIds = new Set(safe.pending.map((j) => j.taskId));
    setDeletingIds((prev) => {
      const stillPending = new Set(
        [...prev].filter((id) => pendingTaskIds.has(id)),
      );
      if (stillPending.size < prev.size) loadTasks();
      return stillPending;
    });
  } catch (_err) {
    // silently ignore queue poll errors
    console.log("poll-err" , _err)
  }
}, [loadTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const interval = setInterval(pollQueue, 2000);
    return () => clearInterval(interval);
  }, [pollQueue]);

  // ── Add task ─────────────────────────────────────────────────
  const addTask = async (title) => {
    try {
      const newTask = await createTask(title);
      setTasks((prev) =>
        Array.isArray(prev) ? [...prev, newTask] : [newTask],
      );
      return { success: true };
    } catch (_err) {
      const msg = _err.response?.data?.error || "Failed to add task.";
      return { success: false, error: msg };
    }
  };

  // ── Toggle completed ─────────────────────────────────────────
 const toggleComplete = async (id, completed) => {
   // Optimistic update
   setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
   try {
     await toggleTask(id, completed);
   } catch (_err) {
     // Rollback on failure
     console.log("toggle-err" , _err)
     setTasks((prev) =>
       prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)),
     );
     setError("Failed to update task.");
   }
 };

  // ── Queue delete (async) ──────────────────────────────────────
  const queueDelete = async (id) => {
    try {
      await deleteTask(id);
      // Mark as "pending delete" — spinner shows until queue processes it
      setDeletingIds((prev) => new Set([...prev, id]));
    } catch (err) {
        console.log('err' , err)
      setError("Failed to queue task for deletion.");
    }
  };

  return {
    tasks,
    queue,
    loading,
    error,
    deletingIds,
    addTask,
    toggleComplete,
    queueDelete,
    reload: loadTasks,
  };
}
