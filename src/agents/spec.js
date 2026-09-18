import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseFrontmatter, section } from '../lib/frontmatter.js';

const AGENTS_DIR = resolve(process.cwd(), 'agents');
const SKILLS_DIR = resolve(process.cwd(), 'skills');

export function listAgents() {
  return readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md').map((f) => f.replace(/\.md$/, ''));
}

export function loadSkill(name) {
  const { body } = parseFrontmatter(readFileSync(resolve(SKILLS_DIR, name, 'SKILL.md'), 'utf8'));
  return body.trim();
}

export function loadAgent(name) {
  const raw = readFileSync(resolve(AGENTS_DIR, `${name}.md`), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const systemPrompt = section(body, 'System prompt') || body.trim();
  return {
    name: data.name ?? name,
    skills: data.skills ?? [],
    tier: data.tier ?? 'fast',
    budgetUsdMonth: data.budget_usd_month ?? 10,
    requiredKeys: data.required_keys ?? [],
    approval: data.approval ?? 'none',
    webSearch: data.web_search === true,
    systemPrompt,
  };
}

export function buildSystemPrompt(spec) {
  const playbooks = spec.skills.map((s) => `--- skill: ${s} ---\n${loadSkill(s)}`).join('\n\n');
  return [
    spec.systemPrompt,
    playbooks ? `# Playbooks you must follow\n\n${playbooks}` : '',
    'Respond with a single JSON object and nothing else. No prose, no code fences.',
  ].filter(Boolean).join('\n\n');
}
