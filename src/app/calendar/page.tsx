'use client';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100">Calendar / Pipeline</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-amber-500 mb-3">Pending Review</h3>
          <p className="text-zinc-500 text-sm">No items pending</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-zinc-200 mb-3">Scheduled</h3>
          <p className="text-zinc-500 text-sm">No scheduled posts</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-green-500 mb-3">Published</h3>
          <p className="text-zinc-500 text-sm">No published posts yet</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Pipeline View</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="badge badge-amber">Pending</span>
            <span className="text-zinc-500">Ideas awaiting draft generation</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="badge badge-gray">Scheduled</span>
            <span className="text-zinc-500">Posts waiting to be published</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="badge badge-green">Published</span>
            <span className="text-zinc-500">Successfully published posts</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="badge badge-red">Failed</span>
            <span className="text-zinc-500">Posts that failed to publish</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="badge badge-cancelled">Cancelled</span>
            <span className="text-zinc-500">Manually cancelled posts</span>
          </div>
        </div>
      </div>
    </div>
  );
}