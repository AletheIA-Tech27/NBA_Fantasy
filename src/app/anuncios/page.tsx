import { supabase } from '@/lib/supabase';

export const revalidate = 60;

type AnnouncementRow = {
  id: number;
  created_at: string;
  title: string;
  body: string;
  pinned: boolean;
};

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
  let announcements: AnnouncementRow[] = [];
  let failed = false;

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, created_at, title, body, pinned')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    announcements = data ?? [];
  } catch {
    failed = true;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="mb-4 font-display text-3xl font-extrabold uppercase tracking-wide text-ink">
        Anuncios
      </h1>

      {failed ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Error al cargar los anuncios. Por favor, intenta más tarde.
        </p>
      ) : announcements.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Aún no hay anuncios
        </p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border border-line bg-surface p-3 sm:p-4 ${
                a.pinned ? 'border-l-4 border-l-brand' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="break-words text-base font-semibold text-ink">{a.title}</h2>
                <div className="flex shrink-0 items-center gap-2">
                  {a.pinned && (
                    <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                      Fijado
                    </span>
                  )}
                  <span className="text-xs text-muted">{formatDate(a.created_at)}</span>
                </div>
              </div>
              {a.body && (
                <p className="mt-1.5 whitespace-pre-line break-words text-sm text-muted sm:text-base">
                  {a.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}