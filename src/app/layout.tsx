import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "More Notables",
  description: "Personal milestones for your runs, beyond what Smashrun gives you out of the box.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" suppressHydrationWarning>
        <header className="border-b border-black/10 bg-white/60 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight">
              <span className="text-orange-500">More</span> Notables
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="hover:underline underline-offset-4">Mile Markers</Link>
              <Link href="/config" className="hover:underline underline-offset-4">Config</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        <footer className="max-w-5xl mx-auto px-6 py-10 text-xs text-black/40">
          Your token never leaves this browser. Smashrun runs are pulled through a stateless proxy.
        </footer>
      </body>
    </html>
  );
}
