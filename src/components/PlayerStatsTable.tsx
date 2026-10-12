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

const th = 'px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase whitespace-nowrap';
const td = 'px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 text-right whitespace-nowrap';

export function PlayerStatsTable({ players }: { players: PlayerStatsRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            <th className={`${th} text-left sticky left-0 bg-zinc-100 dark:bg-zinc-800`}>Jugador</th>
            <th className={`${th} text-right`}>PJ</th>
            <th className={`${th} text-right`}>FANT</th>
            <th className={`${th} text-right`}>FANT/PJ</th>
            <th className={`${th} text-right`}>PTS</th>
            <th className={`${th} text-right`}>REB</th>
            <th className={`${th} text-right`}>AST</th>
            <th className={`${th} text-right`}>STL</th>
            <th className={`${th} text-right`}>BLK</th>
            <th className={`${th} text-right`}>TOV</th>
            <th className={`${th} text-right`}>3PM</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const games = n(p.games);
            return (
              <tr key={p.player_id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-3 py-2 text-sm text-left whitespace-nowrap sticky left-0 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <PlayerPhoto playerId={p.player_id} name={p.name} size={28} />
                    <Link
                      href={`/jugador/${p.player_id}`}
                      className="text-zinc-900 hover:underline dark:text-zinc-100"
                    >
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className={td}>{games}</td>
                <td className={td}>{fmt1(n(p.total_points))}</td>
                <td className={td}>{avg(p.total_points, games)}</td>
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