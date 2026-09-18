import { SCHEDULE } from './table.js';
import { parseCron, cronMatches } from './cron.js';
import { runWorker } from '../workers/index.js';
import { log } from '../lib/log.js';

const logger = log('daemon');

export async function daemon() {
  const jobs = SCHEDULE.map((s) => ({ ...s, parsed: parseCron(s.cron) }));
  logger.info('scheduler started', { jobs: jobs.length });
  let lastMinute = null;

  const tick = async () => {
    const now = new Date();
    const minute = `${now.getUTCHours()}:${now.getUTCMinutes()}`;
    if (minute === lastMinute) return;
    lastMinute = minute;
    for (const job of jobs) {
      if (!cronMatches(job.parsed, now)) continue;
      runWorker(job.worker)
        .then((res) => logger.info('worker finished', { worker: job.worker, res }))
        .catch((err) => logger.error('worker failed', { worker: job.worker, error: err.message }));
    }
  };

  await tick();
  setInterval(tick, 20_000);
}
