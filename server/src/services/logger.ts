import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';

const appName = process.env.APP_NAME || 'app';

const customFormat = format.printf(({ level, message, timestamp, label }) => {
  return `[${timestamp}][${level.toUpperCase()}][${label}] ${message}`;
});


const LOG_DIR = process.env.LOG_DIR || path.resolve(__dirname, '../../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const getLogFilename = () => {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 16); // e.g. 2025-05-29T13-45
  return path.join(LOG_DIR, `${appName}-${dateStr}.log`);
};

export function getLogger(classPath: string) {
  return createLogger({
    level: 'info',
    format: format.combine(
      format.label({ label: classPath }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      customFormat
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: getLogFilename(),
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5, // keep last 5 log files
        tailable: true,
      }),
    ],
  });
}
