/**
 * Simple logger with [tag] prefix and optional DEBUG mode.
 * Use for scan, mcp, cli — keeps output consistent and easy to filter.
 */

const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true';

export type LogTag = 'scan' | 'mcp' | 'cli' | 'scanner' | 'ai' | 'updater';

function formatMessage(tag: LogTag, message: string, data?: unknown): string {
  const prefix = `[${tag}]`;
  if (data !== undefined) {
    return `${prefix} ${message} ${typeof data === 'object' ? JSON.stringify(data) : String(data)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  info(tag: LogTag, message: string, data?: unknown): void {
    console.log(formatMessage(tag, message, data));
  },

  error(tag: LogTag, message: string, err?: unknown): void {
    const detail = err instanceof Error ? err.message : err != null ? String(err) : undefined;
    console.error(formatMessage(tag, message, detail));
    if (DEBUG && err instanceof Error && err.stack) {
      console.error(err.stack);
    }
  },

  debug(tag: LogTag, message: string, data?: unknown): void {
    if (DEBUG) {
      console.error(formatMessage(tag, message, data));
    }
  },
};
