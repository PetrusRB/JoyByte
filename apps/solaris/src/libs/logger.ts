import winston, { format } from 'winston'
import { z } from 'zod'

// Log level validation schema
const LogLevelSchema = z.enum(['error', 'warn', 'info', 'debug', 'verbose'])

// Environment-based configuration
const LOG_LEVEL = LogLevelSchema.parse(
  process.env.NODE_ENV === 'production' ? 'info' : 'debug'
)

// Create custom log format
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.metadata(),
  format.json()
)

// Configure transports based on environment
const transports = [
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
      ? customFormat
      : format.combine(
          format.colorize(),
          format.simple(),
          customFormat
        ),
  }),
]

// Initialize logger
const winstonLogger = winston.createLogger({
  level: LOG_LEVEL,
  format: customFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
    }),
  ],
})

/**
 * Logger utility with typed methods
 */
export const logger = {
  error(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.log('error', message, meta)
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.log('warn', message, meta)
  },

  info(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.log('info', message, meta)
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.log('debug', message, meta)
  },

  verbose(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.log('verbose', message, meta)
  },

  /**
   * Configures logger level at runtime
   * @param level - New log level
   */
  setLevel(level: string): void {
    const validatedLevel = LogLevelSchema.safeParse(level)
    if (validatedLevel.success) {
      winstonLogger.level = validatedLevel.data
    } else {
      winstonLogger.warn('Invalid log level', { level, error: validatedLevel.error.message })
    }
  },

  /**
   * Adds a new transport to the logger
   * @param transport - Winston transport instance
   */
  addTransport(transport: winston.transport): void {
    try {
      winstonLogger.add(transport)
    } catch (error) {
      console.error('Failed to add transport', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },
}
