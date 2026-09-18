// Finds referral partners (CA firms, Tally partners, consultants) for the
// current wedge and queues a draft intro note for the operator to send
// personally. Never contacts anyone itself — see BRAINSTORM.md's rejected
// ideas: no AI persona reaching out on the operator's behalf.
import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { checkClaims } from '../guard/claims.js';
import { enqueue } from '../approvals/queue.js';
import { envInt } from '../lib/env.js';
import { log } from '../lib/log.js';

const logger = log('partner-channel');

export async function run() {
  const icps = (await q(`SELECT definition FROM icps WHERE status='active'`))
    .map((r) => r.definition)
    .filter((d) => (d.reachable_via ?? []).includes('partner'));
  if (!icps.length) { logger.info('no active ICP reachable via partner'); return { candidates: 0 }; }

  const known = await q(`SELECT domain FROM accounts WHERE source='partner-channel'`);
  const capabilities = await q('SELECT * FROM capabilities');
  const minSample = envInt('MIN_PROOF_SAMPLE', 5);

  const out = await runAgent('partner-manager', {
    icps,
    known_domains: known.map((r) => r.domain),
  }, { worker: 'partner-channel' });

  const knownIcpKeys = new Set(icps.map((i) => i.icp_key));
  let queued = 0;
  for (const candidate of out.candidates ?? []) {
    const guard = checkClaims({
      text: candidate.draft_note ?? '',
      claimsUsed: candidate.claims_used ?? [],
      numbersUsed: candidate.numbers_used ?? [],
      capabilities,
      minSample,
    });
    // The agent chooses icp_key from the ICPs it was given, but nothing stops it hallucinating one —
    // accounts.icp_key is a foreign key, so an unknown value would crash the whole batch, not just this row.
    const icpKey = knownIcpKeys.has(candidate.icp_key) ? candidate.icp_key : null;
    await q(
      `INSERT INTO accounts (domain, name, icp_key, evidence, score, source)
       VALUES ($1,$2,$3,$4,0,'partner-channel')
       ON CONFLICT (domain) DO UPDATE SET name=COALESCE(EXCLUDED.name, accounts.name), updated_at=now()`,
      [candidate.domain, candidate.name ?? null, icpKey, JSON.stringify(candidate.evidence ?? [])]);

    if (!guard.ok) { logger.warn('candidate rejected by claims guard', { domain: candidate.domain, violations: guard.violations }); continue; }
    await enqueue({
      kind: 'partner_outreach',
      summary: `Partner candidate: ${candidate.name} (${candidate.type ?? 'unknown type'}) — draft intro ready`,
      payload: { candidate, guard },
    });
    queued += 1;
  }
  logger.info('partner candidates found', { candidates: (out.candidates ?? []).length, queued });
  return { candidates: (out.candidates ?? []).length, queued };
}
