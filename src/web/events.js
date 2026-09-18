// Validates a funnel event POSTed by the audit/landing surface before it is
// written to `events`. Pure — no I/O — matches the guard modules' shape.
export const EVENT_TYPES = [
  'visit', 'calculator_used', 'audit_started', 'audit_completed', 'install',
  'paid', 'churned', 'early_access_signup', 'lost_install_reason',
];

/** @returns {{ok:boolean, reasons:string[]}} */
export function validateEvent(body) {
  const reasons = [];
  if (!body || typeof body !== 'object') return { ok: false, reasons: ['NOT_AN_OBJECT'] };
  if (!EVENT_TYPES.includes(body.type)) reasons.push('UNKNOWN_TYPE');
  if (!body.account_id && !body.anon_id) reasons.push('MISSING_IDENTITY');
  if (body.utm !== undefined && (typeof body.utm !== 'object' || Array.isArray(body.utm))) reasons.push('INVALID_UTM');
  if (body.data !== undefined && (typeof body.data !== 'object' || Array.isArray(body.data))) reasons.push('INVALID_DATA');
  return { ok: reasons.length === 0, reasons };
}

/** Row values in the exact column order the INSERT uses, once validated. */
export function eventRow(body) {
  return [
    body.type,
    body.account_id ?? null,
    body.anon_id ?? null,
    body.channel_key ?? null,
    body.arm_id ?? null,
    JSON.stringify(body.utm ?? {}),
    JSON.stringify(body.data ?? {}),
  ];
}
