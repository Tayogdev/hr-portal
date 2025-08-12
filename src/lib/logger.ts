/**
 * Production-ready Logger for HR Portal
 * Handles different log levels and can be configured for different environments
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
  context?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isProduction: boolean;
  private maxLogEntries: number = 1000;
  private logBuffer: LogEntry[] = [];

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error, context?: string, data?: any): void {
    if (this.logLevel >= LogLevel.ERROR) {
      this.log(LogLevel.ERROR, message, error, context, data);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: string, data?: any): void {
    if (this.logLevel >= LogLevel.WARN) {
      this.log(LogLevel.WARN, message, undefined, context, data);
    }
  }

  /**
   * Log info messages
   */
  info(message: string, context?: string, data?: any): void {
    if (this.logLevel >= LogLevel.INFO) {
      this.log(LogLevel.INFO, message, undefined, context, data);
    }
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: string, data?: any): void {
    if (this.logLevel >= LogLevel.DEBUG && !this.isProduction) {
      this.log(LogLevel.DEBUG, message, undefined, context, data);
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, error?: Error, context?: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
      context,
    };

    // Add to buffer
    this.logBuffer.push(entry);

    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.maxLogEntries);
    }

    // Output based on environment
    if (this.isProduction) {
      this.logToProduction(entry);
    } else {
      this.logToConsole(entry);
    }
  }

  /**
   * Log to console in development
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, error, context, data } = entry;
    const prefix = context ? `[${context}]` : '';
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(`${prefix} ERROR: ${message}`, error || '', data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} WARN: ${message}`, data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} INFO: ${message}`, data || '');
        break;
      case LogLevel.DEBUG:
        console.debug(`${prefix} DEBUG: ${message}`, data || '');
        break;
    }
  }

  /**
   * Log to production service (can be configured for different services)
   */
  private logToProduction(entry: LogEntry): void {
    // In production, you might want to send logs to:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - Custom logging service
    // - Server-side logging endpoint

    if (entry.level === LogLevel.ERROR) {
      // Send critical errors to external service
      this.sendToErrorService(entry);
    }

    // Store in localStorage for debugging (limited)
    this.storeInLocalStorage(entry);
  }

  /**
   * Send error to external service (e.g., Sentry)
   */
  private sendToErrorService(entry: LogEntry): void {
    // Example: Send to Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(entry.error || new Error(entry.message), {
        extra: {
          context: entry.context,
          data: entry.data,
          timestamp: entry.timestamp,
        },
      });
    }

    // Example: Send to custom endpoint
    this.sendToCustomEndpoint(entry);
  }

  /**
   * Send to custom logging endpoint
   */
  private async sendToCustomEndpoint(entry: LogEntry): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: LogLevel[entry.level],
          message: entry.message,
          context: entry.context,
          timestamp: entry.timestamp,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          url: typeof window !== 'undefined' ? window.location.href : 'server',
        }),
      });
    } catch {
      // Silently fail if logging endpoint is not available
    }
  }

  /**
   * Store logs in localStorage for debugging
   */
  private storeInLocalStorage(entry: LogEntry): void {
    if (typeof window === 'undefined') return;

    try {
      const logs = JSON.parse(localStorage.getItem('hr-portal-logs') || '[]');
      logs.push(entry);

      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('hr-portal-logs', JSON.stringify(logs));
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logBuffer.slice(-limit);
  }

  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hr-portal-logs');
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Create singleton instance
const logger = new Logger();

// Export logger instance and LogLevel enum
export { logger };
export default logger;
