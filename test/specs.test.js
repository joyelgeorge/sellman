import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintSpecs } from '../src/agents/lint.js';
import { loadAgent, listAgents, buildSystemPrompt } from '../src/agents/spec.js';
import { parseFrontmatter, section } from '../src/lib/frontmatter.js';
import { extractJson } from '../src/lib/json.js';

test('all agent specs and skills lint clean', () => {
  const problems = lintSpecs();
  assert.deepEqual(problems, []);
});

test('agents load with playbooks attached', () => {
  const names = listAgents();
  assert.ok(names.includes('strategist'));
  const spec = loadAgent('offer-architect');
  assert.equal(spec.tier, 'deep');
  assert.equal(spec.approval, 'always');
  assert.ok(spec.skills.includes('offer-design'));
  const prompt = buildSystemPrompt(spec);
  assert.match(prompt, /skill: outcome-pricing/);
  assert.match(prompt, /single JSON object/);
});

test('every agent that drafts public copy carries the claims skill', () => {
  for (const name of ['offer-architect', 'content-strategist', 'listing-manager', 'outbound-writer', 'community-listener', 'lifecycle-writer', 'partner-manager']) {
    assert.ok(loadAgent(name).skills.includes('claims-and-compliance'), `${name} missing claims-and-compliance`);
  }
});

test('frontmatter parsing handles lists, numbers, booleans', () => {
  const { data, body } = parseFrontmatter('---\nname: x\nskills: [a, b]\nbudget_usd_month: 12\nweb_search: true\n---\n## System prompt\nhello\n\n## Other\nignored');
  assert.deepEqual(data, { name: 'x', skills: ['a', 'b'], budget_usd_month: 12, web_search: true });
  assert.equal(section(body, 'System prompt'), 'hello');
});

test('extractJson tolerates fences and preamble', () => {
  assert.deepEqual(extractJson('Sure!\n```json\n{"a":1}\n```'), { a: 1 });
  assert.throws(() => extractJson('no json here'));
});
