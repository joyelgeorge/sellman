#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { loadEnv } from './lib/env.js';
loadEnv();

const [, , command, ...args] = process.argv;

const HELP = `sellman — the sales department for Taskman

  node src/index.js migrate                 apply database migrations
  node src/index.js seed                    load config/*.json into channels, icps, competitor watchlist
  node src/index.js serve                   run the HTTP surface (events, unsubscribe, deliverability webhooks)
  node src/index.js schedule                print the cron table
  node src/index.js run <worker> [--json]   run one worker now
  node src/index.js daemon                  run the in-process scheduler
  node src/index.js approvals               list items waiting for a decision
  node src/index.js show <id>               show one approval in full
  node src/index.js approve <id> [note]     approve it
  node src/index.js reject <id> [note]      reject it
  node src/index.js agents                  list agents, tiers, budgets
  node src/index.js lint-skills             check agent specs and skill files
  node src/index.js check-claims <file>     run the claims guard on a JSON draft
`;

async function main() {
  switch (command) {
    case 'migrate': {
      const { migrate } = await import('./db/migrate.js');
      await migrate();
      break;
    }
    case 'seed': {
      const { seed } = await import('./db/seed.js');
      console.log(JSON.stringify(await seed(), null, 2));
      break;
    }
    case 'serve': {
      const { serve } = await import('./web/server.js');
      serve();
      return; // keep the process alive
    }
    case 'schedule': {
      const { SCHEDULE } = await import('./scheduler/table.js');
      for (const s of SCHEDULE) console.log(`${s.cron.padEnd(16)} ${s.worker.padEnd(20)} ${s.note}`);
      break;
    }
    case 'run': {
      const { runWorker } = await import('./workers/index.js');
      const res = await runWorker(args[0], {});
      console.log(JSON.stringify(res, null, 2));
      break;
    }
    case 'daemon': {
      const { daemon } = await import('./scheduler/daemon.js');
      await daemon();
      return; // keep the process alive
    }
    case 'approvals': {
      const { pending } = await import('./approvals/queue.js');
      const rows = await pending();
      if (!rows.length) console.log('nothing pending');
      for (const r of rows) console.log(`#${r.id}  ${r.kind.padEnd(22)} ${r.summary}`);
      break;
    }
    case 'show': {
      const { show } = await import('./approvals/queue.js');
      console.log(JSON.stringify(await show(Number(args[0])), null, 2));
      break;
    }
    case 'approve':
    case 'reject': {
      const { decide } = await import('./approvals/queue.js');
      const res = await decide(Number(args[0]), command === 'approve' ? 'approved' : 'rejected', args.slice(1).join(' ') || null);
      console.log(JSON.stringify(res));
      break;
    }
    case 'agents': {
      const { listAgents, loadAgent } = await import('./agents/spec.js');
      for (const name of listAgents()) {
        const a = loadAgent(name);
        console.log(`${name.padEnd(20)} tier=${a.tier.padEnd(5)} budget=$${String(a.budgetUsdMonth).padEnd(4)} approval=${a.approval.padEnd(7)} skills=${a.skills.join(',')}`);
      }
      break;
    }
    case 'lint-skills': {
      const { lintSpecs } = await import('./agents/lint.js');
      const problems = lintSpecs();
      if (!problems.length) { console.log('agents and skills look fine'); break; }
      for (const p of problems) console.error(p);
      process.exitCode = 1;
      break;
    }
    case 'check-claims': {
      const { checkClaims } = await import('./guard/claims.js');
      const draft = JSON.parse(readFileSync(args[0], 'utf8'));
      let capabilities = draft.capabilities;
      if (!capabilities) {
        const { q } = await import('./db/pool.js');
        capabilities = await q('SELECT * FROM capabilities');
      }
      console.log(JSON.stringify(checkClaims({ ...draft, capabilities }), null, 2));
      break;
    }
    default:
      console.log(HELP);
  }
  // Close the pool only if something actually opened one (commands like `agents` never touch the DB).
  try {
    const { closeDb } = await import('./db/pool.js');
    await closeDb();
  } catch { /* pg not installed or never connected */ }
}

main().catch((err) => { console.error(err.message); process.exit(1); });
