// Provider-agnostic AI routing with ordered fallback and per-call cost logging.
// Same principle as Taskman's router — swap this file for a shared package if one exists.

import { env } from '../lib/env.js';
import { readConfig } from '../lib/config.js';
import { extractJson } from '../lib/json.js';

function modelList(tier) {
  const raw = tier === 'deep'
    ? env('SELLMAN_MODELS_DEEP', 'anthropic:claude-sonnet-5')
    : env('SELLMAN_MODELS_FAST', 'anthropic:claude-haiku-4-5-20251001');
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function estimateCost(ref, tokensIn, tokensOut) {
  const price = readConfig('costs.json').models?.[ref];
  if (!price) return 0;
  return Number(((tokensIn / 1e6) * price.in + (tokensOut / 1e6) * price.out).toFixed(5));
}

async function callAnthropic(model, { system, messages, maxTokens, tools }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env('ANTHROPIC_API_KEY', ''),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages, ...(tools ? { tools } : {}) }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const text = (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return { text, tokensIn: data.usage?.input_tokens ?? 0, tokensOut: data.usage?.output_tokens ?? 0 };
}

async function callOpenAICompatible(model, { system, messages, maxTokens, json }) {
  const base = env('OPENAI_COMPAT_BASE_URL');
  if (!base) throw new Error('OPENAI_COMPAT_BASE_URL not set');
  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env('OPENAI_COMPAT_API_KEY', '')}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`openai_compat ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? '',
    tokensIn: data.usage?.prompt_tokens ?? 0,
    tokensOut: data.usage?.completion_tokens ?? 0,
  };
}

export function webSearchTools() {
  return [{ type: env('SELLMAN_WEB_SEARCH_TOOL', 'web_search_20250305'), name: 'web_search', max_uses: 6 }];
}

/**
 * @param {object} p
 * @param {'fast'|'deep'} p.tier
 * @param {string} p.system
 * @param {{role:string, content:string}[]} p.messages
 * @param {boolean} p.json     parse the reply as JSON
 * @param {object[]} [p.tools] provider-side tools (Anthropic only)
 * @param {string} [p.agent]   for cost attribution
 * @param {(row:object)=>Promise<void>} [p.onCall] logger hook (workers pass a DB writer)
 */
export async function complete({ tier = 'fast', system, messages, json = true, tools, maxTokens = 4000, agent = null, onCall }) {
  const errors = [];
  for (const ref of modelList(tier)) {
    const [provider, ...rest] = ref.split(':');
    const model = rest.join(':');
    const started = Date.now();
    try {
      const out = provider === 'anthropic'
        ? await callAnthropic(model, { system, messages, maxTokens, tools })
        : await callOpenAICompatible(model, { system, messages, maxTokens, json });
      const cost = estimateCost(ref, out.tokensIn, out.tokensOut);
      await onCall?.({ agent, provider, model, ok: true, tokens_in: out.tokensIn, tokens_out: out.tokensOut, cost_usd: cost, latency_ms: Date.now() - started });
      return { text: out.text, data: json ? extractJson(out.text) : null, provider, model, cost_usd: cost };
    } catch (err) {
      errors.push(`${ref}: ${err.message}`);
      await onCall?.({ agent, provider, model, ok: false, tokens_in: 0, tokens_out: 0, cost_usd: 0, latency_ms: Date.now() - started, error: err.message });
    }
  }
  throw new Error(`All models failed — ${errors.join(' | ')}`);
}
