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

const links = [
  { href: '/', label: 'Posiciones' },
  { href: '/anuncios', label: 'Anuncios' },
  { href: '/agentes-libres', label: 'Agentes libres' },
  { href: '/movimientos', label: 'Movimientos' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-zinc-50 dark:bg-black`}
      >
        {/* Encabezado sticky: ocupa su propio espacio, así que nunca tapa el contenido */}
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <nav className="mx-auto flex max-w-3xl flex-col gap-1 px-4 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between sm:py-3">
            <Link
              href="/"
              className="whitespace-nowrap text-base font-bold text-zinc-900 sm:text-lg dark:text-zinc-100"
            >
              Liga Fantasy NBA 2026-27
            </Link>
            {/* En celular el menú se desliza de lado; en pantallas grandes se muestra completo */}
            <div className="-mx-4 flex gap-4 overflow-x-auto whitespace-nowrap px-4 sm:mx-0 sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 py-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}