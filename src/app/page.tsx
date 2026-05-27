'use client'

import { useState } from 'react'
import SpendForm from '@/components/SpendForm'
import AuditResults from '@/components/AuditResults'
import LeadCapture from '@/components/LeadCapture'
import type { AuditResult } from '@/lib/auditEngine'

type SavedAudit = {
  id: string
  result: AuditResult
  persisted: boolean
}

export default function Home() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [savedAudit, setSavedAudit] = useState<SavedAudit | null>(null)

  function handleAuditComplete(result: AuditResult) {
    setAuditResult(result)
    setSavedAudit(null)
  }

  // Design decision: results render inline below the form (no navigation).
  // Rationale documented in ARCHITECTURE.md — the audit is instant and
  // client-side, so a page transition would add latency with zero benefit.
  // The UUID-based shareable URL (/results/:id) is generated on Day 3
  // after the lead is captured and the result is persisted to Supabase.

  return (
    <main id="main-content" className="flex flex-col items-center min-h-screen max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8 pb-24">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="w-full max-w-3xl flex items-center justify-between py-5">
        <span className="font-extrabold text-lg tracking-tight gradient-text">
          Cost IQ
        </span>
        <span className="badge badge-indigo">Free audit</span>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="w-full max-w-3xl text-center py-14 space-y-5 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
          Free · Instant · No account needed
        </div>

        <h1 className="text-balance">
          Know exactly what your{' '}
          <span className="gradient-text">AI tools</span>{' '}
          cost you.
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto">
          Free instant audit for startup founders and engineering managers.
          Enter your current AI subscriptions and see where you&apos;re
          overpaying — in under 30 seconds.
        </p>
      </section>

      {/* ── Form card ───────────────────────────────────────────────── */}
      <section className="w-full max-w-3xl">
        <div className="card animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-6">
            <h2 className="text-zinc-100">Your AI stack</h2>
            <p className="text-zinc-500 text-sm mt-1">
              Add every tool your team pays for. The audit runs entirely in your
              browser — nothing is sent to a server until you share your results.
            </p>
          </div>
          <SpendForm onAuditComplete={handleAuditComplete} />
        </div>
      </section>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {auditResult && (
        <section className="w-full max-w-3xl mt-8 space-y-8">
          <AuditResults
            result={auditResult}
            onAuditSaved={setSavedAudit}
          />
          {savedAudit && (
            <LeadCapture
              auditId={savedAudit.id}
              report={savedAudit.result}
              persisted={savedAudit.persisted}
              totalMonthlySavings={auditResult.totalMonthlySavings}
            />
          )}
        </section>
      )}

      {/* ── Social proof ────────────────────────────────────────────── */}
      {!auditResult && (
        <section
          className="w-full max-w-3xl mt-14 animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { stat: '$340', label: 'avg monthly savings found' },
              { stat: '8',    label: 'AI tools benchmarked' },
              { stat: '30s',  label: 'to complete your audit' },
            ].map(({ stat, label }) => (
              <div
                key={stat}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-5"
              >
                <p className="text-2xl font-extrabold gradient-text">{stat}</p>
                <p className="text-zinc-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <blockquote className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-5">
            <p className="text-zinc-300 text-sm leading-relaxed italic">
              &quot;We were paying for Cursor Business and GitHub Copilot Enterprise
              for 4 engineers. Cost IQ showed us we were $160/month over budget
              for our actual usage pattern.&quot;
            </p>
            <footer className="mt-3 text-xs text-zinc-500">
              — Alex K., CTO, Series A startup (mocked testimonial)
            </footer>
          </blockquote>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      {!auditResult && (
        <section className="w-full max-w-3xl mt-14 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 text-center">
            FAQ
          </h2>
          {[
            {
              q: 'Is Cost IQ free?',
              a: 'Yes — the audit runs 100% in your browser with no account required.',
            },
            {
              q: 'How accurate are the savings estimates?',
              a: 'Prices are sourced directly from vendor pricing pages and verified on 2026-05-22. Estimates are conservative — actual savings may be higher.',
            },
            {
              q: 'What does Cost IQ do with my data?',
              a: 'Nothing until you choose to share your results. The audit is fully client-side. Your spend data never leaves your browser unless you submit your email.',
            },
            {
              q: 'What is Credex?',
              a: 'Credex is a marketplace for discounted AI credits. For high-spend teams, buying credits through Credex instead of direct retail can cut costs by 15–25%.',
            },
          ].map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 cursor-pointer"
            >
              <summary className="text-sm font-medium text-zinc-200 list-none flex items-center justify-between gap-4">
                {q}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200 flex-shrink-0">
                  ▾
                </span>
              </summary>
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{a}</p>
            </details>
          ))}
        </section>
      )}
    </main>
  )
}
