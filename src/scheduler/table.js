// The single source of truth for when workers run. Times are UTC (IST = UTC+5:30).
export const SCHEDULE = [
  { worker: 'kill-switch',        cron: '*/15 * * * *', note: 'deliverability, agent budgets, error rates' },
  { worker: 'brain-sync',         cron: '5 * * * *',    note: 'read Taskman manifest, diff, open tasks, push demand signals' },
  { worker: 'lifecycle',          cron: '20 * * * *',   note: 'event-triggered messages to opted-in users' },
  { worker: 'signal-scout',       cron: '30 0 * * *',   note: '06:00 IST — fetch allowed public sources, score accounts' },
  { worker: 'attribution',        cron: '30 19 * * *',  note: '01:00 IST — join funnel events with verified revenue' },
  { worker: 'experiments',        cron: '30 20 * * *',  note: '02:00 IST — arm stats, auto-pause dominated arms' },
  { worker: 'community-listener', cron: '30 3 * * *',   note: '09:00 IST — draft replies for approval' },
  { worker: 'outbound-batch',     cron: '0 14 * * 1-5', note: '10:00 US Eastern (EDT) — capped, gated sends' },
  { worker: 'offer-architect',    cron: '45 */6 * * *', note: 'handles offer tasks opened by brain diffs' },
  { worker: 'content-engine',     cron: '30 4 * * 1,4', note: 'Mon/Thu 10:00 IST — pages, listings, answer objects' },
  { worker: 'strategist',         cron: '30 1 * * 1',   note: 'Mon 07:00 IST — weekly review, ≤3 bets' },
  { worker: 'market-research',    cron: '30 2 * * 2',   note: 'Tue 08:00 IST — segments, ICP updates' },
  { worker: 'competitor-watch',   cron: '30 2 * * 3',   note: 'Wed 08:00 IST — pricing & platform moves' },
  { worker: 'partner-channel',    cron: '30 2 * * 5',   note: 'Fri 08:00 IST — find referral partners, draft one intro note each' },
  { worker: 'founder-digest',     cron: '0 3 * * 1',    note: 'Mon 08:30 IST — one-screen report: revenue, top channel, pending approvals' },
  { worker: 'brand-strategist',   cron: '0 3 1 * *',    note: '1st of month, 08:30 IST — revise the voice guide content/outbound/community read' },
];
