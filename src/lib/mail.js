import { env } from './env.js';

/** Transport: 'log' prints instead of sending (default); 'resend' uses the Resend HTTP API. */
export async function sendMail({ to, subject, text, headers = {} }) {
  const transport = env('SELLMAN_MAIL_TRANSPORT', 'log');
  const from = `${env('SELLMAN_SENDER_NAME', 'Sellman')} <${env('SELLMAN_SENDER_EMAIL', 'noreply@example.com')}>`;
  if (transport === 'log') {
    console.log(JSON.stringify({ mail: { from, to, subject, text, headers } }));
    return { id: `log-${Date.now()}`, transport };
  }
  if (transport === 'resend') {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env('RESEND_API_KEY')}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, headers }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return { ...(await res.json()), transport };
  }
  throw new Error(`Unknown mail transport ${transport}`);
}
