import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PlayerPhoto } from '@/components/PlayerPhoto';

export const revalidate = 300;

type PlayerRow = { player_id: number; name: string };
type TeamRow = { id: number; name: string };
type Val = number | string | null;
type GameLog = {
  game_id: string;
  game_date: string;
  team_abbr: string | null;
  min: Val;
  pts: Val;
  reb: Val;
  ast: Val;
  stl: Val;
  blk: Val;
  tov: Val;
  fg3m: Val;
  fantasy_points: Val;
};

const num = (v: Val | undefined) => Number(v ?? 0);
const fmt1 = (v: number) =>
  v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmt0 = (v: number) => v.toLocaleString('es-MX', { maximumFractionDigits: 0 });
const formatDate = (s: string) => s.split('-').reverse().join('/');

export default async function JugadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const playerId = Number(id);

  let player: PlayerRow | null = null;
  let team: TeamRow | null = null;
  let logs: GameLog[] = [];
  let failed = false;

  try {
    const { data: p, error: pe } = await supabase
      .from('players')
      .select('player_id, name')
      .eq('player_id', playerId)
      .maybeSingle();
    if (pe) throw pe;
    player = p;

    if (player) {
      const { data: r, error: re } = await supabase
        .from('current_rosters')
        .select('team_id')
        .eq('player_id', playerId)
        .maybeSingle();
      if (re) throw re;

      if (r) {
        const { data: t, error: te } = await supabase
          .from('fantasy_teams')
          .select('id, name')
          .eq('id', r.team_id)
          .maybeSingle();
        if (te) throw te;
        team = t;
      }

      const { data: l, error: le } = await supabase
        .from('player_game_log')
        .select('game_id, game_date, team_abbr, min, pts, reb, ast, stl, blk, tov, fg3m, fantasy_points')
        .eq('player_id', playerId)
        .order('game_date', { ascending: false });
      if (le) throw le;
      logs = l ?? [];
    }
  } catch {
    failed = true;
  }

  // Solo es 404 si el jugador realmente no existe; un fallo de consulta no lo es
  if (!failed && !player) notFound();

  if (failed || !player) {
    return (
      <div className="flex flex-col items-center p-4">
        <p className="w-full max-w-3xl text-zinc-600 dark:text-zinc-400">
          No se pudo cargar la información del jugador. Intenta de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const games = logs.length;
  const sum = (key: keyof GameLog) => logs.reduce((acc, l) => acc + num(l[key] as Val), 0);
  const avg = (key: keyof GameLog) => (games > 0 ? sum(key) / games : 0);
  const totalFantasy = sum('fantasy_points');

  const averages: [string, string][] = [
    ['FANT', fmt1(avg('fantasy_points'))],
    ['MIN', fmt1(avg('min'))],
    ['PTS', fmt1(avg('pts'))],
    ['REB', fmt1(avg('reb'))],
    ['AST', fmt1(avg('ast'))],
    ['STL', fmt1(avg('stl'))],
    ['BLK', fmt1(avg('blk'))],
    ['TOV', fmt1(avg('tov'))],
    ['3PM', fmt1(avg('fg3m'))],
  ];

  const th = 'px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase';
  const td = 'px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200';

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <PlayerPhoto playerId={player.player_id} name={player.name} size={72} />
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{player.name}</h1>
            {team ? (
              <Link
                href={`/equipo/${team.id}`}
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Equipo: {team.name}
              </Link>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Agente libre</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Resumen</h2>
          {games === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">Sin partidos registrados</p>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Partidos jugados</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{fmt0(games)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Puntos fantasy totales</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{fmt1(totalFantasy)}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Promedios por partido</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {averages.map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {games > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              Historial de partidos
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800">
                    <th className={`${th} text-left`}>Fecha</th>
                    <th className={`${th} text-left`}>Equipo</th>
                    <th className={`${th} text-right`}>MIN</th>
                    <th className={`${th} text-right`}>PTS</th>
                    <th className={`${th} text-right`}>REB</th>
                    <th className={`${th} text-right`}>AST</th>
                    <th className={`${th} text-right`}>STL</th>
                    <th className={`${th} text-right`}>BLK</th>
                    <th className={`${th} text-right`}>TOV</th>
                    <th className={`${th} text-right`}>3PM</th>
                    <th className={`${th} text-right`}>FANT</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr
                      key={l.game_id}
                      className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <td className={td}>{formatDate(l.game_date)}</td>
                      <td className={td}>{l.team_abbr ?? '—'}</td>
                      <td className={`${td} text-right`}>{fmt0(num(l.min))}</td>
                      <td className={`${td} text-right`}>{fmt0(num(l.pts))}</td>
                      <td className={`${td} text-right`}>{fmt0(num(l.reb))}</td>
                      <td className={`${td} text-right`}>{fmt0(num(l.ast))}</td>
                      <td className={`${td} text-right`}>{fmt0(num(l.stl))}</td>
                      <td className={`${td} text-right`}>{fmt0(num(l.blk))}</td>
                      <td className={`${td} text-right`}>{fmt0(num(l.tov))}</td>
                      <td className={`${td} text-right`}>{fmt0(num(l.fg3m))}</td>
                      <td className={`${td} text-right`}>{fmt1(num(l.fantasy_points))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}