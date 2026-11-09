import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creedok",
  description: "Renames your default-named Strava activities with Creed lyrics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-black/10">
          <a href="/" className="block max-w-3xl mx-auto px-6 py-4 font-bold text-xl tracking-tight">Creedok</a>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
        <footer className="max-w-3xl mx-auto px-6 py-10 text-xs text-black/50 space-x-4">
          <a href="/privacy" className="underline">Privacy and terms</a>
          <a href="mailto:justinkwarren@gmail.com" className="underline">Contact</a>
          <a href="https://www.strava.com/dashboard" className="underline">Your Strava account</a>
          <span>Not affiliated with Creed or Strava.</span>
        </footer>
      </body>
    </html>
  );
}
