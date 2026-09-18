import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cache = new Map();
export function readConfig(name) {
  if (!cache.has(name)) cache.set(name, JSON.parse(readFileSync(resolve(process.cwd(), 'config', name), 'utf8')));
  return cache.get(name);
}
