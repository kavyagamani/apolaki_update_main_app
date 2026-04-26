/**
 * Minimal structured logger for the seed utility.
 * Single responsibility: formatted console output with severity and timing.
 */

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info(msg, ...args) {
    console.log(`${COLORS.dim}${timestamp()}${COLORS.reset} ${COLORS.cyan}[seed]${COLORS.reset} ${msg}`, ...args);
  },
  success(msg, ...args) {
    console.log(`${COLORS.dim}${timestamp()}${COLORS.reset} ${COLORS.green}  ✔ ${msg}${COLORS.reset}`, ...args);
  },
  warn(msg, ...args) {
    console.warn(`${COLORS.dim}${timestamp()}${COLORS.reset} ${COLORS.yellow}  ⚠ ${msg}${COLORS.reset}`, ...args);
  },
  error(msg, ...args) {
    console.error(`${COLORS.dim}${timestamp()}${COLORS.reset} ${COLORS.red}  ✖ ${msg}${COLORS.reset}`, ...args);
  },
  header(msg) {
    console.log(`\n${COLORS.bold}${COLORS.cyan}━━━ ${msg} ━━━${COLORS.reset}\n`);
  },
  table(rows) {
    console.table(rows);
  },
};
