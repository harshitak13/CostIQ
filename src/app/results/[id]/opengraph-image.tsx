import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'Cost IQ Audit Result'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let monthly = 0
  let annual = 0

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await supabase
      .from('audits')
      .select('total_monthly_savings, total_annual_savings, summary')
      .eq('id', id)
      .single()

    monthly = data?.total_monthly_savings ?? 0
    annual  = data?.total_annual_savings  ?? 0
  } catch {
    // If Supabase is not configured, render a fallback OG image
  }
  const hasSavings = monthly > 0

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* App name */}
        <p style={{ color: '#888', fontSize: 24, margin: '0 0 24px' }}>
          Cost IQ — AI Spend Audit
        </p>

        {/* Savings headline */}
        <h1
          style={{
            color: hasSavings ? '#34d399' : '#f5f5f5',
            fontSize: 80,
            fontWeight: 700,
            margin: '0 0 16px',
            lineHeight: 1,
          }}
        >
          {hasSavings
            ? `$${monthly.toFixed(2)}/mo savings found`
            : 'AI stack looks optimised'}
        </h1>

        {/* Annual line */}
        {hasSavings && (
          <p style={{ color: '#aaa', fontSize: 32, margin: '0 0 48px' }}>
            ${annual.toFixed(2)} per year
          </p>
        )}

        {/* CTA */}
        <p style={{ color: '#666', fontSize: 24, margin: 0 }}>
          costiq.app — free AI spend audit for startups
        </p>
      </div>
    ),
    { ...size }
  )
}
