// src/app/results/[id]/page.tsx — Shareable audit result page (stub)

type ResultsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Audit Results</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        Audit ID: <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{id}</code>
      </p>

      {/* TODO: Replace with AuditResults + LeadCapture + ShareCard on Day 3 */}
      <div className="w-full max-w-2xl p-6 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-center text-zinc-500">
        <p>Audit results will be rendered here</p>
      </div>
    </div>
  );
}
