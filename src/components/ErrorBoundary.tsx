'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// V2.0: Error Boundary for better error handling
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and any error reporting service
    console.error('V2.0: ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#181F17] p-4">
          <div className="max-w-md w-full bg-[#232D1A] rounded-2xl p-8 border border-[#3A4D23] shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Er is iets misgegaan</h2>
              <p className="text-[#8BAE5A] text-sm mb-6">
                Er is een onverwachte fout opgetreden. Probeer de pagina te verversen of neem contact op als het probleem aanhoudt.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-[#181F17] rounded-lg border border-red-500/30">
                  <p className="text-red-400 text-xs font-mono mb-2">Error Details (Development):</p>
                  <p className="text-red-400 text-xs font-mono">{this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-red-400 text-xs cursor-pointer">Stack Trace</summary>
                      <pre className="text-red-400 text-xs mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors"
                >
                  Opnieuw Proberen
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
                >
                  Pagina Verversen
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-[#3A4D23]">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[#B6C948] text-xs">Platform</span>
                  <span className="px-2 py-1 bg-[#B6C948]/20 text-[#B6C948] text-xs font-semibold rounded-full border border-[#B6C948]/30">
                    V2.0
                  </span>
                  <span className="text-[#B6C948] text-xs">Error Recovery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// V2.0: Hook for functional components to handle errors
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('V2.0: useErrorHandler caught an error:', error, errorInfo);
    
    // You can add error reporting logic here
    // Example: logErrorToService(error, errorInfo);
    
    // Optionally show a toast notification
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.error('Er is een fout opgetreden. Probeer het opnieuw.');
    }
  };

  return { handleError };
}

// V2.0: Higher-order component for error handling
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
