import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapphire — Autonomous AI Creative Director",
  description: "Transform simple ideas into production-ready social media content with brand awareness and trend research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-sapphire-bg text-sapphire-dark antialiased font-sans flex flex-col selection:bg-sapphire-subtle">
        {children}
      </body>
    </html>
  );
}
