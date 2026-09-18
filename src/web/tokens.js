// One-click unsubscribe tokens: HMAC-signed so a stranger can't suppress an
// email they don't own by guessing a URL. Pure and dependency-free so it's
// cheap to test without a server.
import { createHmac, timingSafeEqual } from 'node:crypto';

function sign(email, secret) {
  return createHmac('sha256', secret).update(email.toLowerCase()).digest('base64url');
}

export function signUnsubscribeToken(email, secret) {
  if (!secret) throw new Error('unsubscribe secret is required');
  const e = Buffer.from(email.toLowerCase(), 'utf8').toString('base64url');
  return `${e}.${sign(email, secret)}`;
}

/** @returns {string|null} the email if the token is well-formed and the signature matches, else null */
export function verifyUnsubscribeToken(token, secret) {
  if (!secret || typeof token !== 'string' || !token.includes('.')) return null;
  const [e, sig] = token.split('.');
  let email;
  try { email = Buffer.from(e, 'base64url').toString('utf8'); } catch { return null; }
  const expected = sign(email, secret);
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return email;
}
