import winston from 'winston';
import 'winston-daily-rotate-file';

// Set up file rotation transports
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/%DATE%-results.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

// Create the logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // Log to console
        dailyRotateFileTransport           // Log to rotating files
    ]
});

// Export the logger to use in other files
export default logger;
