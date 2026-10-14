'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Posiciones' },
  { href: '/jugadores', label: 'Jugadores' },
  { href: '/anuncios', label: 'Anuncios' },
  { href: '/agentes-libres', label: 'Agentes libres' },
  { href: '/movimientos', label: 'Movimientos' },
];

function isActive(href: string, pathname: string) {
  // La página de un equipo cuelga de "Posiciones" y la de un jugador, de "Jugadores"
  if (href === '/') return pathname === '/' || pathname.startsWith('/equipo');
  if (href === '/jugadores') {
    return pathname.startsWith('/jugadores') || pathname.startsWith('/jugador/');
  }
  return pathname.startsWith(href);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    // En celular el menú se desliza de lado; en pantallas grandes se muestra completo
    <div className="-mx-4 flex gap-1.5 overflow-x-auto whitespace-nowrap px-4 sm:mx-0 sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {links.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-brand text-court'
                : 'text-muted hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}