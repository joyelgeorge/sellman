import { test } from 'node:test';
import assert from 'node:assert/strict';
import { channelRows, icpRows, competitorRows } from '../src/db/seed.js';

test('channelRows carries reach_weight into config and defaults status', () => {
  const rows = channelRows([{ key: 'geo_content', type: 'content', reach_weight: 0.8, status: 'active' }]);
  assert.deepEqual(rows, [{ key: 'geo_content', type: 'content', status: 'active', config: { reach_weight: 0.8 } }]);
});

test('channelRows keeps daily_cap only when present', () => {
  const [withCap] = channelRows([{ key: 'outbound_email', type: 'outbound', reach_weight: 0.3, daily_cap: 30 }]);
  assert.deepEqual(withCap.config, { reach_weight: 0.3, daily_cap: 30 });
});

test('icpRows keys by icp_key and keeps the full definition', () => {
  const def = { icp_key: 'x', must_have: [] };
  assert.deepEqual(icpRows([def]), [{ key: 'x', definition: def }]);
});

test('competitorRows flattens categories and skips _note', () => {
  const rows = competitorRows({
    _note: 'ignore me',
    revenue_recovery: [{ name: 'Churnkey', url: 'https://churnkey.co' }],
  });
  assert.deepEqual(rows, [{ competitor: 'Churnkey', snapshot: { category: 'revenue_recovery', name: 'Churnkey', url: 'https://churnkey.co' } }]);
});
