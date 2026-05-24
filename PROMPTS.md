# Prompts — Cost IQ

## Audit Summary Prompt
Used in: `src/lib/anthropicSummary.ts`
Model: `claude-sonnet-4-20250514`
Max tokens: 200

### Full prompt

```
You are an AI spend analyst writing a personalised audit summary
for a startup. Be direct, specific, and practical.
Write exactly 1 paragraph of around 100 words.
Do not use bullet points. Do not use headers.
Do not mention Credex. Address the founder directly as "you".

Audit data:
- Team size: {teamSize}
- Primary use case: {useCase}
- Total potential monthly savings: ${totalMonthlySavings}
- Total potential annual savings: ${totalAnnualSavings}

Tool breakdown:
{toolLines — one line per tool with plan, seats, spend, recommendation}

Write the summary paragraph now:
```

### Variable interpolation

| Variable | Source |
|---|---|
| `{teamSize}` | `result.teamSize` |
| `{useCase}` | `result.useCase` — one of `coding`, `writing`, `data`, `research`, `mixed` |
| `{totalMonthlySavings}` | `result.totalMonthlySavings` |
| `{totalAnnualSavings}` | `result.totalAnnualSavings` |
| `{toolLines}` | One line per `result.inputs[]` entry, formatted as: `- {tool}: {plan} plan, {seats} seat(s), ${monthlySpend}/month. Recommendation: {recommendedAction} (saves ${estimatedSavings}/month)` |

### Why written this way

- **"Personalised" + "startup"** — frames the model as a spend analyst writing for a specific company, not generating generic advice.
- **"1 paragraph of around 100 words"** — prevents the model from generating excessive output. 100 words is enough for 3–4 sentences with concrete numbers.
- **"No bullet points, no headers"** — forces prose that reads naturally in a blockquote on the results page.
- **"Do not mention Credex"** — the Credex CTA is rendered separately in the UI; mentioning it in the AI summary would feel like an ad.
- **"Address the founder directly as you"** — makes the summary feel personal, not like a third-party report.
- **Tool breakdown with all data points** — gives the model enough context to make specific, actionable observations rather than vague generalities.

### What didn't work

- **Longer prompts (200+ words)** — produced summaries that were too verbose and repeated the input data verbatim instead of synthesising it.
- **Asking for "recommendations"** — caused the model to generate its own recommendations that conflicted with the audit engine's output. The prompt now only asks for a summary of the existing recommendations.
- **Not specifying word count** — resulted in wildly inconsistent output lengths, from 20 words to 300+.
- **Using "company" instead of "startup"** — produced more corporate-sounding language that didn't match the product's tone.
