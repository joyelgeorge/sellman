import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { checkClaims } from '../guard/claims.js';
import { politeFetchText } from '../lib/fetchText.js';
import { enqueue } from '../approvals/queue.js';
import { readConfig } from '../lib/config.js';
import { latestBrandVoice } from '../lib/brandVoice.js';
import { log } from '../lib/log.js';

const logger = log('community-listener');

export async function run() {
  const sources = (readConfig('sources.json').community ?? []).filter((s) => s.enabled);
  if (!sources.length) { logger.info('no enabled community sources'); return { drafts: 0 }; }

  const threads = [];
  for (const s of sources) {
    const text = await politeFetchText(s.url, { maxChars: 15000 });
    if (text) threads.push({ community: s.name, url: s.url, rules: s.rules, text });
  }
  if (!threads.length) return { drafts: 0 };

  const capabilities = await q('SELECT * FROM capabilities');
  const brand_voice = await latestBrandVoice();
  const out = await runAgent('community-listener', { threads, capabilities, brand_voice }, { worker: 'community-listener' });

  for (const question of out.questions_seen ?? []) {
    await q(`INSERT INTO insights (source, kind, body) VALUES ('community-listener','community_question',$1)`, [JSON.stringify(question)]);
  }

  let drafts = 0;
  for (const reply of out.replies ?? []) {
    const guard = checkClaims({ text: reply.reply_markdown, claimsUsed: reply.claims_used ?? [], capabilities });
    const status = guard.ok ? 'pending_approval' : 'rejected_by_guard';
    const rows = await q(
      `INSERT INTO content (kind, title, body, meta, claims_used, guard_result, status)
       VALUES ('community_reply',$1,$2,$3,$4,$5,$6) RETURNING id`,
      [reply.thread_url, reply.reply_markdown, reply, JSON.stringify(reply.claims_used ?? []), guard, status]);
    if (guard.ok) {
      drafts += 1;
      await enqueue({ kind: 'content', refTable: 'content', refId: rows[0].id,
        summary: `Community reply draft for ${reply.thread_url} (${reply.community})`,
        payload: { reply: reply.reply_markdown, includes_link: reply.includes_link === true } });
    }
  }
  logger.info('drafted', { drafts, questions: (out.questions_seen ?? []).length });
  return { drafts };
}
