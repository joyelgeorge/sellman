// The one worker whose agent is judged on voice and resonance rather than
// correctness (see agents/brand-strategist.md). Runs monthly — voice doesn't
// need weekly revision — and its approved output is read by content-engine,
// outbound-batch, and community-listener as `brand_voice` context.
import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { checkClaims } from '../guard/claims.js';
import { enqueue } from '../approvals/queue.js';
import { latestBrandVoice } from '../lib/brandVoice.js';
import { log } from '../lib/log.js';

const logger = log('brand-strategist');

export async function run() {
  const capabilities = await q('SELECT * FROM capabilities');
  const voc = await q(
    `SELECT body FROM insights WHERE kind IN ('voc_phrase','community_question') ORDER BY created_at DESC LIMIT 40`);
  const recentContent = await q(
    `SELECT kind, title, body FROM content WHERE status IN ('approved','published') ORDER BY updated_at DESC LIMIT 20`);
  const currentGuide = await latestBrandVoice();

  const out = await runAgent('brand-strategist', {
    voice_of_customer: voc.map((v) => v.body),
    recent_content: recentContent,
    current_guide: currentGuide,
  }, { worker: 'brand-strategist' });

  const guard = checkClaims({
    text: [out.voice_guide, ...(out.tone_rules ?? []), ...(out.do_not ?? [])].filter(Boolean).join('\n'),
    claimsUsed: [],
    numbersUsed: [],
    capabilities,
  });
  const status = guard.ok ? 'pending_approval' : 'rejected_by_guard';
  const rows = await q(
    `INSERT INTO content (kind, title, body, meta, guard_result, status)
     VALUES ('brand_voice_guide','Sellman voice guide',$1,$2,$3,$4) RETURNING id`,
    [out.voice_guide, { tone_rules: out.tone_rules, do_not: out.do_not, evidence: out.evidence }, guard, status]);

  if (guard.ok) {
    await enqueue({ kind: 'content', refTable: 'content', refId: rows[0].id,
      summary: 'Brand voice guide — revised, review before other agents pick it up',
      payload: { preview: String(out.voice_guide ?? '').slice(0, 1200) } });
    logger.info('voice guide drafted', { id: rows[0].id });
    return { drafted: true, queued_for_approval: true };
  }
  logger.warn('voice guide rejected by claims guard', { violations: guard.violations });
  return { drafted: true, queued_for_approval: false };
}
