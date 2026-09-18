import { createHash } from 'node:crypto';
import { complete, webSearchTools } from '../ai/router.js';
import { loadAgent, buildSystemPrompt } from './spec.js';
import { q } from '../db/pool.js';

export class AgentPaused extends Error {}

async function monthCost(agent) {
  const rows = await q(
    `SELECT COALESCE(SUM(cost_usd), 0) AS spent FROM ai_calls
      WHERE agent = $1 AND created_at >= date_trunc('month', now())`, [agent]);
  return Number(rows[0]?.spent ?? 0);
}

/**
 * Runs an agent: budget check → model call → JSON validation → agent_runs row.
 * Agents never touch the database or the outside world; workers act on the returned object.
 */
export async function runAgent(name, input, { worker = null } = {}) {
  const spec = loadAgent(name);

  const state = await q('SELECT status, paused_reason FROM agent_state WHERE agent = $1', [name]);
  if (state[0]?.status === 'paused') throw new AgentPaused(`${name} is paused: ${state[0].paused_reason}`);

  const spent = await monthCost(name);
  if (spent >= spec.budgetUsdMonth) {
    await q(`INSERT INTO agent_state (agent, status, paused_reason) VALUES ($1,'paused',$2)
             ON CONFLICT (agent) DO UPDATE SET status='paused', paused_reason=EXCLUDED.paused_reason, updated_at=now()`,
    [name, `monthly budget ${spec.budgetUsdMonth} USD reached`]);
    throw new AgentPaused(`${name} hit its monthly budget (${spent.toFixed(2)}/${spec.budgetUsdMonth} USD)`);
  }

  const payload = JSON.stringify(input);
  const digest = createHash('sha256').update(`${name}:${payload}`).digest('hex').slice(0, 16);
  const started = new Date();
  const onCall = (row) => q(
    `INSERT INTO ai_calls (agent, provider, model, ok, tokens_in, tokens_out, cost_usd, latency_ms, error)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [row.agent, row.provider, row.model, row.ok, row.tokens_in, row.tokens_out, row.cost_usd, row.latency_ms, row.error ?? null]);

  try {
    const res = await complete({
      tier: spec.tier,
      system: buildSystemPrompt(spec),
      messages: [{ role: 'user', content: payload }],
      json: true,
      tools: spec.webSearch ? webSearchTools() : undefined,
      agent: name,
      onCall,
    });
    const missing = spec.requiredKeys.filter((k) => !(k in (res.data ?? {})));
    const status = missing.length ? 'invalid_output' : 'ok';
    await q(`INSERT INTO agent_runs (agent, worker, status, input_digest, output, error, cost_usd, started_at, finished_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())`,
      [name, worker, status, digest, res.data ?? null, missing.length ? `missing keys: ${missing.join(',')}` : null, res.cost_usd, started]);
    if (missing.length) throw new Error(`${name} returned JSON missing keys: ${missing.join(', ')}`);
    return { ...res.data, _meta: { agent: name, model: `${res.provider}:${res.model}`, cost_usd: res.cost_usd, approval: spec.approval } };
  } catch (err) {
    if (!(err instanceof AgentPaused)) {
      await q(`INSERT INTO agent_runs (agent, worker, status, input_digest, error, started_at, finished_at)
               VALUES ($1,$2,'error',$3,$4,$5, now())`, [name, worker, digest, String(err.message).slice(0, 500), started]);
    }
    throw err;
  }
}
