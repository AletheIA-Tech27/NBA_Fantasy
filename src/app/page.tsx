import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Standing, BoxScore } from '@/lib/types';
import { Announcements } from '@/components/Announcements';

export const revalidate = 300;

export default async function Home() {
  let standings: Standing[] = [];
  let latestGameDate: string | null = null;
  let error = null;

  try {
    const { data: standingsData, error: standingsError } = await supabase
      .from('standings')
      .select('*')
      .order('total_points', { ascending: false });

    if (standingsError) throw standingsError;
    standings = standingsData || [];

    const { data: boxScores, error: boxScoresError } = await supabase
      .from('box_scores')
      .select('game_date')
      .order('game_date', { ascending: false })
      .limit(1);

    if (!boxScoresError && boxScores && boxScores.length > 0) {
      latestGameDate = (boxScores[0] as BoxScore).game_date;
    }
  } catch (err) {
    error = err;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center min-h-screen justify-center p-4 bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">
          Error al cargar las estadísticas. Por favor, intenta más tarde.
        </p>
      </div>
    );
  }

  const formatNumber = (value: number | string) =>
    Number(value).toLocaleString('es-MX', {
      style: 'decimal',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const formatDate = (dateStr: string) => dateStr.split('-').reverse().join('/');

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl">
        <Announcements />

        <div className="mb-4">
          {latestGameDate ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Estadísticas hasta: {formatDate(latestGameDate)}
            </p>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Aún no hay partidos de la temporada
            </p>
          )}
        </div>

        {standings.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No hay datos disponibles</p>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase">
                    Pos.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase">
                    Equipo
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase">
                    Puntos
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing, index) => (
                  <tr
                    key={standing.id}
                    className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <td className="px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/equipo/${standing.id}`}
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        {standing.name}
                      </Link>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{standing.owner}</p>
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-zinc-700 dark:text-zinc-300">
                      {formatNumber(standing.total_points)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}