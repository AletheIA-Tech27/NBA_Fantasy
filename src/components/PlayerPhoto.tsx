'use client';

import { useState } from 'react';

// Foto del jugador desde el CDN de la NBA, usando su player_id.
// Si la foto no existe o falla, muestra un círculo con sus iniciales.
export function PlayerPhoto({
  playerId,
  name,
  size = 32,
}: {
  playerId: number | string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const box = { width: size, height: size };

  if (failed) {
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

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(img: HTMLImageElement | null) => {
        // Si el error ocurrió antes de que React activara el componente, lo detectamos aquí
        if (img && img.complete && img.naturalWidth === 0) setFailed(true);
      }}
      src={`https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`}
      alt=""
      loading="lazy"
      style={box}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full bg-zinc-200 object-cover object-top dark:bg-zinc-700"
    />
  );
}