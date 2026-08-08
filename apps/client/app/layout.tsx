import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { Suspense } from "react";
import LiveSessionIndicator from "../components/LiveSessionIndicator";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Telemetrix',
    default: 'Telemetrix | Ultimate F1 Dashboard',
  },
  description: 'The ultimate Formula 1 race weekend dashboard. Track live timing, standings, calendar, and race stats.',
  keywords: ['F1', 'Formula 1', 'dashboard', 'live timing', 'standings', 'calendar', 'race stats', 'motorsport'],
  authors: [{ name: 'Telemetrix Team' }],
  creator: 'Telemetrix',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://telemetrix.app',
    title: 'Telemetrix | Ultimate F1 Dashboard',
    description: 'The ultimate Formula 1 race weekend dashboard. Track live timing, standings, calendar, and race stats.',
    siteName: 'Telemetrix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telemetrix | Ultimate F1 Dashboard',
    description: 'The ultimate Formula 1 race weekend dashboard.',
    creator: '@telemetrix',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-background text-foreground`}>
        {/* Top Navbar */}
        <header className="w-full bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-6 h-6 rounded-full bg-transparent border-2 border-primary flex items-center justify-center shadow-[0_0_10px_rgba(253,38,92,0.5)] group-hover:shadow-[0_0_15px_rgba(253,38,92,0.8)] transition-all">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <h1 className="text-lg font-semibold tracking-widest text-foreground hidden sm:block group-hover:text-primary transition-colors">TELEMETRIX</h1>
            </Link>

            {/* Navigation Links */}
            <nav className="flex space-x-1 md:space-x-4">
              <Link href="/dashboard">
                <div className="px-3 py-2 text-muted-foreground hover:bg-accent/30 hover:text-foreground rounded-md cursor-pointer text-sm font-medium transition-colors">
                  Dashboard
                </div>
              </Link>
              <Link href="/standings">
                <div className="px-3 py-2 text-muted-foreground hover:bg-accent/30 hover:text-foreground rounded-md cursor-pointer text-sm font-medium transition-colors">
                  Standings
                </div>
              </Link>
              <Link href="/calendar">
                <div className="px-3 py-2 text-muted-foreground hover:bg-accent/30 hover:text-foreground rounded-md cursor-pointer text-sm font-medium transition-colors">
                  Calendar
                </div>
              </Link>
              <Link href="/news">
                <div className="px-3 py-2 text-muted-foreground hover:bg-accent/30 hover:text-foreground rounded-md cursor-pointer text-sm font-medium transition-colors hidden sm:block">
                  News
                </div>
              </Link>
            </nav>

            {/* Actions */}
            <div>
              <Suspense fallback={<div className="w-24 h-8 bg-muted rounded-md animate-pulse"></div>}>
                <LiveSessionIndicator />
              </Suspense>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-background relative overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
