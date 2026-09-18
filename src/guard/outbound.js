// Outbound guard: deterministic eligibility, caps, and deliverability kill switch.

export function jurisdictionMode(jurisdiction, compliance) {
  const j = (jurisdiction || 'unknown').toUpperCase();
  return compliance.jurisdictions?.[j]?.mode ?? compliance.default_mode ?? 'consent_required';
}

export function normaliseEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function isSuppressed(email, suppression) {
  const e = normaliseEmail(email);
  const domain = e.split('@')[1];
  return suppression.has(e) || Boolean(domain && suppression.has(`@${domain}`));
}

/**
 * @returns {{ok:boolean, reasons:string[]}}
 */
export function checkSend({
  contact,
  account,
  compliance,
  suppression = new Set(),
  sentToday = 0,
  dailyCap = 30,
  channelStatus = 'active',
  now = new Date(),
}) {
  const reasons = [];
  if (channelStatus !== 'active') reasons.push('CHANNEL_NOT_ACTIVE');
  if (sentToday >= dailyCap) reasons.push('DAILY_CAP_REACHED');
  if (!contact?.email) reasons.push('NO_EMAIL');
  if (contact?.email && isSuppressed(contact.email, suppression)) reasons.push('SUPPRESSED');

  const mode = jurisdictionMode(contact?.jurisdiction ?? account?.jurisdiction, compliance);
  if (mode === 'blocked') reasons.push('JURISDICTION_BLOCKED');
  if (mode === 'consent_required' && !contact?.consent_ref) reasons.push('CONSENT_REQUIRED');
  if (!contact?.lawful_basis) reasons.push('NO_LAWFUL_BASIS_RECORDED');

  const evidence = account?.evidence ?? [];
  if (!Array.isArray(evidence) || evidence.length === 0) reasons.push('NO_PUBLIC_EVIDENCE');

  const cooldownDays = compliance.cooldown_days ?? 90;
  if (account?.last_touched_at) {
    const days = (now - new Date(account.last_touched_at)) / 86_400_000;
    if (days < cooldownDays) reasons.push('COOLDOWN');
  }
  if (account?.disqualified) reasons.push('DISQUALIFIED');

  return { ok: reasons.length === 0, reasons };
}

/**
 * Deliverability state over a trailing window.
 * @returns {'ok'|'alarm'|'pause'|'insufficient_data'}
 */
export function deliverabilityState({ sent, bounced, complaints }, thresholds = {}) {
  const t = {
    min_sent: 50,
    bounce_alarm: 0.015,
    bounce_pause: 0.02,
    complaint_alarm: 0.001,
    complaint_pause: 0.002,
    ...thresholds,
  };
  if (!sent || sent < t.min_sent) {
    // With little data, one complaint in a tiny batch is still a stop signal.
    if (sent > 0 && complaints > 0) return 'pause';
    return 'insufficient_data';
  }
  const bounceRate = bounced / sent;
  const complaintRate = complaints / sent;
  if (bounceRate > t.bounce_pause || complaintRate > t.complaint_pause) return 'pause';
  if (bounceRate > t.bounce_alarm || complaintRate > t.complaint_alarm) return 'alarm';
  return 'ok';
}

export function complianceFooter({ senderName, postalAddress, unsubscribeUrl }) {
  if (!senderName || !postalAddress || !unsubscribeUrl) {
    throw new Error('Footer requires senderName, postalAddress, and unsubscribeUrl');
  }
  return `\n\n—\n${senderName} · ${postalAddress}\nDon't want these? Unsubscribe in one click: ${unsubscribeUrl}`;
}

export function listUnsubscribeHeaders(unsubscribeUrl, mailto) {
  const parts = [`<${unsubscribeUrl}>`];
  if (mailto) parts.push(`<mailto:${mailto}?subject=unsubscribe>`);
  return {
    'List-Unsubscribe': parts.join(', '),
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}
