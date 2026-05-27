import type { AuditResult } from './auditEngine'

type ShareReportPayload = {
  version: 1
  audit: AuditResult
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')

  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeShareReportPayload(audit: AuditResult) {
  return toBase64Url(JSON.stringify({ version: 1, audit }))
}

export function decodeShareReportPayload(value: string): AuditResult | null {
  try {
    const payload = JSON.parse(fromBase64Url(value)) as Partial<ShareReportPayload>

    if (payload.version !== 1 || !payload.audit) {
      return null
    }

    return payload.audit
  } catch {
    return null
  }
}

export function shareReportStorageKey(auditId: string) {
  return `costiq:report:${auditId}`
}
