'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { PlayerPhoto } from '@/components/PlayerPhoto';

export type PlayerDirRow = {
  player_id: number;
  name: string;
  team_id: number | null;
  team_name: string | null;
  total_points: number | string | null;
  games: number | string | null;
};

const TOP = 25; // cuántos se muestran sin buscar
const MAX = 50; // máximo de resultados mostrados al buscar

// Quita acentos, mayúsculas, apóstrofes y puntuación: "Jokić" -> "jokic", "De'Aaron" -> "deaaron"
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const fmt1 = (v: number) =>
  v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function PlayerSearch({ players }: { players: PlayerDirRow[] }) {
  const [query, setQuery] = useState('');

  // El nombre normalizado se calcula una sola vez
  const indexed = useMemo(
    () =>
      players.map((p) => {
        const n = norm(p.name);
        return { p, n, c: n.replace(/ /g, '') };
      }),
    [players]
  );

  const q = norm(query);

  const results = useMemo(() => {
    if (!q) return indexed.slice(0, TOP).map((x) => x.p);
    const tokens = q.split(' ');
    const compact = q.replace(/ /g, '');
    return indexed
      .filter((x) => tokens.every((t) => x.n.includes(t)) || x.c.includes(compact))
      .map((x) => x.p);
  }, [indexed, q]);

  const shown = q ? results.slice(0, MAX) : results;

  let caption: string;
  if (!q) {
    caption = `Los ${TOP} con más puntos fantasy`;
  } else if (results.length === 0) {
    caption = '';
  } else if (results.length > MAX) {
    caption = `${results.length} resultados. Mostrando los primeros ${MAX}; escribe más letras para afinar.`;
  } else {
    caption = `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`;
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        placeholder="Buscar jugador..."
        aria-label="Buscar jugador"
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
      />

      {caption && <p className="mb-2 mt-3 text-xs text-muted">{caption}</p>}

      {shown.length === 0 ? (
        <p className="mt-3 rounded-xl border border-line bg-surface p-4 text-muted">
          No encontré jugadores con ese nombre.
        </p>
      ) : (
        <div className="space-y-2">
          {shown.map((p) => {
            const games = Number(p.games ?? 0);
            return (
              <Link
                key={p.player_id}
                href={`/jugador/${p.player_id}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition-colors hover:bg-surface-2"
              >
                <PlayerPhoto playerId={p.player_id} name={p.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{p.name}</p>
                  {p.team_name ? (
                    <span className="inline-block max-w-full truncate rounded bg-brand/15 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
                      {p.team_name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Agente libre</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="whitespace-nowrap font-display text-xl font-bold leading-none tabular-nums text-ink">
                    {fmt1(Number(p.total_points ?? 0))}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{games} PJ</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}