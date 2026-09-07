import { env } from "../../config/env.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function appLogger(level: LogLevel = env.LOG_LEVEL) {
  const currentLevel = levelOrder[level];

  function shouldLog(logLevel: LogLevel) {
    return levelOrder[logLevel] >= currentLevel;
  }

  function write(logLevel: LogLevel, message: string, meta?: unknown) {
    if (!shouldLog(logLevel)) return;

    const payload = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      message,
      ...(meta !== undefined ? { meta } : {}),
    };

    const method =
      logLevel === "debug" ? "debug" :
      logLevel === "warn" ? "warn" :
      logLevel;

    console[method](payload);
  }

  return {
    debug: (msg: string, meta?: unknown) => write("debug", msg, meta),
    info: (msg: string, meta?: unknown) => write("info", msg, meta),
    warn: (msg: string, meta?: unknown) => write("warn", msg, meta),
    error: (msg: string, meta?: unknown) => write("error", msg, meta),
  };
}

// Usage
export const logger = appLogger();
