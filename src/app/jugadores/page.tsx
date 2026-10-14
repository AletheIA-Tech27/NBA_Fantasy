import { supabase } from '@/lib/supabase';
import { PlayerSearch, PlayerDirRow } from '@/components/PlayerSearch';

export const revalidate = 60;

const PAGE = 1000; // Supabase devuelve máximo 1000 filas por consulta

async function loadDirectory(): Promise<PlayerDirRow[]> {
  let all: PlayerDirRow[] = [];
  for (let from = 0; from < 5000; from += PAGE) {
    const { data, error } = await supabase
      .from('player_directory')
      .select('player_id, name, team_id, team_name, total_points, games')
      .order('total_points', { ascending: false })
      .order('name', { ascending: true })
      .order('player_id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    all = all.concat(data ?? []);
    if (!data || data.length < PAGE) break;
  }
  return all;
}

export default async function JugadoresPage() {
  let players: PlayerDirRow[] = [];
  let failed = false;

  try {
    players = await loadDirectory();
  } catch {
    failed = true;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-ink">
        Jugadores
      </h1>
      <p className="mb-4 text-sm text-muted">
        Busca a cualquier jugador de la NBA. Los puntos son los de toda su temporada, sin importar
        en qué equipo de la liga haya estado.
      </p>

      {failed ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Error al cargar los jugadores. Por favor, intenta más tarde.
        </p>
      ) : players.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          No hay jugadores disponibles
        </p>
      ) : (
        <PlayerSearch players={players} />
      )}
    </div>
  );
}