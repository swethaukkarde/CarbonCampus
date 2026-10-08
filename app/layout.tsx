import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import WeatherBar from "@/components/WeatherBar";
import AnomalyAlert from "@/components/AnomalyAlert";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusCarbon — Alliance University",
  description: "AI-powered smart campus energy optimizer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0F172A] text-white min-h-screen`}>
        {/* Navbar */}
        <nav className="border-b border-[#1E293B] bg-[#0F172A]/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <span className="text-yellow-400">⚡</span>
                <span className="text-white">CampusCarbon</span>
                <span className="text-xs text-slate-400 font-normal hidden sm:block">
                  Alliance University
                </span>
              </Link>
              <div className="flex items-center gap-1 sm:gap-2">
                <NavLink href="/">Dashboard</NavLink>
                <NavLink href="/map">Map</NavLink>
                <NavLink href="/whatif">What-If</NavLink>
                <NavLink href="/copilot" highlight>Copilot</NavLink>
              </div>
            </div>
          </div>
        </nav>

        {/* Weather Bar */}
        <WeatherBar />

        {/* Anomaly Alert */}
        <AnomalyAlert />

        {/* Page content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({
  href,
  children,
  highlight,
}: {
  href: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        highlight
          ? "bg-blue-600 text-white hover:bg-blue-500"
          : "text-slate-300 hover:text-white hover:bg-[#1E293B]"
      }`}
    >
      {children}
    </Link>
  );
}
