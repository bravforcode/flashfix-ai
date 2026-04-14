type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: unknown
  userId?: string
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private readonly maxLogs = 1000

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, context?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      // userId: useStore.getState().userId // Could link to store if needed
    }
  }

  private async persistLog(entry: LogEntry) {
    const runtimeConsole = globalThis.console
    const method = entry.level === 'debug' ? 'log' : entry.level

    // In a real enterprise app, we'd send this to a service like Supabase, Sentry, or Datadog
    runtimeConsole?.[method](
      `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`,
      entry.context || ''
    )

    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Example of sending to Supabase (if available)
    // if (entry.level === 'error') {
    //   const { supabase } = await import('@/core/services/supabase')
    //   await supabase.from('system_logs').insert([entry])
    // }
  }

  public info(message: string, context?: unknown) {
    this.persistLog(this.formatMessage('info', message, context))
  }

  public warn(message: string, context?: unknown) {
    this.persistLog(this.formatMessage('warn', message, context))
  }

  public error(message: string, error?: unknown) {
    this.persistLog(this.formatMessage('error', message, {
      stack: error instanceof Error ? error.stack : undefined,
      details: error
    }))
  }

  public debug(message: string, context?: unknown) {
    if (import.meta.env.DEV) {
      this.persistLog(this.formatMessage('debug', message, context))
    }
  }

  public getLogs() {
    return [...this.logs]
  }

  public clearLogs() {
    this.logs = []
  }
}

export const logger = Logger.getInstance()
