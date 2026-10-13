import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PlayerPhoto } from '@/components/PlayerPhoto';
import { TeamCrest } from '@/components/TeamCrest';

export const revalidate = 60;

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

const th =
  'px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap';
const td = 'px-3 py-2.5 text-right text-sm tabular-nums text-ink/90 whitespace-nowrap';

function Box({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-2 py-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p
        className={`mt-0.5 font-display text-3xl font-extrabold leading-none ${
          accent ? 'text-brand' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

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
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          No se pudo cargar la información del jugador. Intenta de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const games = logs.length;
  const sum = (key: keyof GameLog) => logs.reduce((acc, l) => acc + num(l[key] as Val), 0);
  const avg = (key: keyof GameLog) => (games > 0 ? sum(key) / games : 0);
  const totalFantasy = sum('fantasy_points');
  const bestGame = games > 0 ? Math.max(...logs.map((l) => num(l.fantasy_points))) : 0;

  const averages: [string, string][] = [
    ['MIN', fmt1(avg('min'))],
    ['PTS', fmt1(avg('pts'))],
    ['REB', fmt1(avg('reb'))],
    ['AST', fmt1(avg('ast'))],
    ['STL', fmt1(avg('stl'))],
    ['BLK', fmt1(avg('blk'))],
    ['TOV', fmt1(avg('tov'))],
    ['3PM', fmt1(avg('fg3m'))],
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      {team ? (
        <Link href={`/equipo/${team.id}`} className="text-sm font-medium text-muted hover:text-brand">
          ← {team.name}
        </Link>
      ) : (
        <Link href="/agentes-libres" className="text-sm font-medium text-muted hover:text-brand">
          ← Agentes libres
        </Link>
      )}

      {/* Encabezado */}
      <div className="mb-5 mt-3 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-brand/15 via-surface to-surface p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-full p-1 ring-2 ring-brand">
            <PlayerPhoto playerId={player.player_id} name={player.name} size={96} />
          </div>
          <div className="min-w-0">
            <h1 className="break-words font-display text-3xl font-extrabold uppercase leading-none tracking-wide text-ink sm:text-4xl">
              {player.name}
            </h1>
            {team ? (
              <Link
                href={`/equipo/${team.id}`}
                className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface-2 py-1 pl-1 pr-3 text-sm font-semibold text-ink transition-colors hover:border-brand"
              >
                <TeamCrest id={team.id} name={team.name} size={24} />
                <span className="truncate">{team.name}</span>
              </Link>
            ) : (
              <span className="mt-2 inline-block rounded-full border border-line bg-surface-2 px-3 py-1 text-sm text-muted">
                Agente libre
              </span>
            )}
          </div>
        </div>
      </div>

      {games === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Sin partidos registrados
        </p>
      ) : (
        <>
          {/* Resumen */}
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Box label="Partidos" value={fmt0(games)} />
            <Box label="Fantasy total" value={fmt1(totalFantasy)} />
            <Box label="Fantasy / PJ" value={fmt1(avg('fantasy_points'))} accent />
            <Box label="Mejor partido" value={fmt1(bestGame)} />
          </div>

          <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Promedios por partido
          </p>
          <div className="mb-8 grid grid-cols-4 gap-2">
            {averages.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-line bg-surface px-1 py-2.5 text-center"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {label}
                </p>
                <p className="mt-0.5 font-display text-2xl font-bold leading-none text-ink">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Historial */}
          <h2 className="mb-3 font-display text-2xl font-extrabold uppercase tracking-wide text-ink">
            Historial de partidos
          </h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-surface-2">
                  <th className="sticky left-0 bg-surface-2 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Fecha
                  </th>
                  <th className={`${th} text-left`}>Equipo</th>
                  <th className={th}>MIN</th>
                  <th className={th}>PTS</th>
                  <th className={th}>REB</th>
                  <th className={th}>AST</th>
                  <th className={th}>STL</th>
                  <th className={th}>BLK</th>
                  <th className={th}>TOV</th>
                  <th className={th}>3PM</th>
                  <th className={th}>FANT</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => {
                  const fant = num(l.fantasy_points);
                  return (
                    <tr key={l.game_id} className="border-t border-line">
                      <td className="sticky left-0 whitespace-nowrap bg-surface px-3 py-2.5 text-left text-sm text-ink shadow-[4px_0_6px_-4px_rgba(0,0,0,0.7)]">
                        {formatDate(l.game_date)}
                      </td>
                      <td className={`${td} text-left`}>{l.team_abbr ?? '—'}</td>
                      <td className={td}>{fmt0(num(l.min))}</td>
                      <td className={td}>{fmt0(num(l.pts))}</td>
                      <td className={td}>{fmt0(num(l.reb))}</td>
                      <td className={td}>{fmt0(num(l.ast))}</td>
                      <td className={td}>{fmt0(num(l.stl))}</td>
                      <td className={td}>{fmt0(num(l.blk))}</td>
                      <td className={td}>{fmt0(num(l.tov))}</td>
                      <td className={td}>{fmt0(num(l.fg3m))}</td>
                      <td
                        className={`${td} font-display text-lg font-bold ${
                          fant === bestGame ? 'text-gold' : 'text-ink'
                        }`}
                      >
                        {fmt1(fant)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            En dorado, su mejor partido en puntos fantasy.
          </p>
        </>
      )}
    </div>
  );
}