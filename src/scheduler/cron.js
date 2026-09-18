// Tiny 5-field cron matcher (minute hour day-of-month month day-of-week), evaluated in UTC.
// Supports: *  */n  a  a-b  a-b/n  lists with commas. Day-of-week 0 or 7 = Sunday.

const RANGES = [
  [0, 59], // minute
  [0, 23], // hour
  [1, 31], // day of month
  [1, 12], // month
  [0, 7],  // day of week
];

function expandField(field, [min, max]) {
  const values = new Set();
  for (const part of field.split(',')) {
    const [rangePart, stepPart] = part.split('/');
    const step = stepPart ? Number.parseInt(stepPart, 10) : 1;
    if (!Number.isInteger(step) || step < 1) throw new Error(`Bad step in "${field}"`);
    let lo; let hi;
    if (rangePart === '*') { lo = min; hi = max; }
    else if (rangePart.includes('-')) { [lo, hi] = rangePart.split('-').map((x) => Number.parseInt(x, 10)); }
    else { lo = Number.parseInt(rangePart, 10); hi = stepPart ? max : lo; }
    if ([lo, hi].some((v) => !Number.isInteger(v) || v < min || v > max) || lo > hi) {
      throw new Error(`Out of range value in "${field}"`);
    }
    for (let v = lo; v <= hi; v += step) values.add(v);
  }
  return values;
}

export function parseCron(expr) {
  const fields = String(expr).trim().split(/\s+/);
  if (fields.length !== 5) throw new Error(`Cron needs 5 fields: "${expr}"`);
  const sets = fields.map((f, i) => expandField(f, RANGES[i]));
  if (sets[4].has(7)) sets[4].add(0);
  return { expr, sets, domStar: fields[2] === '*', dowStar: fields[4] === '*' };
}

export function cronMatches(exprOrParsed, date) {
  const p = typeof exprOrParsed === 'string' ? parseCron(exprOrParsed) : exprOrParsed;
  const [min, hour, dom, mon, dow] = p.sets;
  if (!min.has(date.getUTCMinutes()) || !hour.has(date.getUTCHours()) || !mon.has(date.getUTCMonth() + 1)) return false;
  const domOk = dom.has(date.getUTCDate());
  const dowOk = dow.has(date.getUTCDay());
  // Classic cron semantics: if both restricted, either may match.
  if (p.domStar && p.dowStar) return true;
  if (p.domStar) return dowOk;
  if (p.dowStar) return domOk;
  return domOk || dowOk;
}
