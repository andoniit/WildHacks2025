const winston = require('winston');
const { format, createLogger, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create the logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Write all logs to console
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    }),
    // Write all error logs to file
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      handleExceptions: true
    }),
    // Write all logs to combined.log
    new transports.File({ filename: 'logs/combined.log' })
  ],
  exitOnError: false
});

// Stream for Morgan integration
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  }
};

module.exports = logger;
