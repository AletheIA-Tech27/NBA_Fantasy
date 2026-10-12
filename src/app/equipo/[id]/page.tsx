import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PlayerStatsTable, PlayerStatsRow } from '@/components/PlayerStatsTable';

export const revalidate = 300;

type TeamRow = { id: number; name: string; owner: string | null };
type StatsRow = PlayerStatsRow & { is_current: boolean };

const fmt1 = (v: number) =>
  v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const COLUMNS =
  'player_id, name, is_current, games, total_points, sum_pts, sum_reb, sum_ast, sum_stl, sum_blk, sum_tov, sum_fg3m';

export default async function EquipoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const teamId = Number(id);

  let team: TeamRow | null = null;
  let total = 0;
  let players: StatsRow[] = [];
  let failed = false;

  try {
    const { data: t, error: te } = await supabase
      .from('fantasy_teams')
      .select('id, name, owner')
      .eq('id', teamId)
      .maybeSingle();
    if (te) throw te;
    team = t;

    if (team) {
      const { data: s, error: se } = await supabase
        .from('standings')
        .select('total_points')
        .eq('id', teamId)
        .maybeSingle();
      if (se) throw se;
      total = Number(s?.total_points ?? 0);

      const { data: p, error: pe } = await supabase
        .from('team_player_stats')
        .select(COLUMNS)
        .eq('team_id', teamId);
      if (pe) throw pe;
      players = (p ?? []).sort(
        (a: StatsRow, b: StatsRow) => Number(b.total_points) - Number(a.total_points)
      );
    }
  } catch {
    failed = true;
  }

  // Solo es 404 si el equipo realmente no existe; un fallo de consulta no lo es
  if (!failed && !team) notFound();

  if (failed || !team) {
    return (
      <div className="flex flex-col items-center p-4">
        <p className="w-full max-w-3xl text-zinc-600 dark:text-zinc-400">
          No se pudo cargar la información del equipo. Intenta de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const current = players.filter((p) => p.is_current);
  const former = players.filter((p) => !p.is_current);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{team.name}</h1>
        {team.owner && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Dueño: {team.owner}</p>
        )}
        <p className="text-lg text-zinc-900 dark:text-zinc-100 mb-6">
          Puntuación total: {fmt1(total)}
        </p>

        <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
          Plantilla actual
        </h2>
        {current.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400 mb-2">Este equipo no tiene jugadores.</p>
        ) : (
          <PlayerStatsTable players={current} />
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-8">
          Estadísticas por partido, solo con los partidos jugados mientras estuvo en este equipo.
        </p>

        {former.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              Ex-jugadores (puntos que aportaron mientras estuvieron en el equipo)
            </h2>
            <PlayerStatsTable players={former} />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Estadísticas por partido, solo con los partidos jugados mientras estuvo en este equipo.
            </p>
          </>
                )}
      </div>
    </div>
  );
}