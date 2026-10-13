import { supabase } from '@/lib/supabase';

export const revalidate = 60;

type TransactionRow = {
  id: number;
  kind: string;
  effective_date: string;
  description: string;
};

const formatDate = (dateStr: string) => dateStr.split('-').reverse().join('/');

// Cada tipo de movimiento tiene su color
const KINDS: Record<string, { label: string; border: string; badge: string }> = {
  free_agent: {
    label: 'Agente libre',
    border: 'border-l-brand',
    badge: 'bg-brand/15 text-brand',
  },
  trade: {
    label: 'Trade',
    border: 'border-l-sky-400',
    badge: 'bg-sky-400/15 text-sky-300',
  },
};
const FALLBACK = {
  label: 'Movimiento',
  border: 'border-l-muted',
  badge: 'bg-surface-2 text-muted',
};

export default async function MovimientosPage() {
  let transactions: TransactionRow[] = [];
  let failed = false;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, kind, effective_date, description')
      .order('id', { ascending: false })
      .limit(200);
    if (error) throw error;
    transactions = data ?? [];
  } catch {
    failed = true;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-ink">
        Movimientos
      </h1>
      <p className="mb-4 text-sm text-muted">Fichajes e intercambios de la liga, del más reciente al más antiguo.</p>

      {failed ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Error al cargar los movimientos. Por favor, intenta más tarde.
        </p>
      ) : transactions.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          Aún no hay movimientos
        </p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const kind = KINDS[tx.kind] ?? FALLBACK;
            return (
              <div
                key={tx.id}
                className={`rounded-xl border border-l-4 border-line bg-surface p-3 sm:p-4 ${kind.border}`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-bold leading-none text-ink">
                    {formatDate(tx.effective_date)}
                  </span>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${kind.badge}`}
                  >
                    {kind.label}
                  </span>
                </div>
                <p className="break-words text-sm text-muted sm:text-base">{tx.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}