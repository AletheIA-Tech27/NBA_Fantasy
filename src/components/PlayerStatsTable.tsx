import Link from 'next/link';
import { PlayerPhoto } from '@/components/PlayerPhoto';

export type PlayerStatsRow = {
  player_id: number;
  name: string;
  games: number | string | null;
  total_points: number | string | null;
  sum_pts: number | string | null;
  sum_reb: number | string | null;
  sum_ast: number | string | null;
  sum_stl: number | string | null;
  sum_blk: number | string | null;
  sum_tov: number | string | null;
  sum_fg3m: number | string | null;
};

const n = (v: number | string | null | undefined) => Number(v ?? 0);
const fmt1 = (v: number) =>
  v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Promedio por partido; si no hay partidos muestra "—"
const avg = (sum: number | string | null, games: number) =>
  games > 0 ? fmt1(n(sum) / games) : '—';

const th =
  'px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap';
const td = 'px-3 py-2.5 text-right text-sm tabular-nums text-ink/90 whitespace-nowrap';

export function PlayerStatsTable({ players }: { players: PlayerStatsRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="bg-surface-2">
            <th className="sticky left-0 bg-surface-2 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              Jugador
            </th>
            <th className={th}>PJ</th>
            <th className={th}>FANT</th>
            <th className={th}>FANT/PJ</th>
            <th className={th}>PTS</th>
            <th className={th}>REB</th>
            <th className={th}>AST</th>
            <th className={th}>STL</th>
            <th className={th}>BLK</th>
            <th className={th}>TOV</th>
            <th className={th}>3PM</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const games = n(p.games);
            return (
              <tr key={p.player_id} className="border-t border-line">
                <td className="sticky left-0 whitespace-nowrap bg-surface px-3 py-2 text-left shadow-[4px_0_6px_-4px_rgba(0,0,0,0.7)]">
                  <div className="flex items-center gap-2.5">
                    <PlayerPhoto playerId={p.player_id} name={p.name} size={32} />
                    <Link
                      href={`/jugador/${p.player_id}`}
                      className="text-sm font-semibold text-ink hover:text-brand"
                    >
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className={td}>{games}</td>
                <td className={`${td} font-display text-lg font-bold text-ink`}>
                  {fmt1(n(p.total_points))}
                </td>
                <td className={`${td} font-semibold text-brand`}>{avg(p.total_points, games)}</td>
                <td className={td}>{avg(p.sum_pts, games)}</td>
                <td className={td}>{avg(p.sum_reb, games)}</td>
                <td className={td}>{avg(p.sum_ast, games)}</td>
                <td className={td}>{avg(p.sum_stl, games)}</td>
                <td className={td}>{avg(p.sum_blk, games)}</td>
                <td className={td}>{avg(p.sum_tov, games)}</td>
                <td className={td}>{avg(p.sum_fg3m, games)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}