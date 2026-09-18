// Parses the small YAML subset used in agents/*.md and skills/*/SKILL.md frontmatter:
// `key: value`, `key: [a, b]`, numbers, booleans, and quoted/unquoted strings.

function parseScalar(raw) {
  const v = raw.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map((x) => parseScalar(x)) : [];
  }
  return v.replace(/^['"]|['"]$/g, '');
}

export function parseFrontmatter(text) {
  const m = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: String(text) };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = parseScalar(line.slice(idx + 1));
  }
  return { data, body: m[2] };
}

export function section(body, heading) {
  const re = new RegExp(`^##\\s+${heading}\\s*$`, 'im');
  const start = body.search(re);
  if (start === -1) return '';
  const rest = body.slice(start).replace(re, '');
  const next = rest.search(/^##\s+/m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}
