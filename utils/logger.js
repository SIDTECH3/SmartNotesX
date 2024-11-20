const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// Create logger
const logger = createLogger({
  level: 'info', // Default log level
  format: combine(colorize(), timestamp(), logFormat),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log errors to file
    new transports.File({ filename: 'logs/combined.log' }), // Log all messages to file
  ],
});

module.exports = logger;
