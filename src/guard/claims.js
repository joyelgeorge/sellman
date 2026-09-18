// Claims guard: the only path from a draft to anything customer-facing.
// Pure function — no I/O — so it's cheap to test and impossible to bypass by prompt.

export const STATUS = Object.freeze({
  PLANNED: 'planned',
  BUILDING: 'building',
  BETA: 'beta',
  VERIFIED: 'verified',
  DEPRECATED: 'deprecated',
});

export const DEFAULT_BANNED_PHRASES = [
  '100%', 'risk-free', 'risk free', 'never fails', 'no risk', '#1', 'best in class',
  'guaranteed', 'guarantee', 'instant results', 'trusted by',
];

// Phrases that are fine only if the offer defines a structural guarantee (e.g. pay-on-outcome).
const GUARANTEE_PHRASES = new Set(['guaranteed', 'guarantee', 'risk-free', 'risk free', 'no risk']);

export const EARLY_ACCESS_PHRASES = ['early access', 'beta', 'not yet live', 'not live yet', 'coming soon'];

const NUMBER_PATTERN =
  /(?:[$₹€£]\s?\d[\d,]*(?:\.\d+)?\s?(?:k|m|lakh|crore)?)|(?:\d[\d,]*(?:\.\d+)?\s?(?:%|x\b|×|usd\b|inr\b|rs\.?\b))/gi;

export function extractNumericClaims(text) {
  const out = [];
  for (const m of text.matchAll(NUMBER_PATTERN)) {
    const raw = m[0].trim();
    const digits = raw.replace(/[^\d.]/g, '');
    const value = Number.parseFloat(digits);
    if (!Number.isNaN(value)) out.push({ raw, value });
  }
  return out;
}

function includesAny(haystack, needles) {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

/**
 * @param {object} p
 * @param {string} p.text                       full customer-facing text
 * @param {string[]} p.claimsUsed                capability keys the draft relies on
 * @param {{value:number, metric_key:string}[]} p.numbersUsed
 * @param {object[]} p.capabilities              rows mirrored from the Taskman brain
 * @param {object|null} p.offer                  offer with optional guarantee_defined flag
 * @param {number} p.minSample                   minimum sample_accounts for numeric claims
 * @param {string[]} p.bannedPhrases
 * @param {number} p.tolerance                   allowed absolute rounding difference
 */
export function checkClaims({
  text,
  claimsUsed = [],
  numbersUsed = [],
  capabilities = [],
  offer = null,
  minSample = 5,
  bannedPhrases = DEFAULT_BANNED_PHRASES,
  tolerance = 0.05,
}) {
  const violations = [];
  const add = (code, message) => violations.push({ code, message });
  const byKey = new Map(capabilities.map((c) => [c.key, c]));
  const lower = (text || '').toLowerCase();
  const hasEarlyAccessNotice = includesAny(lower, EARLY_ACCESS_PHRASES);

  // 1. Every declared capability must exist and be sellable at the implied level.
  const claimed = [];
  for (const key of claimsUsed) {
    const cap = byKey.get(key);
    if (!cap) { add('UNKNOWN_CAPABILITY', `Capability "${key}" is not in the brain manifest.`); continue; }
    claimed.push(cap);
    switch (cap.status) {
      case STATUS.PLANNED:
        add('PLANNED_CAPABILITY', `"${key}" is planned and cannot be mentioned publicly.`); break;
      case STATUS.DEPRECATED:
        add('DEPRECATED_CAPABILITY', `"${key}" is deprecated and must be removed.`); break;
      case STATUS.BUILDING:
      case STATUS.BETA:
        if (!hasEarlyAccessNotice) add('MISSING_EARLY_ACCESS_NOTICE', `"${key}" is ${cap.status}; copy must say it is early access / not live.`);
        break;
      default: break;
    }
  }

  // 2. Undeclared mentions: capability names that appear in the text but weren't declared.
  for (const cap of capabilities) {
    if (!cap.name || claimsUsed.includes(cap.key)) continue;
    if (lower.includes(cap.name.toLowerCase())) add('UNDECLARED_CLAIM', `Text mentions "${cap.name}" but claims_used omits "${cap.key}".`);
  }

  // 3. Numbers: every numeric claim in the text must be declared and backed by verified proof.
  const found = extractNumericClaims(text || '');
  for (const f of found) {
    const declared = numbersUsed.some((n) => Math.abs(Number(n.value) - f.value) <= Math.max(tolerance, 1e-9));
    if (!declared) add('UNDECLARED_NUMBER', `"${f.raw}" appears in text but is not listed in numbers_used.`);
  }
  for (const n of numbersUsed) {
    const backing = claimed.find((c) => c.proof?.metrics && n.metric_key in c.proof.metrics);
    if (!backing) { add('UNBACKED_NUMBER', `No claimed capability has metric "${n.metric_key}".`); continue; }
    if (backing.status !== STATUS.VERIFIED) {
      add('NUMBER_ON_UNVERIFIED', `"${backing.key}" is ${backing.status}; numbers are only allowed for verified capabilities.`);
      continue;
    }
    const sample = Number(backing.proof.sample_accounts ?? 0);
    if (sample < minSample) add('INSUFFICIENT_SAMPLE', `"${backing.key}" proof has ${sample} accounts; minimum is ${minSample}.`);
    const proofValue = Number(backing.proof.metrics[n.metric_key]);
    if (Number(n.value) > proofValue + tolerance) add('EXCEEDS_PROOF', `${n.value} exceeds proof ${n.metric_key}=${proofValue}.`);
  }

  // 4. Banned phrases (report only the longest match, so "guaranteed" doesn't also report "guarantee").
  const matched = bannedPhrases.filter((p) => lower.includes(p.toLowerCase()));
  for (const phrase of matched) {
    const p = phrase.toLowerCase();
    if (matched.some((other) => other.toLowerCase() !== p && other.toLowerCase().includes(p))) continue;
    if (GUARANTEE_PHRASES.has(p) && offer?.guarantee_defined === true) continue;
    add('BANNED_PHRASE', `"${phrase}" needs an enforceable basis defined in the offer.`);
  }

  return { ok: violations.length === 0, violations };
}
