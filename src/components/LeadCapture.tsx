'use client'

import { useState } from 'react'

type Props = {
  auditId: string
  totalMonthlySavings: number
}

export default function LeadCapture({ auditId, totalMonthlySavings }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [email,     setEmail]     = useState('')
  const [company,   setCompany]   = useState('')
  const [role,      setRole]      = useState('')
  const [teamSize,  setTeamSize]  = useState('')
  const [honeypot,  setHoneypot]  = useState('') // must stay empty

  const isHighValue = totalMonthlySavings > 500

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        companyName: company || undefined,
        role:        role    || undefined,
        teamSize:    teamSize ? Number(teamSize) : undefined,
        auditId,
        totalMonthlySavings,
        website: honeypot, // honeypot — backend drops if non-empty
      }),
    })

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/results/${auditId}`
      : `/results/${auditId}`

    return (
      <div className="card text-center space-y-4 animate-fade-up">
        <p className="text-3xl">🎉</p>
        <h3 className="text-zinc-100 font-bold text-lg">Your report is saved.</h3>
        <p className="text-zinc-400 text-sm">
          Shareable link:{' '}
          <a
            href={shareUrl}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors break-all"
          >
            {shareUrl}
          </a>
        </p>
        {isHighValue && (
          <p className="text-sm text-emerald-400 font-medium">
            A Credex specialist will be in touch about your savings opportunity.
          </p>
        )}
        <p className="text-zinc-500 text-xs">
          Check your inbox for a copy of your audit.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="card space-y-5 animate-fade-up"
    >
      {/* Honeypot — hidden from real users, bots fill it */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={e => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px' }}
        autoComplete="off"
      />

      <div className="space-y-1">
        <h3 className="text-zinc-100 font-bold text-lg">Save and share your report</h3>
        <p className="text-zinc-400 text-sm">
          Get a permanent link to your audit and a copy by email.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="lead-email" className="sr-only">Work email</label>
          <input
            id="lead-email"
            type="email"
            placeholder="Work email *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="lead-company" className="sr-only">Company name</label>
          <input
            id="lead-company"
            type="text"
            placeholder="Company name (optional)"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="lead-role" className="sr-only">Your role</label>
          <input
            id="lead-role"
            type="text"
            placeholder="Your role (optional)"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="lead-team-size" className="sr-only">Team size</label>
          <input
            id="lead-team-size"
            type="number"
            placeholder="Team size (optional)"
            value={teamSize}
            onChange={e => setTeamSize(e.target.value)}
            min={1}
            className="input-field"
          />
        </div>
      </div>

      <button
        type="submit"
        id="lead-submit-btn"
        disabled={loading || !email}
        className="cta-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Get my free report →'}
      </button>

      <p className="text-zinc-600 text-xs text-center">
        We&apos;ll never spam you. Unsubscribe anytime.
      </p>
    </form>
  )
}
