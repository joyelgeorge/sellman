// The one HTTP surface Sellman exposes: funnel events, one-click unsubscribe,
// and deliverability webhooks. Everything else (agents, workers, approvals)
// runs off the CLI/scheduler — this server exists only because those three
// things need something on the public internet to POST or GET to. Thin by
// design: parsing/validation lives in this folder's pure modules; this file
// only wires HTTP to them and to `q`.
import { createServer as createHttpServer } from 'node:http';
import { q } from '../db/pool.js';
import { env, envInt } from '../lib/env.js';
import { validateEvent, eventRow } from './events.js';
import { verifyUnsubscribeToken } from './tokens.js';
import { parseDeliverabilityEvent, deliverabilityIncrement } from './webhooks.js';
import { log } from '../lib/log.js';

const logger = log('web');

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function send(res, status, body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'content-type': typeof body === 'string' ? 'text/plain' : 'application/json' });
  res.end(text);
}

async function handleEvents(req, res) {
  let body;
  try { body = await readJson(req); } catch { return send(res, 400, { error: 'INVALID_JSON' }); }
  const { ok, reasons } = validateEvent(body);
  if (!ok) return send(res, 422, { error: 'INVALID_EVENT', reasons });
  await q(
    `INSERT INTO events (type, account_id, anon_id, channel_key, arm_id, utm, data) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    eventRow(body));
  send(res, 202, { ok: true });
}

async function handleUnsubscribe(req, res, token) {
  const email = verifyUnsubscribeToken(token, env('SELLMAN_UNSUBSCRIBE_SECRET'));
  if (!email) return send(res, 400, 'That unsubscribe link is invalid or expired.');
  await q(
    `INSERT INTO suppression (value, reason) VALUES ($1,'unsubscribe') ON CONFLICT (value) DO NOTHING`,
    [email.toLowerCase()]);
  send(res, 200, "You're unsubscribed. You won't get any more email from us at this address.");
}

async function handleWebhook(req, res, kind) {
  let body;
  try { body = await readJson(req); } catch { return send(res, 400, { error: 'INVALID_JSON' }); }
  const { ok, reasons } = parseDeliverabilityEvent(body, kind);
  if (!ok) return send(res, 422, { error: 'INVALID_WEBHOOK', reasons });
  const inc = deliverabilityIncrement(body, kind);
  await q(
    `INSERT INTO deliverability_daily (day, channel_key, sender, sent, bounced, complaints)
     VALUES (current_date, $1, $2, 0, $3, $4)
     ON CONFLICT (day, channel_key, sender) DO UPDATE SET
       bounced = deliverability_daily.bounced + EXCLUDED.bounced,
       complaints = deliverability_daily.complaints + EXCLUDED.complaints`,
    [body.channel_key, inc.sender, inc.bounced, inc.complaints]);
  if (kind === 'bounce') {
    await q(`INSERT INTO suppression (value, reason) VALUES ($1,'bounce') ON CONFLICT (value) DO NOTHING`, [body.email.toLowerCase()]);
  } else {
    await q(`INSERT INTO suppression (value, reason) VALUES ($1,'complaint') ON CONFLICT (value) DO NOTHING`, [body.email.toLowerCase()]);
  }
  send(res, 202, { ok: true });
}

export function createServer() {
  return createHttpServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'POST' && url.pathname === '/events') return await handleEvents(req, res);
      if (req.method === 'GET' && url.pathname.startsWith('/u/')) return await handleUnsubscribe(req, res, url.pathname.slice(3));
      if (req.method === 'POST' && url.pathname === '/webhooks/bounce') return await handleWebhook(req, res, 'bounce');
      if (req.method === 'POST' && url.pathname === '/webhooks/complaint') return await handleWebhook(req, res, 'complaint');
      if (req.method === 'GET' && url.pathname === '/healthz') return send(res, 200, { ok: true });
      send(res, 404, { error: 'NOT_FOUND' });
    } catch (err) {
      logger.error('request failed', { path: req.url, error: err.message });
      send(res, 500, { error: 'INTERNAL' });
    }
  });
}

export function serve() {
  const port = envInt('PORT', 8787);
  const server = createServer();
  server.listen(port, () => logger.info('listening', { port }));
  return server;
}
