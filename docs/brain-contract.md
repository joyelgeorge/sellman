# Brain contract — how Sellman reads Taskman

Sellman never writes to Taskman except through the demand-signal endpoint. Everything else is read-only.

## 1. Manifest (read)

`GET {TASKMAN_BRAIN_URL}/brain/manifest` with `Authorization: Bearer {TASKMAN_BRAIN_TOKEN}`
(or a JSON file via `TASKMAN_BRAIN_FILE` during bootstrap).

```json
{
  "generated_at": "2026-09-17T08:00:00Z",
  "capabilities": [
    {
      "key": "stripe.failed_payment_recovery",
      "name": "Failed payment recovery for Stripe",
      "status": "verified",
      "wedge": "revenue_recovery",
      "summary": "Detects failed invoices and runs decline-code-aware recovery.",
      "integrations": ["stripe"],
      "pricing_hint": { "model": "percent_of_verified", "percent": 15 },
      "limits": ["Stripe Billing only", "No PayPal"],
      "proof": {
        "sample_accounts": 7,
        "period_days": 60,
        "metrics": {
          "recovery_rate_pct": 41.2,
          "median_monthly_recovered_usd": 380
        }
      }
    }
  ],
  "customers": [
    { "account_ref": "acct_hash_1", "source_ref": "sellman:acct:42", "verified_fee_cents": 5700, "currency": "USD", "period": "2026-09" }
  ]
}
```

### Status meanings (enforced by `src/guard/claims.js`)

| Status | Sellman may… |
|---|---|
| `planned` | not mention it anywhere customer-facing |
| `building` | show an early-access signup page clearly saying it is not live |
| `beta` | mention it as "early access", no numbers or outcome promises |
| `verified` | sell it; numeric claims only ≤ proof metrics and only when `sample_accounts ≥ MIN_PROOF_SAMPLE` |
| `deprecated` | remove from listings and pages within 24h (brain-sync opens tasks) |

### Customer attribution

`customers[].source_ref` is the Sellman account id Taskman received at signup (via `?ref=` / install metadata).
`verified_fee_cents` is what Taskman actually charged — this is the North Star input.
Account refs must be hashed/pseudonymous; Sellman doesn't need customer PII from Taskman.

## 2. Demand signals (write)

`POST {TASKMAN_BRAIN_URL}/brain/signals`

```json
{
  "signals": [
    { "kind": "audit_leak_found", "leak_type": "expired_card_cohort", "value_usd": 1240, "segment": "saas_10k_50k_mrr" },
    { "kind": "early_access_signup", "capability_key": "razorpay.mandate_dropoff", "count": 14 },
    { "kind": "lost_install_reason", "reason": "needs_paddle_support", "count": 3 }
  ]
}
```

Taskman's DISCOVER side process can rank what to build next by these signals.
