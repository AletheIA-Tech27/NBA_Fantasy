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
    <section className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Anuncios</h2>
        <Link href="/anuncios" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          Ver todos
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="rounded-lg bg-white dark:bg-zinc-900 p-3">
            <div className="flex items-center gap-2">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{a.title}</p>
              {a.pinned && (
                <span className="text-xs rounded bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 text-zinc-700 dark:text-zinc-200">
                  Fijado
                </span>
              )}
              <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
                {formatDate(a.created_at)}
              </span>
            </div>
            {a.body && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                {a.body}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}