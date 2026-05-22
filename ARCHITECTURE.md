# Architecture — Cost IQ

## System Diagram
```mermaid
graph TD
  A[User] --> B[Cost IQ Spend Form]
  B --> C[Audit Engine]
  C --> D[Anthropic API — summary]
  C --> E[Results Page]
  E --> F[Lead Capture]
  F --> G[Supabase]
  F --> H[Resend — confirmation email]
  E --> I[Shareable URL /results/:id]
```

## Data Flow
[Fill in: how a user's input becomes an audit result]

## Stack Choice
[Fill in: why Next.js, Tailwind, Supabase, etc.]

## Scaling to 10k audits/day
[Fill in]
