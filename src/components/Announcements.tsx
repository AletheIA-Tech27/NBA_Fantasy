import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Announcement = {
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

// Muestra los 3 anuncios más recientes (los fijados primero).
// Si no hay anuncios o la consulta falla, no muestra nada y no rompe la página.
export async function Announcements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, created_at, title, body, pinned')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) return null;
  const items = data as Announcement[];

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-ink">
          Anuncios
        </h2>
        <Link href="/anuncios" className="text-sm font-medium text-brand hover:underline">
          Ver todos
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border border-line bg-surface p-3 ${
              a.pinned ? 'border-l-4 border-l-brand' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="break-words font-semibold text-ink">{a.title}</p>
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
              <p className="mt-1 whitespace-pre-line break-words text-sm text-muted">{a.body}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}