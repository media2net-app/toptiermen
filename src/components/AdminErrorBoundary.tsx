'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#181F17] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-[#8BAE5A] mb-2">
              Er is iets misgegaan
            </h2>
            <p className="text-[#B6C948] text-sm mb-4">
              Er is een onverwachte fout opgetreden in het admin dashboard.
            </p>
            
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-[#8BAE5A] text-sm cursor-pointer mb-2">
                  Technische details
                </summary>
                <div className="bg-[#181F17] p-3 rounded text-xs text-gray-400 font-mono overflow-auto">
                  {this.state.error.message}
                </div>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-medium hover:bg-[#A6C97B] transition"
              >
                Opnieuw proberen
              </button>
              <button
                onClick={this.handleRefresh}
                className="flex-1 px-4 py-2 bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] rounded-lg font-medium hover:bg-[#232D1A] transition"
              >
                Pagina herladen
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Als het probleem aanhoudt, probeer dan opnieuw in te loggen.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 