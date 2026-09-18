// Normalises a deliverability webhook body into the shape the deliverability_daily
// upsert needs. Providers differ in their exact payload; this accepts the
// generic shape { email, channel_key, sender } and is the single seam a
// provider-specific adapter (e.g. Resend's actual webhook schema, which needs
// a real account to verify against — see .env.example SELLMAN_MAIL_TRANSPORT)
// maps into before calling the handler. Don't guess a provider's schema here;
// map it once real webhook deliveries can be inspected.
export function parseDeliverabilityEvent(body, kind) {
  const reasons = [];
  if (!body || typeof body !== 'object') return { ok: false, reasons: ['NOT_AN_OBJECT'] };
  if (!['bounce', 'complaint'].includes(kind)) reasons.push('UNKNOWN_KIND');
  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) reasons.push('MISSING_EMAIL');
  if (!body.channel_key) reasons.push('MISSING_CHANNEL_KEY');
  return { ok: reasons.length === 0, reasons };
}

export function deliverabilityIncrement(body, kind) {
  const sender = body.sender ?? 'unknown';
  return {
    sender,
    bounced: kind === 'bounce' ? 1 : 0,
    complaints: kind === 'complaint' ? 1 : 0,
  };
}
