# Sellman architecture

## Departments → agents → workers

Sellman is organised like a small marketing & sales org. Each "department" is a set of agents (LLM judgment)
and workers (deterministic code). Workers own schedules, state, and side effects; agents only return
structured JSON that workers validate, guard, and store.

| Department | Agent (LLM) | Worker (code) | Schedule | Output | Needs approval |
|---|---|---|---|---|---|
| Brain liaison | — | `brain-sync` | hourly | capabilities, diffs → tasks | no |
| Market research | `market-researcher` | `market-research` | weekly Tue | insights, ICP updates | ICP changes |
| Competitive intel | `competitor-analyst` | `competitor-watch` | weekly Wed | price/positioning changes | no |
| Prospecting | `signal-scout` | `signal-scout` | daily 06:00 | scored accounts | no |
| Offer & pricing | `offer-architect` | `offer-architect` | on brain diff + weekly | offers, price experiments | yes |
| Content & GEO | `content-strategist` | `content-engine` | Mon/Thu | pages, answer objects, listings | yes |
| Marketplaces | `listing-manager` | `content-engine` (kind=listing) | on offer change | listing copy | yes |
| Community | `community-listener` | `community-listener` | daily 09:00 | reply drafts | yes, every post |
| Outbound | `outbound-writer` | `outbound-batch` | weekdays 10:00 | ≤ cap emails | first send per campaign |
| Conversion | `lifecycle-writer` | `lifecycle` | hourly | opted-in nudges | template only |
| Analytics | — | `attribution` | nightly 01:00 | channel → revenue table | no |
| Experiments | — | `experiments` | nightly 02:00 | arm scores, auto-pause | no |
| Strategy | `strategist` | `strategist` | weekly Mon 07:00 | ≤ 3 bets, report | yes |
| Partner channel | `partner-manager` | `partner-channel` | weekly Fri 08:00 | candidate partners, one draft intro note each | yes, always |
| Reporting | — | `founder-digest` | weekly Mon 08:30 | one-screen digest: revenue, top channel, pending approvals | no |
| Safety | — | `kill-switch` | every 15 min | pauses, alerts | no |

## Flow of truth

```
Taskman brain ──(read-only)──▶ brain-sync ──▶ capabilities table
                                   │
                                   └─ diff events ─▶ tasks (offer-architect, content-engine, listing)
agents ─▶ JSON ─▶ schema check ─▶ claims guard ─▶ approvals queue ─▶ publish / send
                                    ▲
                        capabilities.status + proof metrics
```

The claims guard is the only path to anything customer-facing. It rejects:
- any mention of a capability in `planned` status
- numbers or outcome claims for `beta` capabilities, and beta mentions missing "early access" framing
- numeric claims for `verified` capabilities that exceed the proof metric or have too small a sample
- banned phrases (e.g. "guaranteed", "risk-free") unless the offer defines that guarantee

## Data model (Postgres)

See `migrations/001_init.sql`. Core tables:

- `capabilities` — mirror of Taskman's manifest (key, status, proof metrics, sample size)
- `brain_events` — capability diffs (added, status_changed, metric_changed, removed)
- `icps`, `accounts`, `contacts`, `suppression`
- `offers`, `content`, `approvals`
- `channels`, `experiments`, `arms`, `touches`
- `events` — funnel events (visit, calculator_used, audit_started, audit_completed, install, paid, churned)
- `revenue` — verified fees from Taskman per account (joined for attribution)
- `agent_runs`, `ai_calls` — every run and its cost
- `deliverability_daily`, `insights`, `decisions`, `tasks`

## AI routing

`src/ai/router.js` is provider-agnostic with ordered fallback (same principle as Taskman). Every call records
provider, model, tokens, latency, and estimated cost in `ai_calls`. If Taskman's router is published as a
shared package, replace this file with an import — the interface is `complete({system, messages, json, tools})`.

## Why agents return JSON only

Agents never send, publish, or write to the DB. That keeps side effects in deterministic code where they can
be capped, tested, retried, and audited — and makes swapping models safe.

## Web surface

`node src/index.js serve` (`src/web/server.js`) is the one HTTP surface Sellman exposes — plain
`node:http`, no framework, because it's three small routes:

- `POST /events` — the audit/landing surface posts funnel events (`visit`, `audit_completed`, `install`, …)
- `GET /u/:token` — one-click unsubscribe; `:token` is HMAC-signed (`src/web/tokens.js`) so a stranger can't
  suppress an email they don't own by guessing a URL
- `POST /webhooks/bounce`, `POST /webhooks/complaint` — feed `deliverability_daily` so `kill-switch` isn't
  blind; body is the generic `{email, channel_key, sender}` shape (`src/web/webhooks.js`). A real mail
  provider's webhook payload (Resend's, once an account exists) needs a small adapter mapped in front of
  this — don't guess that schema ahead of an account to verify it against.

All three routes only validate + write; the guard/approval logic they need already lives in `src/guard` and
`src/approvals` and is exercised the same way workers are.

## Deployment options

1. **GitHub Actions schedules** (default, free for private repos within minutes quota): `.github/workflows/cron.yml`
   runs `node src/index.js run <worker>`.
2. **Single long-running process**: `node src/index.js daemon` using `src/scheduler` (Railway/Fly/VPS).

Both read the same cron table in `src/scheduler/table.js`.
