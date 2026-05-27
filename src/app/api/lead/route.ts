// src/app/api/lead/route.ts — Save lead to DB with abuse protection

// Abuse protection strategy:
// 1. Honeypot field: if `website` field is populated, silently
//    drop the request (bots fill all visible + hidden fields)
// 2. In-memory rate limit: max 3 submissions per IP per hour.
//    Simple Map — resets on server restart, sufficient for MVP.
//    Production alternative: Upstash Redis with sliding window.

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabaseClient } from '@/lib/supabaseClient'
import { sendConfirmationEmail } from '@/lib/email'
import type { SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = getServiceSupabaseClient()
  }
  return _supabase
}

// ─── In-memory rate limiter ──────────────────────────────────────────────────

const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateLimitMap.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (hits.length >= RATE_LIMIT) return true
  rateLimitMap.set(ip, [...hits, now])
  return false
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

  // Rate limit check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  const body = await req.json()

  // Honeypot check — silently accept but don't save
  if (body.website) {
    return NextResponse.json({ ok: true })
  }

  const { email, companyName, role, teamSize, auditId, totalMonthlySavings, shareUrl } =
    body

  if (!email || !auditId) {
    return NextResponse.json(
      { error: 'email and auditId are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase.from('leads').insert({
        email,
        company_name: companyName ?? null,
        role: role ?? null,
        team_size: teamSize ?? null,
        audit_id: auditId,
        total_monthly_savings: totalMonthlySavings,
        is_high_value: totalMonthlySavings > 500,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Failed to save lead to Supabase:', error)
      }
    } else {
      console.warn('Supabase not configured. Skipping saving lead.')
    }

    // Send confirmation email (logs but does not throw on failure)
    try {
      await sendConfirmationEmail({
        to: email,
        totalMonthlySavings,
        auditId,
        shareUrl,
        isHighValue: totalMonthlySavings > 500,
      })
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/lead error:', err)
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    )
  }
}
