export const WORKERS = {
  'brain-sync':         () => import('./brainSync.js'),
  'kill-switch':        () => import('./killSwitch.js'),
  'offer-architect':    () => import('./offerArchitect.js'),
  'content-engine':     () => import('./contentEngine.js'),
  'signal-scout':       () => import('./signalScout.js'),
  'outbound-batch':     () => import('./outboundBatch.js'),
  'community-listener': () => import('./communityListener.js'),
  'attribution':        () => import('./attribution.js'),
  'experiments':        () => import('./experiments.js'),
  'strategist':         () => import('./strategist.js'),
  'market-research':    () => import('./marketResearch.js'),
  'competitor-watch':   () => import('./competitorWatch.js'),
  'lifecycle':          () => import('./lifecycle.js'),
  'partner-channel':    () => import('./partnerChannel.js'),
  'founder-digest':     () => import('./founderDigest.js'),
  'brand-strategist':   () => import('./brandStrategist.js'),
};

export async function runWorker(name, args = {}) {
  const loader = WORKERS[name];
  if (!loader) throw new Error(`Unknown worker "${name}". Known: ${Object.keys(WORKERS).join(', ')}`);
  const mod = await loader();
  return mod.run(args);
}
