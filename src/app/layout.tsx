import './globals.css';

export const metadata = {
  title: 'AI Social Content OS',
  description: 'Agentic operating system for professional content',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-zinc-800 px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-lg font-semibold text-zinc-100">AI Content OS</h1>
            <nav className="flex gap-4 text-sm text-zinc-400">
              <a href="/" className="hover:text-zinc-200">Dashboard</a>
              <a href="/ideas" className="hover:text-zinc-200">Ideas</a>
              <a href="/approval" className="hover:text-zinc-200">Approval</a>
              <a href="/calendar" className="hover:text-zinc-200">Calendar</a>
              <a href="/settings" className="hover:text-zinc-200">Settings</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}