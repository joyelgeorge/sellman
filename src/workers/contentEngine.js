import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { checkClaims } from '../guard/claims.js';
import { enqueue } from '../approvals/queue.js';
import { envInt } from '../lib/env.js';
import { log } from '../lib/log.js';

const logger = log('content-engine');

export async function run({ maxPieces = 3 } = {}) {
  const capabilities = await q('SELECT * FROM capabilities');
  const minSample = envInt('MIN_PROOF_SAMPLE', 5);

  // Unpublish first — safety tasks jump the queue.
  const unpublish = await q(`SELECT id, capability_key FROM tasks WHERE kind='unpublish' AND status='open'`);
  for (const t of unpublish) {
    const rows = await q(
      `UPDATE content SET status='unpublished', updated_at=now()
        WHERE status IN ('published','approved','pending_approval') AND claims_used @> $1::jsonb RETURNING id`,
      [JSON.stringify([t.capability_key])]);
    await q(`UPDATE tasks SET status='done', result=$2, updated_at=now() WHERE id=$1`, [t.id, { unpublished: rows.length }]);
    logger.info('unpublished content', { capability: t.capability_key, count: rows.length });
  }

  const tasks = await q(
    `SELECT id, kind, capability_key, reason FROM tasks
      WHERE kind IN ('content','listing','early_access_page','notify_interested') AND status='open'
      ORDER BY priority, created_at LIMIT 5`);

  const offers = await q(`SELECT capability_key, body FROM offers WHERE status='approved'`);
  const published = await q(`SELECT slug FROM content WHERE slug IS NOT NULL`);
  const voc = await q(`SELECT body FROM insights WHERE kind IN ('voc_phrase','community_question') ORDER BY created_at DESC LIMIT 40`);

  const agentName = tasks.some((t) => t.kind === 'listing') ? 'listing-manager' : 'content-strategist';
  const out = await runAgent(agentName, {
    tasks,
    capabilities,
    approved_offers: offers.map((o) => ({ capability_key: o.capability_key, ...o.body })),
    existing_slugs: published.map((p) => p.slug),
    voice_of_customer: voc.map((v) => v.body),
    max_pieces: maxPieces,
  }, { worker: 'content-engine' });

  const pieces = out.pieces ?? out.listings ?? [];
  let approved = 0;
  for (const piece of pieces.slice(0, maxPieces)) {
    const body = piece.body_markdown ?? piece.description_markdown ?? '';
    const guard = checkClaims({
      text: [piece.title, piece.tagline, piece.name, body].filter(Boolean).join('\n'),
      claimsUsed: piece.claims_used ?? out.claims_used ?? [],
      numbersUsed: piece.numbers_used ?? out.numbers_used ?? [],
      capabilities,
      minSample,
    });
    const status = guard.ok ? 'pending_approval' : 'rejected_by_guard';
    const rows = await q(
      `INSERT INTO content (kind, slug, market, title, body, meta, claims_used, numbers_used, guard_result, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [piece.kind ?? (piece.marketplace ? 'listing' : 'page'), piece.slug ?? null, piece.market ?? 'global',
        piece.title ?? piece.name ?? null, body, piece, JSON.stringify(piece.claims_used ?? out.claims_used ?? []),
        JSON.stringify(piece.numbers_used ?? out.numbers_used ?? []), guard, status]);
    if (guard.ok) {
      approved += 1;
      await enqueue({ kind: 'content', refTable: 'content', refId: rows[0].id,
        summary: `${piece.kind ?? 'listing'}: ${piece.title ?? piece.name}`, payload: { preview: body.slice(0, 1200) } });
    } else {
      logger.warn('content rejected by claims guard', { title: piece.title ?? piece.name, violations: guard.violations });
    }
  }
  for (const t of tasks) await q(`UPDATE tasks SET status='done', updated_at=now() WHERE id=$1`, [t.id]);
  logger.info('drafted', { pieces: pieces.length, queued_for_approval: approved });
  return { drafted: pieces.length, queued_for_approval: approved };
}
