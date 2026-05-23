# Tests — Cost IQ

Run all tests: `npm run test`

## Audit Engine — `src/tests/auditEngine.test.ts`

| # | Test | What it covers |
|---|------|---------------|
| 1 | returns zero savings for a user already on the cheapest plan | `already_optimal` path — no false positives when nothing to save |
| 2 | flags Business plan for a 2-person team as oversized | Check 1: seat-count guard catches team plans below `minSeats` |
| 3 | calculates monthly savings correctly when downgrade is available | Check 2: downgrade math — `(currentPrice − cheaperPrice) × seats` |
| 4 | annual savings is exactly monthly × 12 | Savings calculation integrity — `totalAnnualSavings = round2(monthly × 12)` |
| 5 | does not recommend a tool switch when savings are under $5/month | Check 3: noise suppression — switch friction threshold enforced |
| 6 | surfaces buy_via_credits when total savings exceed $200/month | Check 4: credits CTA triggers only when aggregate opportunity is meaningful |
| 7 | handles empty inputs without throwing | Edge case — `runAudit([], ...)` returns safely with zero savings |

## Running Tests

```bash
# Run all tests once
npm run test

# Watch mode (re-runs on file change)
npx vitest

# With coverage
npx vitest run --coverage
```

## Test Results (Day 2)

```
✓ src/tests/auditEngine.test.ts (7 tests) 7ms

Test Files  1 passed (1)
     Tests  7 passed (7)
  Duration  ~400ms
```
