import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PlayerStatsTable, PlayerStatsRow } from '@/components/PlayerStatsTable';
import { TeamCrest } from '@/components/TeamCrest';

export const revalidate = 60;

type TeamRow = { id: number; name: string; owner: string | null };
type StatsRow = PlayerStatsRow & { is_current: boolean };

const fmt1 = (v: number) =>
  v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const COLUMNS =
  'player_id, name, is_current, games, total_points, sum_pts, sum_reb, sum_ast, sum_stl, sum_blk, sum_tov, sum_fg3m';

const NOTE = 'Estadísticas por partido, solo con los partidos jugados mientras estuvo en este equipo.';

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-2 py-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 font-display text-3xl font-extrabold leading-none text-ink">
        {children}
      </p>
    </div>
  );
}

export default async function EquipoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const teamId = Number(id);

  let team: TeamRow | null = null;
  let total = 0;
  let position: number | null = null;
  let teamCount = 0;
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
      // La posición se calcula con la clasificación completa
      const { data: s, error: se } = await supabase
        .from('standings')
        .select('id, total_points')
        .order('total_points', { ascending: false });
      if (se) throw se;
      const rows = (s ?? []) as { id: number; total_points: number | string }[];
      teamCount = rows.length;
      const idx = rows.findIndex((r) => r.id === teamId);
      if (idx >= 0) {
        position = idx + 1;
        total = Number(rows[idx].total_points);
      }

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
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          No se pudo cargar la información del equipo. Intenta de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const current = players.filter((p) => p.is_current);
  const former = players.filter((p) => !p.is_current);
  const positionColor =
    position === 1
      ? 'text-gold'
      : position === 2
        ? 'text-silver'
        : position === 3
          ? 'text-bronze'
          : 'text-ink';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-muted hover:text-brand">
        ← Clasificación
      </Link>

      <div className="mb-5 mt-3 flex items-center gap-4">
        <TeamCrest id={team.id} name={team.name} size={64} />
        <div className="min-w-0">
          <h1 className="truncate font-display text-4xl font-extrabold uppercase leading-none tracking-wide text-ink">
            {team.name}
          </h1>
          {team.owner && <p className="mt-1 truncate text-sm text-muted">Dueño: {team.owner}</p>}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-2">
        <Stat label="Puntos">{fmt1(total)}</Stat>
        <Stat label="Posición">
          <span className={positionColor}>{position ?? '—'}º</span>
          {teamCount > 0 && <span className="text-base font-bold text-muted"> / {teamCount}</span>}
        </Stat>
        <Stat label="Jugadores">{current.length}</Stat>
      </div>

      <h2 className="mb-3 font-display text-2xl font-extrabold uppercase tracking-wide text-ink">
        Plantilla actual
      </h2>
      {current.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Este equipo no tiene jugadores.
        </p>
      ) : (
        <PlayerStatsTable players={current} />
      )}
      <p className="mb-8 mt-2 text-xs text-muted">{NOTE}</p>

      {former.length > 0 && (
        <>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-ink">
            Ex-jugadores
          </h2>
          <p className="mb-3 text-sm text-muted">
            Puntos que aportaron mientras estuvieron en el equipo.
          </p>
          <PlayerStatsTable players={former} />
          <p className="mt-2 text-xs text-muted">{NOTE}</p>
        </>
      )}
    </div>
  );
}