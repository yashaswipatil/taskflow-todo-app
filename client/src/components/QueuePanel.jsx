// client/src/components/QueuePanel.jsx
// Visualises the BullMQ-style deletion queue in real time

const STATE_BADGE = {
  waiting:   "badge-warning",
  active:    "badge-info",
  completed: "badge-success",
  failed:    "badge-error",
};

function JobRow({ job }) {
  return (
    <div className="flex items-center justify-between text-xs py-1 border-b border-base-300 last:border-0">
      <span className="font-mono text-base-content/60">{job.id}</span>
      <span className="text-base-content/80">task #{job.taskId}</span>
      <span className={`badge badge-sm ${STATE_BADGE[job.state] || "badge-ghost"}`}>
        {job.state}
      </span>
    </div>
  );
}

export default function QueuePanel({ queue }) {
  const pending = Array.isArray(queue?.pending) ? queue.pending : [];
  const history = Array.isArray(queue?.history) ? queue.history : [];

  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm">
      <div className="card-body p-4 gap-4">

        {/* Header */}
        <h2 className="card-title text-sm font-mono tracking-widest uppercase text-base-content/50">
          🗂 Deletion Queue
        </h2>

        {/* Active / Waiting jobs */}
        <div>
          <p className="text-xs text-base-content/40 mb-1 uppercase tracking-wider">
            Pending ({pending.length})
          </p>
          {pending.length === 0
            ? <p className="text-xs text-base-content/30 italic">Queue is empty</p>
            : pending.map(job => <JobRow key={job.id} job={job} />)
          }
        </div>

        {/* Recent history */}
        <div>
          <p className="text-xs text-base-content/40 mb-1 uppercase tracking-wider">
            Recent History ({history.length})
          </p>
          {history.length === 0
            ? <p className="text-xs text-base-content/30 italic">No jobs yet</p>
            : history.map(job => <JobRow key={job.id} job={job} />)
          }
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(STATE_BADGE).map(([state, cls]) => (
            <span key={state} className={`badge badge-sm ${cls}`}>{state}</span>
          ))}
        </div>
      </div>
    </div>
  );
}