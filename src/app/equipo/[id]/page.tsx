import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Standing, TeamPlayerPoints, FantasyTeam } from '@/lib/types';

export const revalidate = 300;

export default async function EquipoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Validar que id sea numérico
  const teamId = Number(id);
  if (Number.isNaN(teamId)) {
    notFound();
  }

  let team: FantasyTeam | null = null;
  let standing: Standing | null = null;
  let currentPlayers: TeamPlayerPoints[] = [];
  let exPlayers: TeamPlayerPoints[] = [];
  let error = null;

  try {
    // Obtener datos del equipo
    const { data: teamData, error: teamError } = await supabase
      .from('fantasy_teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError && teamError.code !== 'PGRST116') throw teamError;
    team = teamData;

    // Obtener total de puntos del standing
    const { data: standingData, error: standingError } = await supabase
      .from('standings')
      .select('*')
      .eq('id', teamId)
      .single();

    if (standingError) throw standingError;
    standing = standingData;

    // Obtener jugadores actuales
    const { data: currentData, error: currentError } = await supabase
      .from('team_player_points')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_current', true)
      .order('total_points', { ascending: false });

    if (currentError) throw currentError;
    currentPlayers = currentData || [];

    // Obtener ex-jugadores
    const { data: exData, error: exError } = await supabase
      .from('team_player_points')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_current', false)
      .order('total_points', { ascending: false });

    if (exError) throw exError;
    exPlayers = exData || [];
  } catch (err) {
    error = err;
  }

  if (error || !team) {
    notFound();
  }

  const formatNumber = (value: number | string) =>
    Number(value).toLocaleString('es-MX', {
      style: 'decimal',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{team.name}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Dueño: {team.owner}</p>
          {standing && (
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              Puntuación total: {formatNumber(standing.total_points)}
            </p>
          )}
        </div>

        {/* Jugadores actuales */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            Plantilla actual
          </h2>
          {currentPlayers.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">No hay jugadores en plantilla</p>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
              {currentPlayers.map((player) => (
                <div key={player.player_id} className="flex justify-between items-center p-3 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{player.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {player.games} partidos
                    </p>
                  </div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatNumber(player.total_points)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ex-jugadores */}
        {exPlayers.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              Ex-jugadores (puntos que aportaron mientras estuvieron en el equipo)
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
              {exPlayers.map((player) => (
                <div key={player.player_id} className="flex justify-between items-center p-3 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{player.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {player.games} partidos
                    </p>
                  </div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatNumber(player.total_points)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}