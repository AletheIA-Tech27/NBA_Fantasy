import { supabase } from '@/lib/supabase';
import { Transaction } from '@/lib/types';

export const revalidate = 300;

export default async function MovimientosPage() {
  let transactions: Transaction[] = [];
  let error = null;

  try {
    const { data, error: supabaseError } = await supabase
      .from('transactions')
      .select('*')
      .order('id', { ascending: false })
      .limit(200);

    if (supabaseError) throw supabaseError;
    transactions = data || [];
  } catch (err) {
    error = err;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">
          Error al cargar los movimientos. Por favor, intenta más tarde.
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => dateStr.split('-').reverse().join('/');

  const formatKind = (kind: string) => (kind === 'free_agent' ? 'Agente libre' : 'Trade');

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Movimientos</h1>
        {transactions.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">Aún no hay movimientos</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="rounded-lg bg-white p-3 shadow sm:p-4 dark:bg-zinc-900">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {formatDate(tx.effective_date)}
                  </span>
                  <span className="shrink-0 rounded bg-zinc-200 px-2 py-1 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {formatKind(tx.kind)}
                  </span>
                </div>
                <p className="break-words text-sm text-zinc-700 sm:text-base dark:text-zinc-300">
                  {tx.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}