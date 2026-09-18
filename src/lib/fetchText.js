import { isAllowed } from '../guard/robots.js';
import { env } from './env.js';

const robotsCache = new Map();

export function htmlToText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Fetch a public URL only if robots.txt allows it. Returns null when disallowed or failed. */
export async function politeFetchText(url, { maxChars = 20000, timeoutMs = 15000 } = {}) {
  const ua = env('SELLMAN_USER_AGENT', 'SellmanBot/0.1');
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    try {
      const r = await fetch(`${u.origin}/robots.txt`, { headers: { 'user-agent': ua }, signal: AbortSignal.timeout(timeoutMs) });
      robotsCache.set(u.origin, r.ok ? await r.text() : '');
    } catch { robotsCache.set(u.origin, ''); }
  }
  if (!isAllowed(robotsCache.get(u.origin), u.pathname + u.search, ua.split('/')[0])) return null;
  try {
    const res = await fetch(url, { headers: { 'user-agent': ua }, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const text = type.includes('html') ? htmlToText(raw) : raw;
    return text.slice(0, maxChars);
  } catch { return null; }
}
