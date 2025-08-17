'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-[#8BAE5A] text-xl font-bold mb-4">Er is iets misgegaan</h1>
            <p className="text-[#B6C948] text-sm mb-6">
              Er is een onverwachte fout opgetreden. Probeer de pagina te herladen.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#B6C948] transition-colors"
              >
                Pagina herladen
              </button>
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
              >
                Opnieuw proberen
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-[#B6C948] cursor-pointer">Technische details</summary>
                <pre className="mt-2 text-xs text-red-400 bg-[#181F17] p-3 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
