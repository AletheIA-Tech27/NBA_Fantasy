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
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
        Bitácora
      </h1>
      {transactions.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">Aún no hay movimientos</p>
      ) : (
        <div className="w-full max-w-2xl space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(tx.effective_date)}
                </span>
                <span className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded">
                  {formatKind(tx.kind)}
                </span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300">{tx.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}