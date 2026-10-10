import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Liga Fantasy NBA 2026-27',
  description: 'Estadísticas de la Liga Fantasy NBA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-zinc-50 dark:bg-black pt-12`}>
        <header className="fixed top-0 w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-50">
          <nav className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Liga Fantasy NBA 2026-27
            </h1>
            <div className="flex space-x-4">
              <Link
                href="/"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Posiciones
              </Link>
              <Link
                href="/movimientos"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Movimientos
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
