import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from './logger'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught React Error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-red-50/30 dark:bg-red-900/10 rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/30 animate-fade-in">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Oops! Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            The application encountered an unexpected error. Don't worry, our AI has logged this issue and we're looking into it.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-800 dark:bg-red-700 text-white rounded-xl text-sm font-bold hover:bg-red-900 transition-all active:scale-95 shadow-lg shadow-red-900/20"
            >
              <RefreshCcw size={18} /> Reload Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2.5 text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              Try Again
            </button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-12 p-4 bg-slate-900 text-slate-300 text-left rounded-lg text-xs font-mono max-w-full overflow-auto border border-slate-800">
              <div className="text-red-400 mb-2 font-bold uppercase tracking-widest text-[10px]">Developer Mode Error Details:</div>
              {this.state.error.stack}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
