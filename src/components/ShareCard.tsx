'use client'

import { useState } from 'react'

type Props = {
  totalMonthlySavings: number
  totalAnnualSavings: number
  shareUrl: string
  toolCount?: number
  useCase?: string
}

export default function ShareCard({
  totalMonthlySavings,
  totalAnnualSavings,
  shareUrl,
  toolCount,
  useCase,
}: Props) {
  const [copied, setCopied] = useState(false)

  const hasSavings = totalMonthlySavings > 0

  const tweetText = hasSavings
    ? `Just audited my AI tool stack with Cost IQ and found ` +
      `$${totalMonthlySavings.toFixed(2)}/mo in savings ` +
      `($${totalAnnualSavings.toFixed(2)}/yr). Free audit: ${shareUrl}`
    : `Just audited my AI tool stack with Cost IQ — spending looks ` +
      `optimised. Free audit for your team: ${shareUrl}`

  const tweetUrl =
    `https://twitter.com/intent/tweet?text=` +
    encodeURIComponent(tweetText)

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="share-card relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 sm:p-8">
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 30% -20%, rgba(52,211,153,0.12) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 50% 40% at 80% 110%, rgba(99,102,241,0.10) 0%, transparent 60%)',
        }}
      />

      <div className="relative space-y-4">
        {/* Branding */}
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Cost IQ · AI Spend Audit
        </p>

        {/* Savings hero */}
        <h2 className="text-3xl sm:text-4xl font-black leading-tight">
          {hasSavings ? (
            <span className="savings-big">
              ${totalMonthlySavings.toFixed(2)}/mo savings found
            </span>
          ) : (
            <span className="text-emerald-400">
              AI stack looks optimised ✓
            </span>
          )}
        </h2>

        {hasSavings && (
          <p className="text-zinc-400 text-sm font-medium">
            ${totalAnnualSavings.toFixed(2)} per year
          </p>
        )}

        {/* Meta row */}
        {(toolCount || useCase) && (
          <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
            {toolCount && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/60 px-3 py-1">
                🛠 {toolCount} tool{toolCount > 1 ? 's' : ''} audited
              </span>
            )}
            {useCase && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/60 px-3 py-1">
                📌 {useCase}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={copyLink}
            aria-label="Copy shareable link"
            className="btn-outline text-sm"
          >
            {copied ? (
              <>
                <span className="text-emerald-400">✓</span> Copied!
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Copy link
              </>
            )}
          </button>

          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm"
            aria-label="Share results on X (Twitter)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X →
          </a>
        </div>
      </div>
    </div>
  )
}
