import { useTasks }     from "./hooks/useTasks";
import AddTaskForm      from "./components/AddTaskForm";
import TaskList         from "./components/TaskList";
import QueuePanel       from "./components/QueuePanel";

export default function App() {
  const { tasks, queue, loading, error, deletingIds, addTask, toggleComplete, queueDelete, reload } = useTasks();

  const done    = tasks?.filter(t => t.completed).length ?? 0;
const pending = tasks?.filter(t => !t.completed).length ?? 0;

  return (
    <div className="min-h-screen bg-base-100 text-base-content">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="navbar bg-base-200 border-b border-base-300 px-6 sticky top-0 z-50">
        <div className="flex-1">
          <span className="text-xl font-bold tracking-tight">
            Task<span className="text-primary">Flow</span>
          </span>
          <span className="ml-3 badge badge-primary badge-outline badge-sm">async queue</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={reload}>↺ Refresh</button>
      </header>
  

      {/* ── Main layout ────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Task panel (2/3 width on lg) ─────────────── */}
        <section className="lg:col-span-2 flex flex-col gap-4">

          {/* Stats */}
          <div className="stats shadow border border-base-300 bg-base-200 w-full">
            <div className="stat py-3 px-5">
              <div className="stat-title text-xs">Total</div>
              <div className="stat-value text-2xl">{tasks.length}</div>
            </div>
            <div className="stat py-3 px-5">
              <div className="stat-title text-xs">Pending</div>
              <div className="stat-value text-2xl text-warning">{pending}</div>
            </div>
            <div className="stat py-3 px-5">
              <div className="stat-title text-xs">Done</div>
              <div className="stat-value text-2xl text-success">{done}</div>
            </div>
          </div>

          {/* Card */}
          <div className="card bg-base-200 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <h2 className="card-title text-sm font-mono tracking-widest uppercase text-base-content/50 mb-1">
                📋 Tasks
              </h2>

              {/* Add form */}
              <AddTaskForm onAdd={addTask} />

              {/* Error banner */}
              {error && (
                <div className="alert alert-error text-sm py-2 px-4 mb-3">
                  <span>⚠ {error}</span>
                  <button className="btn btn-ghost btn-xs ml-auto" onClick={reload}>Retry</button>
                </div>
              )}

              {/* Task list */}
              {loading
                ? <div className="flex justify-center py-10"><span className="loading loading-spinner loading-md" /></div>
                : <TaskList tasks={tasks} deletingIds={deletingIds} onToggle={toggleComplete} onDelete={queueDelete} />
              }
            </div>
          </div>
        </section>

        {/* ── Right: Queue panel (1/3 width on lg) ───────────── */}
        <aside className="lg:col-span-1">
          <QueuePanel queue={queue} />
          <p className="text-xs text-base-content/30 mt-3 leading-relaxed px-1">
            Deletions are processed asynchronously via an array-based queue
            (simulating BullMQ). Each job moves: <strong>waiting → active → completed | failed</strong>.
            The worker runs every 1.5 s with a ~10% simulated failure rate.
          </p>
        </aside>

      </main>
    </div>
  );
}