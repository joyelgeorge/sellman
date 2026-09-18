import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from '../lib/env.js';

/** Reads Taskman's capability manifest. File mode is for bootstrapping before the endpoint exists. */
export async function fetchManifest() {
  const file = env('TASKMAN_BRAIN_FILE');
  if (file) return JSON.parse(readFileSync(resolve(process.cwd(), file), 'utf8'));

  const base = env('TASKMAN_BRAIN_URL');
  if (!base) throw new Error('Set TASKMAN_BRAIN_URL or TASKMAN_BRAIN_FILE');
  const res = await fetch(`${base.replace(/\/$/, '')}/brain/manifest`, {
    headers: { authorization: `Bearer ${env('TASKMAN_BRAIN_TOKEN', '')}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`brain manifest ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

/** Pushes demand signals back to Taskman's DISCOVER side process. */
export async function pushSignals(signals) {
  const base = env('TASKMAN_BRAIN_URL');
  if (!base || env('TASKMAN_BRAIN_FILE')) return { skipped: true };
  const res = await fetch(`${base.replace(/\/$/, '')}/brain/signals`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env('TASKMAN_BRAIN_TOKEN', '')}`, 'content-type': 'application/json' },
    body: JSON.stringify({ signals }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`brain signals ${res.status}`);
  return { sent: signals.length };
}
