import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SplashScreen } from "@/components/ui/splash-screen";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "Sapphire — Autonomous AI Creative Director",
  description: "Transform simple ideas into production-ready social media content with brand awareness and trend research.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-sapphire-bg text-sapphire-dark antialiased font-sans flex flex-col selection:bg-sapphire-subtle">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}

