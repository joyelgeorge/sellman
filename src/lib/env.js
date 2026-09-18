import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Minimal .env loader (no dependency). Existing process.env values win.
export function loadEnv(path = resolve(process.cwd(), '.env')) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*(?:#.*)?$/i);
    if (!m) continue;
    const [, key, raw] = m;
    if (process.env[key] !== undefined) continue;
    process.env[key] = raw.replace(/^['"]|['"]$/g, '');
  }
}

export function env(name, fallback = undefined) {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

export function envBool(name, fallback = false) {
  const v = env(name);
  return v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

export function envInt(name, fallback) {
  const v = Number.parseInt(env(name, ''), 10);
  return Number.isNaN(v) ? fallback : v;
}
