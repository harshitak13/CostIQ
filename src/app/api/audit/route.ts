// src/app/api/audit/route.ts — Create audit, save to Supabase, return UUID + summary

import { NextRequest, NextResponse } from 'next/server'
import { generateAuditSummary } from '@/lib/anthropicSummary'
import { getServiceSupabaseClient } from '@/lib/supabaseClient'
import type { AuditResult } from '@/lib/auditEngine'
import type { SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

let _supabase: SupabaseClient | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = getServiceSupabaseClient()
  }
  return _supabase
}

export async function POST(req: NextRequest) {
  try {
    const result: AuditResult = await req.json()

    // Generate AI summary (with fallback built in)
    const summary = await generateAuditSummary(result)
    const resultWithSummary = { ...result, summary }

    // Save to Supabase — strip any email/PII before saving
    // to the public audits table
    const publicResult = {
      inputs: result.inputs,
      team_size: result.teamSize,
      use_case: result.useCase,
      recommendations: result.recommendations,
      total_monthly_savings: result.totalMonthlySavings,
      total_annual_savings: result.totalAnnualSavings,
      summary,
      created_at: new Date().toISOString(),
    }

    const supabase = getSupabase()
    if (!supabase) {
      console.warn('Supabase not configured. Returning a self-contained share link fallback.')
      return NextResponse.json({
        id: randomUUID(),
        summary,
        result: resultWithSummary,
        persisted: false,
      })
    }

    const { data, error } = await supabase
      .from('audits')
      .insert(publicResult)
      .select('id')
      .single()

    if (error || !data?.id) {
      console.error('Failed to insert audit into Supabase:', error)
      return NextResponse.json({
        id: randomUUID(),
        summary,
        result: resultWithSummary,
        persisted: false,
      })
    }

    return NextResponse.json({
      id: data.id,
      summary,
      result: resultWithSummary,
      persisted: true,
    })
  } catch (err) {
    console.error('POST /api/audit error:', err)
    return NextResponse.json(
      { error: 'Failed to save audit' },
      { status: 500 }
    )
  }
}
