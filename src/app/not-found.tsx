import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex flex-col items-center justify-center min-h-screen max-w-2xl mx-auto px-4 py-12 text-center space-y-6"
    >
      <p className="text-6xl font-black gradient-text">404</p>
      <h1 className="text-2xl font-bold text-zinc-100">
        Audit not found
      </h1>
      <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
        This audit link may have expired or the ID is invalid.
        Run a new audit to get a fresh report.
      </p>
      <Link
        href="/"
        className="cta-btn inline-flex"
      >
        Run a free audit →
      </Link>
    </main>
  )
}
