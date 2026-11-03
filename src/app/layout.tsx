import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { BookmarkProvider } from "@/context/BookmarkContext";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevSphere — AI & Tech Discovery Dashboard",
  description:
    "A personal platform for discovering trending GitHub repositories in AI, LLMs, Agents, RAG, and open source.",
  applicationName: "DevSphere",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DevSphere",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#080c14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <BookmarkProvider>
          <ServiceWorkerRegister />
          {/* Desktop Left Sidebar */}
          <Sidebar />

          {/* Main Viewport Container */}
          <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-6">
            {children}
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </BookmarkProvider>
      </body>
    </html>
  );
}
