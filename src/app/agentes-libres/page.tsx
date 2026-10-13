import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PlayerPhoto } from '@/components/PlayerPhoto';

export const revalidate = 60;

type FreeAgentRow = {
  player_id: number;
  name: string;
  total_points: number | string | null;
  games: number | string | null;
};

const fmt1 = (v: number) =>
  v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const th =
  'px-2 py-2 sm:px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap';

export default async function AgentesLibresPage() {
  let freeAgents: FreeAgentRow[] = [];
  let failed = false;

  try {
    const { data, error } = await supabase
      .from('free_agents')
      .select('player_id, name, total_points, games')
      .order('total_points', { ascending: false })
      .limit(100);
    if (error) throw error;
    freeAgents = data ?? [];
  } catch {
    failed = true;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-ink">
        Agentes libres
      </h1>
      <p className="mb-4 text-sm text-muted">
        Para fichar a un agente libre, avisa al administrador de la liga.
      </p>

      {failed ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Error al cargar agentes libres. Por favor, intenta más tarde.
        </p>
      ) : freeAgents.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          No hay agentes libres
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2">
                <th className={`${th} text-left`}>#</th>
                <th className={`${th} text-left`}>Jugador</th>
                <th className={th}>PJ</th>
                <th className={th}>FANT</th>
                <th className={th}>FANT/PJ</th>
              </tr>
            </thead>
            <tbody>
              {freeAgents.map((agent, index) => {
                const games = Number(agent.games ?? 0);
                const pts = Number(agent.total_points ?? 0);
                const place = index + 1;
                const placeColor =
                  place === 1
                    ? 'text-gold'
                    : place === 2
                      ? 'text-silver'
                      : place === 3
                        ? 'text-bronze'
                        : 'text-muted';
                return (
                  <tr
                    key={agent.player_id}
                    className="border-t border-line transition-colors hover:bg-surface-2"
                  >
                    <td
                      className={`px-2 py-2 sm:px-3 font-display text-lg font-bold leading-none ${placeColor}`}
                    >
                      {place}
                    </td>
                    <td className="px-2 py-2 sm:px-3">
                      <div className="flex items-center gap-2.5">
                        <PlayerPhoto playerId={agent.player_id} name={agent.name} size={32} />
                        <Link
                          href={`/jugador/${agent.player_id}`}
                          className="text-sm font-semibold text-ink hover:text-brand"
                        >
                          {agent.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right text-sm tabular-nums text-ink/90 sm:px-3">
                      {games.toLocaleString('es-MX')}
                    </td>
                    <td className="px-2 py-2 text-right font-display text-lg font-bold tabular-nums text-ink sm:px-3">
                      {fmt1(pts)}
                    </td>
                    <td className="px-2 py-2 text-right text-sm font-semibold tabular-nums text-brand sm:px-3">
                      {games > 0 ? fmt1(pts / games) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}