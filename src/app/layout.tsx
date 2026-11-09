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
          <div className="max-w-3xl mx-auto px-6 py-4 font-bold text-xl tracking-tight">Creedok</div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
        <footer className="max-w-3xl mx-auto px-6 py-10 text-xs text-black/40">
          Not affiliated with Creed or Strava.
        </footer>
      </body>
    </html>
  );
}
