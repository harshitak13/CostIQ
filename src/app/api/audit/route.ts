// src/app/api/audit/route.ts — Create audit, save to Supabase, return UUID + summary

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { generateAuditSummary } from '@/lib/anthropicSummary'
import type { AuditResult } from '@/lib/auditEngine'

let _supabase: SupabaseClient | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
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

    const { data, error } = await getSupabase()
      .from('audits')
      .insert(publicResult)
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      id: data.id,
      summary,
      result: resultWithSummary,
    })
  } catch (err) {
    console.error('POST /api/audit error:', err)
    return NextResponse.json(
      { error: 'Failed to save audit' },
      { status: 500 }
    )
  }
}
