import type { Metadata } from 'next';
import { Geist, Geist_Mono, Barlow_Condensed } from 'next/font/google';
import Link from 'next/link';
import { NavLinks } from '@/components/NavLinks';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const barlow = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  weight: ['500', '600', '700', '800'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Liga Fantasy NBA 2026-27',
  description: 'Estadísticas de la Liga Fantasy NBA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${barlow.variable} min-h-screen antialiased`}
      >
        {/* Encabezado sticky: ocupa su propio espacio, así que nunca tapa el contenido */}
        <header className="sticky top-0 z-50 border-b border-line bg-court/90 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl flex-col gap-2 px-4 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between sm:py-3">
            <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap">
              <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="11" fill="#ff6b1a" />
                <path
                  d="M12 1v22M1 12h22M4.2 4.2c4 3.2 4 12.4 0 15.6M19.8 4.2c-4 3.2-4 12.4 0 15.6"
                  stroke="#0a0c12"
                  strokeWidth="1.2"
                  fill="none"
                />
              </svg>
              <span className="font-display text-xl font-extrabold uppercase leading-none tracking-wide text-ink">
                Liga Fantasy <span className="text-brand">NBA 26-27</span>
              </span>
            </Link>
            <NavLinks />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}