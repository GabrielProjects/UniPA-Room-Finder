const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

function log(level, message, ...args) {
  if (LOG_LEVELS[level] >= currentLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, ...args);
  }
}

export const logger = {
  debug: (msg, ...args) => log("DEBUG", msg, ...args),
  info: (msg, ...args) => log("INFO", msg, ...args),
  warn: (msg, ...args) => log("WARNING", msg, ...args),
  error: (msg, ...args) => log("ERROR", msg, ...args)
};

