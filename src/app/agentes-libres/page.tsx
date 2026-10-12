import { supabase } from '@/lib/supabase';
import { FreeAgent } from '@/lib/types';
import { PlayerPhoto } from '@/components/PlayerPhoto';
import Link from 'next/link';

export const revalidate = 300;

export default async function AgentesLibresPage() {
  let freeAgents: FreeAgent[] = [];
  let error = null;

  try {
    const { data, error: supabaseError } = await supabase
      .from('free_agents')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(100);

    if (supabaseError) throw supabaseError;
    freeAgents = data || [];
  } catch (err) {
    error = err;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center min-h-screen justify-center p-4 bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">
          Error al cargar agentes libres. Por favor, intenta más tarde.
        </p>
      </div>
    );
  }

  const fmt = (value: number | string) =>
    Number(value).toLocaleString('es-MX', {
      style: 'decimal',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const fmtInt = (value: number | string) =>
    Number(value).toLocaleString('es-MX');

  const th =
    'px-2 py-2 sm:px-4 text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase';

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl">
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Para fichar a un agente libre, avisa al administrador de la liga.
        </p>
        {freeAgents.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No hay agentes libres</p>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className={`${th} text-left`}>Pos.</th>
                  <th className={`${th} text-left`}>Nombre</th>
                  <th className={`${th} text-right`}>PJ</th>
                  <th className={`${th} text-right`}>Puntos</th>
                  <th className={`${th} text-right`}>Prom.</th>
                </tr>
              </thead>
              <tbody>
                {freeAgents.map((agent, index) => {
                  const games = Number(agent.games);
                  const pts = Number(agent.total_points);
                  const avg = games > 0 ? pts / games : 0;
                  return (
                    <tr
                      key={agent.player_id}
                      className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <td className="px-2 py-2 sm:px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 sm:px-4">
                        <div className="flex items-center gap-2">
                          <PlayerPhoto playerId={agent.player_id} name={agent.name} size={28} />
                          <Link
                            href={`/jugador/${agent.player_id}`}
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300"
                          >
                            {agent.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-2 py-2 sm:px-4 text-sm text-right text-zinc-700 dark:text-zinc-300">
                        {fmtInt(agent.games)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 text-sm text-right font-medium text-zinc-700 dark:text-zinc-300">
                        {fmt(agent.total_points)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 text-sm text-right text-zinc-600 dark:text-zinc-400">
                        {games > 0 ? fmt(avg) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}