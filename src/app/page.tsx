import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100">Dashboard</h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-zinc-400">Pending Review</p>
          <p className="text-2xl font-semibold text-amber-500">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-400">Scheduled</p>
          <p className="text-2xl font-semibold text-zinc-200">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-400">Published</p>
          <p className="text-2xl font-semibold text-green-500">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-400">Failed</p>
          <p className="text-2xl font-semibold text-red-500">0</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-zinc-200 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/ideas" className="block btn-primary text-center">
              Capture New Idea
            </Link>
            <Link href="/approval" className="block btn-secondary text-center">
              Review Pending Drafts
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-zinc-200 mb-4">Recent Posts</h3>
          <p className="text-zinc-500 text-sm">No posts yet. Capture your first idea to get started.</p>
        </div>
      </div>
    </div>
  );
}