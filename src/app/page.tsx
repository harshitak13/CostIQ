// src/app/page.tsx — Landing page + spend input form (stub)

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen">
      <main className="flex flex-col items-center gap-8 p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold tracking-tight text-center">
          Cost IQ
        </h1>
        <p className="text-lg text-center text-zinc-600 dark:text-zinc-400">
          Find out if you&apos;re overpaying for AI tools. Get a free instant
          audit of your AI stack.
        </p>

        {/* TODO: Replace with SpendForm component on Day 2 */}
        <div className="w-full p-6 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-center text-zinc-500">
          <p>Spend input form will go here</p>
        </div>
      </main>
    </div>
  );
}
