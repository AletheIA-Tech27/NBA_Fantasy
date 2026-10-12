import { supabase } from '@/lib/supabase';
import { Announcement } from '@/lib/types';

export const revalidate = 300;

// created_at es un timestamp en UTC: se convierte a la fecha de la Ciudad de México
const formatDate = (ts: string) => {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default async function AnunciosPage() {
  let announcements: Announcement[] = [];
  let error = null;

  try {
    const { data, error: supabaseError } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (supabaseError) throw supabaseError;
    announcements = data || [];
  } catch (err) {
    error = err;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center min-h-screen justify-center p-4 bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">
          Error al cargar los anuncios. Por favor, intenta más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Anuncios</h1>
        {announcements.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">Aún no hay anuncios</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-lg bg-white p-3 shadow sm:p-4 dark:bg-zinc-900">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h2 className="break-words font-medium text-zinc-900 dark:text-zinc-100">
                    {a.title}
                  </h2>
                  <div className="flex shrink-0 items-center gap-2">
                    {a.pinned && (
                      <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        Fijado
                      </span>
                    )}
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(a.created_at)}
                    </span>
                  </div>
                </div>
                {a.body && (
                  <p className="whitespace-pre-line break-words text-sm text-zinc-700 sm:text-base dark:text-zinc-300">
                    {a.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}