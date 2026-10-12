'use client';

import { useState } from 'react';

const BASE = 'https://cdn.nba.com/headshots/nba/latest';

// Foto del jugador desde el CDN de la NBA, usando su player_id.
// El navegador elige entre dos tamaños según el tamaño en pantalla y la densidad
// de la pantalla (así las fotos grandes salen nítidas y las chicas no gastan datos).
// Si falla la versión grande se usa la chica, y si esa también falla, las iniciales.
export function PlayerPhoto({
  playerId,
  name,
  size = 32,
}: {
  playerId: number | string;
  name: string;
  size?: number;
}) {
  // 0 = ambos tamaños, 1 = solo el chico, 2 = iniciales
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const fail = () => setStage((s) => (s === 0 ? 1 : 2));

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const box = { width: size, height: size };

  if (stage === 2) {
    return (
      <span
        style={{ ...box, fontSize: Math.max(10, Math.round(size / 3)) }}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
        aria-hidden="true"
      >
        {initials}
      </span>
    );
  }

  const small = `${BASE}/260x190/${playerId}.png`;
  const large = `${BASE}/1040x760/${playerId}.png`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={stage}
      ref={(img: HTMLImageElement | null) => {
        // Si el error ocurrió antes de que React activara el componente, lo detectamos aquí
        if (img && img.complete && img.naturalWidth === 0) fail();
      }}
      src={small}
      srcSet={stage === 0 ? `${small} 260w, ${large} 1040w` : undefined}
      sizes={stage === 0 ? `${size * 2}px` : undefined}
      alt=""
      loading="lazy"
      decoding="async"
      style={box}
      onError={fail}
      className="shrink-0 rounded-full bg-zinc-200 object-cover object-top dark:bg-zinc-700"
    />
  );
}