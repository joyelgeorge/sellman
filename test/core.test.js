import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowed } from '../src/guard/robots.js';
import { scoreAccount } from '../src/scoring/leadScore.js';
import { armsToPause, nextArm } from '../src/scoring/ucb.js';
import { cronMatches, parseCron } from '../src/scheduler/cron.js';
import { SCHEDULE } from '../src/scheduler/table.js';
import { diffCapabilities, tasksForEvents } from '../src/brain/diff.js';

test('robots: disallow, allow override, specific agent', () => {
  const txt = 'User-agent: *\nDisallow: /private\nAllow: /private/public\n\nUser-agent: badbot\nDisallow: /';
  assert.equal(isAllowed(txt, '/pricing'), true);
  assert.equal(isAllowed(txt, '/private/x'), false);
  assert.equal(isAllowed(txt, '/private/public/y'), true);
  assert.equal(isAllowed(txt, '/pricing', 'badbot'), false);
  assert.equal(isAllowed('', '/anything'), true);
});

test('lead score: fit gates, disqualifiers zero out', () => {
  const icp = { must_have: ['uses stripe billing', 'subscription pricing page'],
    observable_signals: [{ signal: 'billing complaints', weight: 0.6 }, { signal: 'subscription pricing page', weight: 0.4 }],
    reachable_via: ['stripe_marketplace'] };
  const full = scoreAccount({ evidence: [{ signal: 'uses stripe billing' }, { signal: 'subscription pricing page' }, { signal: 'billing complaints' }] }, icp, { reachabilityWeights: { stripe_marketplace: 1 } });
  const partial = scoreAccount({ evidence: [{ signal: 'billing complaints' }] }, icp, { reachabilityWeights: { stripe_marketplace: 1 } });
  const dq = scoreAccount({ evidence: full.why, disqualifiers: ['enterprise invoicing'] }, icp);
  assert.equal(full.score, 1);
  assert.equal(partial.score, 0);
  assert.equal(dq.score, 0);
});

test('ucb: pauses zero-conversion and dominated arms only after min exposures', () => {
  const arms = [
    { id: 'a', exposures: 400, conversions: 40 },
    { id: 'b', exposures: 400, conversions: 0 },
    { id: 'c', exposures: 400, conversions: 8 },
    { id: 'd', exposures: 20, conversions: 0 },
  ];
  const paused = armsToPause(arms, { minExposures: 100 }).map((p) => p.id).sort();
  assert.deepEqual(paused, ['b', 'c']);
  assert.equal(nextArm(arms).id, 'd'); // least explored arm gets the exploration bonus
});

test('cron: matching and parsing', () => {
  assert.equal(cronMatches('*/15 * * * *', new Date('2026-09-17T10:30:00Z')), true);
  assert.equal(cronMatches('*/15 * * * *', new Date('2026-09-17T10:31:00Z')), false);
  assert.equal(cronMatches('0 14 * * 1-5', new Date('2026-09-17T14:00:00Z')), true); // Thursday
  assert.equal(cronMatches('0 14 * * 1-5', new Date('2026-09-19T14:00:00Z')), false); // Saturday
  assert.equal(cronMatches('30 1 * * 1', new Date('2026-09-21T01:30:00Z')), true); // Monday
  assert.equal(cronMatches('0 0 * * 7', new Date('2026-09-20T00:00:00Z')), true); // Sunday as 7
  assert.throws(() => parseCron('61 * * * *'));
  assert.throws(() => parseCron('* * *'));
  for (const s of SCHEDULE) assert.doesNotThrow(() => parseCron(s.cron), s.worker);
});

test('brain diff → tasks', () => {
  const prev = [
    { key: 'a', status: 'beta', proof: { sample_accounts: 2, metrics: { r: 30 } } },
    { key: 'b', status: 'verified', proof: { sample_accounts: 8, metrics: { r: 40 } }, limits: ['x'] },
    { key: 'gone', status: 'verified' },
  ];
  const next = [
    { key: 'a', status: 'verified', proof: { sample_accounts: 6, metrics: { r: 35 } } },
    { key: 'b', status: 'verified', proof: { sample_accounts: 9, metrics: { r: 42 } }, limits: ['x', 'y'] },
    { key: 'new', status: 'building' },
  ];
  const events = diffCapabilities(prev, next);
  const types = events.map((e) => `${e.type}:${e.key}`);
  for (const t of ['status_changed:a', 'metric_changed:b', 'limits_changed:b', 'removed:gone', 'added:new']) assert.ok(types.includes(t), t);

  const tasks = tasksForEvents(events, new Map(next.map((c) => [c.key, c])));
  const ids = tasks.map((t) => `${t.kind}:${t.capability_key}`);
  for (const t of ['offer:a', 'listing:a', 'refresh_proof:b', 'refresh_limits:b', 'unpublish:gone', 'early_access_page:new']) assert.ok(ids.includes(t), t);
  assert.equal(tasks[0].kind, 'unpublish'); // safety tasks first
  assert.equal(ids.filter((i) => i === 'refresh_proof:b').length, 1); // deduplicated
});
