'use client'

import { useState, useEffect, useCallback } from 'react'
import { runAudit } from '@/lib/auditEngine'
import { PRICING } from '@/lib/pricingData'
import type { ToolInput, AuditResult } from '@/lib/auditEngine'

type Props = {
  onAuditComplete: (result: AuditResult) => void
}

type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed'

type FormState = {
  tools: ToolInput[]
  teamSize: number
  useCase: UseCase
}

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  github_copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  anthropic_api: 'Anthropic API',
  openai_api: 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
}

const ALL_TOOLS = Object.keys(TOOL_LABELS) as Array<keyof typeof PRICING>

const USE_CASE_LABELS: Record<UseCase, string> = {
  coding: '💻 Coding',
  writing: '✍️ Writing',
  data: '📊 Data / Analytics',
  research: '🔬 Research',
  mixed: '🌐 Mixed / General',
}

const STORAGE_KEY = 'costiq_form_state'

const DEFAULT_FORM: FormState = {
  tools: [{ tool: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 }],
  teamSize: 1,
  useCase: 'coding',
}

export default function SpendForm({ onAuditComplete }: Props) {
  const [formState, setFormState] = useState<FormState>(() => {
    // Lazy initializer: restore from localStorage on first render
    if (typeof window === 'undefined') return DEFAULT_FORM
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored) as FormState
    } catch {
      // ignore malformed storage
    }
    return DEFAULT_FORM
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState))
    } catch {
      // ignore quota errors
    }
  }, [formState])

  const updateTool = useCallback(
    (idx: number, field: keyof ToolInput, value: string | number) => {
      setFormState(prev => {
        const tools = [...prev.tools]
        // When tool changes, reset plan to first available
        if (field === 'tool') {
          const newTool = value as keyof typeof PRICING
          const firstPlan = PRICING[newTool]?.plans[0]?.planId ?? ''
          tools[idx] = { ...tools[idx], tool: newTool, plan: firstPlan }
        } else {
          tools[idx] = { ...tools[idx], [field]: value }
        }
        return { ...prev, tools }
      })
    },
    []
  )

  const addTool = () => {
    setFormState(prev => ({
      ...prev,
      tools: [
        ...prev.tools,
        { tool: 'chatgpt', plan: 'plus', monthlySpend: 20, seats: 1 },
      ],
    }))
  }

  const removeTool = (idx: number) => {
    setFormState(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== idx),
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (formState.teamSize < 1) newErrors.teamSize = 'Team size must be at least 1'
    formState.tools.forEach((t, i) => {
      if (t.seats < 1) newErrors[`seats_${i}`] = 'Must be at least 1'
      if (t.monthlySpend < 0) newErrors[`spend_${i}`] = 'Cannot be negative'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitted(true)
    const result = runAudit(formState.tools, formState.teamSize, formState.useCase)
    onAuditComplete(result)
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('audit-results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6"
      aria-label="AI Spend Audit Form"
    >
      {/* ── Global fields ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="teamSize" className="text-sm font-medium text-zinc-300">
            Team size
          </label>
          <input
            id="teamSize"
            type="number"
            min={1}
            value={formState.teamSize}
            onChange={e =>
              setFormState(prev => ({ ...prev, teamSize: Number(e.target.value) }))
            }
            className={`input-field ${errors.teamSize ? 'border-red-500' : ''}`}
          />
          {errors.teamSize && (
            <span className="text-xs text-red-400">{errors.teamSize}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="useCase" className="text-sm font-medium text-zinc-300">
            Primary use case
          </label>
          <select
            id="useCase"
            value={formState.useCase}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                useCase: e.target.value as UseCase,
              }))
            }
            className="input-field"
          >
            {(Object.keys(USE_CASE_LABELS) as UseCase[]).map(uc => (
              <option key={uc} value={uc}>
                {USE_CASE_LABELS[uc]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tool rows ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
            AI Tools
          </h2>
          <span className="text-xs text-zinc-500">
            {formState.tools.length} tool{formState.tools.length !== 1 ? 's' : ''} added
          </span>
        </div>

        {formState.tools.map((toolInput, idx) => {
          const toolPlans = PRICING[toolInput.tool]?.plans ?? []
          return (
            <div
              key={idx}
              className="relative rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-4 space-y-3 transition-all hover:border-zinc-600/80"
            >
              {/* Remove button */}
              {formState.tools.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTool(idx)}
                  aria-label={`Remove ${TOOL_LABELS[toolInput.tool]}`}
                  className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tool selector */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`tool_${idx}`}
                    className="text-xs font-medium text-zinc-400"
                  >
                    Tool
                  </label>
                  <select
                    id={`tool_${idx}`}
                    value={toolInput.tool}
                    onChange={e => updateTool(idx, 'tool', e.target.value)}
                    className="input-field text-sm"
                  >
                    {ALL_TOOLS.map(t => (
                      <option key={t} value={t}>
                        {TOOL_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plan selector */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`plan_${idx}`}
                    className="text-xs font-medium text-zinc-400"
                  >
                    Current plan
                  </label>
                  <select
                    id={`plan_${idx}`}
                    value={toolInput.plan}
                    onChange={e => updateTool(idx, 'plan', e.target.value)}
                    className="input-field text-sm"
                  >
                    {toolPlans.map(p => (
                      <option key={p.planId} value={p.planId}>
                        {p.label}
                        {p.isEnterprise
                          ? ' (Custom)'
                          : p.pricePerSeatPerMonth === 0
                          ? ' (Free)'
                          : ` ($${p.pricePerSeatPerMonth}/seat/mo)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monthly spend */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`spend_${idx}`}
                    className="text-xs font-medium text-zinc-400"
                  >
                    Monthly spend ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">
                      $
                    </span>
                    <input
                      id={`spend_${idx}`}
                      type="number"
                      min={0}
                      step={0.01}
                      value={toolInput.monthlySpend}
                      onChange={e =>
                        updateTool(idx, 'monthlySpend', Number(e.target.value))
                      }
                      className={`input-field pl-7 text-sm ${
                        errors[`spend_${idx}`] ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors[`spend_${idx}`] && (
                    <span className="text-xs text-red-400">
                      {errors[`spend_${idx}`]}
                    </span>
                  )}
                </div>

                {/* Seat count */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`seats_${idx}`}
                    className="text-xs font-medium text-zinc-400"
                  >
                    Seats / licences
                  </label>
                  <input
                    id={`seats_${idx}`}
                    type="number"
                    min={1}
                    value={toolInput.seats}
                    onChange={e =>
                      updateTool(idx, 'seats', Number(e.target.value))
                    }
                    className={`input-field text-sm ${
                      errors[`seats_${idx}`] ? 'border-red-500' : ''
                    }`}
                  />
                  {errors[`seats_${idx}`] && (
                    <span className="text-xs text-red-400">
                      {errors[`seats_${idx}`]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Add tool */}
        <button
          type="button"
          onClick={addTool}
          className="w-full rounded-xl border border-dashed border-zinc-600 py-3 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-400 transition-all flex items-center justify-center gap-2"
          aria-label="Add another AI tool"
        >
          <span className="text-lg leading-none">+</span> Add another tool
        </button>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        id="run-audit-btn"
        disabled={submitted && false}
        className="cta-btn w-full"
      >
        {submitted ? 'Re-run Audit →' : 'Run my audit →'}
      </button>
    </form>
  )
}
