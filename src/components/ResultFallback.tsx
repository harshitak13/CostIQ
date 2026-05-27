'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SharedResultView from '@/components/SharedResultView'
import type { AuditResult } from '@/lib/auditEngine'
import {
  decodeShareReportPayload,
  shareReportStorageKey,
} from '@/lib/shareReportPayload'

type Props = {
  auditId: string
}

function readReportFromHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const report = params.get('report')
  return report ? decodeShareReportPayload(report) : null
}

function readReportFromStorage(auditId: string) {
  try {
    const stored = window.localStorage.getItem(shareReportStorageKey(auditId))
    return stored ? (JSON.parse(stored) as AuditResult) : null
  } catch {
    return null
  }
}

export default function ResultFallback({ auditId }: Props) {
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fromHash = readReportFromHash()
    const restored = fromHash ?? readReportFromStorage(auditId)

    if (restored) {
      try {
        window.localStorage.setItem(
          shareReportStorageKey(auditId),
          JSON.stringify(restored)
        )
      } catch {
        // Rendering the recovered report is enough if storage is unavailable.
      }
    }

    queueMicrotask(() => {
      setAudit(restored)
      setReady(true)
    })
  }, [auditId])

  if (!ready) {
    return (
      <div className="card text-center space-y-3">
        <p className="text-zinc-300 font-semibold">Loading audit report...</p>
        <p className="text-zinc-500 text-sm">Checking the saved link.</p>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="card text-center space-y-5">
        <p className="text-6xl font-black gradient-text">404</p>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-100">
            Audit not found
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            This audit link may have expired or the ID is invalid. Run a new
            audit to get a fresh report.
          </p>
        </div>
        <Link href="/" className="cta-btn inline-flex">
          Run a free audit -&gt;
        </Link>
      </div>
    )
  }

  const shareUrl = window.location.href

  return (
    <SharedResultView
      audit={audit}
      shareUrl={shareUrl}
      recoveredFromLink
    />
  )
}
