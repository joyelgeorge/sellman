import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseFrontmatter } from '../lib/frontmatter.js';
import { listAgents, loadAgent } from './spec.js';

const SKILLS_DIR = resolve(process.cwd(), 'skills');

/** Structural checks that run in CI: specs parse, skills exist, frontmatter is complete. */
export function lintSpecs() {
  const problems = [];

  for (const dir of readdirSync(SKILLS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const path = resolve(SKILLS_DIR, dir.name, 'SKILL.md');
    if (!existsSync(path)) { problems.push(`skills/${dir.name}: missing SKILL.md`); continue; }
    const { data, body } = parseFrontmatter(readFileSync(path, 'utf8'));
    if (data.name !== dir.name) problems.push(`skills/${dir.name}: frontmatter name "${data.name}" != folder name`);
    if (!data.description) problems.push(`skills/${dir.name}: missing description`);
    else if (String(data.description).length < 60) problems.push(`skills/${dir.name}: description too short to trigger reliably`);
    if (body.trim().length < 200) problems.push(`skills/${dir.name}: body is nearly empty`);
  }

  for (const name of listAgents()) {
    let spec;
    try { spec = loadAgent(name); } catch (err) { problems.push(`agents/${name}: ${err.message}`); continue; }
    if (spec.name !== name) problems.push(`agents/${name}: frontmatter name "${spec.name}" != file name`);
    if (!spec.systemPrompt || spec.systemPrompt.length < 100) problems.push(`agents/${name}: system prompt missing or too short`);
    if (!spec.requiredKeys.length) problems.push(`agents/${name}: required_keys is empty — output can't be validated`);
    if (!['none', 'first', 'always'].includes(spec.approval)) problems.push(`agents/${name}: approval must be none|first|always`);
    if (!['fast', 'deep'].includes(spec.tier)) problems.push(`agents/${name}: tier must be fast|deep`);
    for (const skill of spec.skills) {
      if (!existsSync(resolve(SKILLS_DIR, skill, 'SKILL.md'))) problems.push(`agents/${name}: references missing skill "${skill}"`);
    }
  }
  return problems;
}
