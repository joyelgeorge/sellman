export const log = (worker) => ({
  info: (msg, extra = {}) => console.log(JSON.stringify({ t: new Date().toISOString(), level: 'info', worker, msg, ...extra })),
  warn: (msg, extra = {}) => console.warn(JSON.stringify({ t: new Date().toISOString(), level: 'warn', worker, msg, ...extra })),
  error: (msg, extra = {}) => console.error(JSON.stringify({ t: new Date().toISOString(), level: 'error', worker, msg, ...extra })),
});
