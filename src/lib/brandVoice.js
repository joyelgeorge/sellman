import { q } from '../db/pool.js';

/** The latest approved voice guide, or null if brand-strategist hasn't run yet or nothing's approved. */
export async function latestBrandVoice() {
  const rows = await q(
    `SELECT body FROM content WHERE kind='brand_voice_guide' AND status='approved' ORDER BY updated_at DESC, id DESC LIMIT 1`);
  return rows[0]?.body ?? null;
}
