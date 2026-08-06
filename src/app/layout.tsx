import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata = {
  title: 'AI Social Content OS',
  description: 'Agentic operating system for professional content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}