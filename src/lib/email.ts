// src/lib/email.ts — Resend email sending
// Using Resend free tier (100 emails/day)
// Docs: https://resend.com/docs/send-email

type ConfirmationEmailParams = {
  to: string
  totalMonthlySavings: number
  auditId: string
  isHighValue: boolean
}

export async function sendConfirmationEmail({
  to,
  totalMonthlySavings,
  auditId,
  isHighValue,
}: ConfirmationEmailParams): Promise<void> {
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results/${auditId}`

  const savingsText =
    totalMonthlySavings > 0
      ? `Your audit found $${totalMonthlySavings.toFixed(2)}/month ($${(totalMonthlySavings * 12).toFixed(2)}/year) in potential savings.`
      : `Your AI stack looks well-optimised — no significant overspend detected.`

  const credexText = isHighValue
    ? `<p style="margin-top:16px">Given the savings opportunity in your stack, a Credex specialist will be in touch. Credex sells discounted AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise, and others — that could capture these savings directly.</p>`
    : ''

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#1a1a2e;font-size:22px;margin-bottom:16px">Your Cost IQ audit is ready</h2>
      <p style="font-size:15px;line-height:1.6;color:#374151">${savingsText}</p>
      <p style="margin-top:20px">
        <a href="${shareUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
          View your full audit report →
        </a>
      </p>
      ${credexText}
      <p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px">
        Cost IQ by Credex ·
        <a href="https://credex.rocks" style="color:#6366f1;text-decoration:none">credex.rocks</a>
      </p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Cost IQ <onboarding@resend.dev>',
      to,
      subject:
        totalMonthlySavings > 0
          ? `Your Cost IQ audit: $${totalMonthlySavings.toFixed(2)}/mo savings found`
          : 'Your Cost IQ audit is ready',
      html,
    }),
  })

  if (!res.ok) {
    // Log but don't throw — email failure should not block lead save
    console.error('Resend error:', res.status, await res.text())
  }
}
