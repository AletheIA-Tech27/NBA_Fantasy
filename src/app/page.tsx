import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Standing, BoxScore } from '@/lib/types';
import { Announcements } from '@/components/Announcements';
import { TeamCrest } from '@/components/TeamCrest';

export const revalidate = 60;

const fmt1 = (value: number | string) =>
  Number(value).toLocaleString('es-MX', {
    style: 'decimal',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const formatDate = (dateStr: string) => dateStr.split('-').reverse().join('/');

const MEDALS = {
  1: { top: 'border-t-gold', text: 'text-gold' },
  2: { top: 'border-t-silver', text: 'text-silver' },
  3: { top: 'border-t-bronze', text: 'text-bronze' },
} as const;

function PodiumCard({ team, place }: { team: Standing; place: 1 | 2 | 3 }) {
  const medal = MEDALS[place];
  const first = place === 1;
  return (
    <Link
      href={`/equipo/${team.id}`}
      className={`flex min-w-0 flex-col items-center overflow-hidden rounded-xl border border-line border-t-4 bg-surface px-1.5 text-center transition-colors hover:bg-surface-2 ${medal.top} ${
        first ? 'pb-5 pt-5' : 'pb-3 pt-3'
      }`}
    >
      <span className={`font-display text-sm font-bold uppercase tracking-widest ${medal.text}`}>
        {place}º
      </span>
      <div className="mt-1">
        <TeamCrest id={team.id} name={team.name} size={first ? 56 : 44} />
      </div>
      <span className="mt-2 w-full truncate text-sm font-semibold text-ink">{team.name}</span>
      <span className="w-full truncate text-xs text-muted">{team.owner}</span>
      <span
        className={`mt-1 max-w-full whitespace-nowrap font-display font-extrabold tabular-nums text-ink ${
          first ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-2xl'
        }`}
      >
        {fmt1(team.total_points)}
      </span>
    </Link>
  );
}

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
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Error al cargar las estadísticas. Por favor, intenta más tarde.
        </p>
      </div>
    );
  }

  const leaderPoints = standings.length > 0 ? Number(standings[0].total_points) : 0;
  const showPodium = standings.length >= 3;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Announcements />

      <div className="mb-4">
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-ink">
          Clasificación
        </h1>
        <p className="text-sm text-muted">
          {latestGameDate
            ? `Estadísticas hasta: ${formatDate(latestGameDate)}`
            : 'Aún no hay partidos de la temporada'}
        </p>
      </div>

      {standings.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          No hay datos disponibles
        </p>
      ) : (
        <>
          {showPodium && (
            <div className="mb-4 grid grid-cols-[1fr_1.2fr_1fr] items-end gap-2 sm:gap-3">
              <PodiumCard team={standings[1]} place={2} />
              <PodiumCard team={standings[0]} place={1} />
              <PodiumCard team={standings[2]} place={3} />
            </div>
          )}

          <div className="space-y-2">
            {standings.map((team, index) => {
              const diff = leaderPoints - Number(team.total_points);
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
                <Link
                  key={team.id}
                  href={`/equipo/${team.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition-colors hover:bg-surface-2"
                >
                  <span
                    className={`w-6 text-center font-display text-2xl font-bold leading-none ${placeColor}`}
                  >
                    {place}
                  </span>
                  <TeamCrest id={team.id} name={team.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{team.name}</p>
                    <p className="truncate text-xs text-muted">{team.owner}</p>
                  </div>
                  <div className="text-right">
                    <p className="whitespace-nowrap font-display text-xl font-bold leading-none tabular-nums text-ink sm:text-2xl">
                      {fmt1(team.total_points)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {index === 0 ? 'Líder' : `-${fmt1(diff)}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}