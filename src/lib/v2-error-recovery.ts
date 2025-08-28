// 2.0.1: Intelligent Error Recovery System
import { useV2State } from '@/contexts/V2StateContext';

// 2.0.1: Error types
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'auth' | 'validation' | 'database' | 'ui' | 'unknown';

// 2.0.1: Error information
export interface V2Error {
  id: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
  retryCount: number;
  maxRetries: number;
  isRecoverable: boolean;
  recoveryStrategy?: RecoveryStrategy;
}

// 2.0.1: Recovery strategies
export type RecoveryStrategy = 
  | 'retry'           // Retry the operation
  | 'fallback'        // Use fallback data/functionality
  | 'degrade'         // Degrade functionality
  | 'redirect'        // Redirect to error page
  | 'ignore'          // Ignore the error
  | 'manual';         // Require manual intervention

// 2.0.1: Error recovery configuration
export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  recoveryStrategy: RecoveryStrategy;
  fallbackData?: any;
  fallbackFunction?: () => any;
  onError?: (error: V2Error) => void;
  onRecovery?: (error: V2Error) => void;
}

// 2.0.1: Default error configurations
export const ERROR_CONFIGS: Record<ErrorCategory, ErrorRecoveryConfig> = {
  network: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    recoveryStrategy: 'retry',
    onError: (error) => console.error('2.0.1: Network error:', error),
  },
  
  auth: {
    maxRetries: 1,
    retryDelay: 0,
    backoffMultiplier: 1,
    recoveryStrategy: 'redirect',
    onError: (error) => console.error('2.0.1: Auth error:', error),
  },
  
  validation: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    recoveryStrategy: 'ignore',
    onError: (error) => console.error('2.0.1: Validation error:', error),
  },
  
  database: {
    maxRetries: 2,
    retryDelay: 2000,
    backoffMultiplier: 1.5,
    recoveryStrategy: 'retry',
    onError: (error) => console.error('2.0.1: Database error:', error),
  },
  
  ui: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    recoveryStrategy: 'degrade',
    onError: (error) => console.error('2.0.1: UI error:', error),
  },
  
  unknown: {
    maxRetries: 1,
    retryDelay: 1000,
    backoffMultiplier: 1,
    recoveryStrategy: 'manual',
    onError: (error) => console.error('2.0.1: Unknown error:', error),
  },
};

// 2.0.1: Error recovery manager
export class V2ErrorRecoveryManager {
  private errors: Map<string, V2Error> = new Map();
  private retryQueue: Array<{ error: V2Error; retryAt: number }> = [];
  private isProcessing = false;
  
  // 2.0.1: Create error
  createError(
    message: string,
    category: ErrorCategory = 'unknown',
    severity: ErrorSeverity = 'medium',
    context?: Record<string, any>
  ): V2Error {
    const config = ERROR_CONFIGS[category];
    
    const error: V2Error = {
      id: `error_${Date.now()}_${Math.random()}`,
      message,
      severity,
      category,
      timestamp: Date.now(),
      context,
      stack: new Error().stack,
      retryCount: 0,
      maxRetries: config.maxRetries,
      isRecoverable: config.recoveryStrategy !== 'manual',
      recoveryStrategy: config.recoveryStrategy,
    };
    
    this.errors.set(error.id, error);
    config.onError?.(error);
    
    return error;
  }
  
  // 2.0.1: Handle error with recovery
  async handleError<T>(
    operation: () => Promise<T>,
    errorMessage: string,
    category: ErrorCategory = 'unknown',
    fallbackData?: T
  ): Promise<T> {
    const config = ERROR_CONFIGS[category];
    
    try {
      return await operation();
    } catch (originalError) {
      const error = this.createError(
        errorMessage,
        category,
        this.determineSeverity(originalError),
        { originalError: originalError instanceof Error ? originalError.message : String(originalError) }
      );
      
      // Try recovery
      return await this.attemptRecovery(error, operation, fallbackData);
    }
  }
  
  // 2.0.1: Attempt recovery
  private async attemptRecovery<T>(
    error: V2Error,
    operation: () => Promise<T>,
    fallbackData?: T
  ): Promise<T> {
    const config = ERROR_CONFIGS[error.category];
    
    switch (config.recoveryStrategy) {
      case 'retry':
        return await this.retryOperation(error, operation);
        
      case 'fallback':
        return this.useFallback(error, fallbackData);
        
      case 'degrade':
        return this.degradeFunctionality(error, fallbackData);
        
      case 'redirect':
        this.redirectToError(error);
        throw new Error(error.message);
        
      case 'ignore':
        console.warn('2.0.1: Ignoring error:', error.message);
        throw new Error(error.message);
        
      case 'manual':
      default:
        this.requireManualIntervention(error);
        throw new Error(error.message);
    }
  }
  
  // 2.0.1: Retry operation with exponential backoff
  private async retryOperation<T>(error: V2Error, operation: () => Promise<T>): Promise<T> {
    const config = ERROR_CONFIGS[error.category];
    
    if (error.retryCount >= config.maxRetries) {
      throw new Error(`2.0.1: Max retries exceeded for: ${error.message}`);
    }
    
    error.retryCount++;
    const delay = config.retryDelay * Math.pow(config.backoffMultiplier, error.retryCount - 1);
    
    console.log(`2.0.1: Retrying operation (${error.retryCount}/${config.maxRetries}) in ${delay}ms`);
    
    await this.delay(delay);
    
    try {
      const result = await operation();
      config.onRecovery?.(error);
      return result;
    } catch (retryError) {
      return await this.attemptRecovery(error, operation);
    }
  }
  
  // 2.0.1: Use fallback data
  private useFallback<T>(error: V2Error, fallbackData?: T): T {
    if (fallbackData === undefined) {
      throw new Error(`2.0.1: No fallback data available for: ${error.message}`);
    }
    
    console.log('2.0.1: Using fallback data for:', error.message);
    ERROR_CONFIGS[error.category].onRecovery?.(error);
    return fallbackData;
  }
  
  // 2.0.1: Degrade functionality
  private degradeFunctionality<T>(error: V2Error, fallbackData?: T): T {
    console.log('2.0.1: Degrading functionality for:', error.message);
    ERROR_CONFIGS[error.category].onRecovery?.(error);
    
    // Return fallback data or empty/default values
    return fallbackData as T;
  }
  
  // 2.0.1: Redirect to error page
  private redirectToError(error: V2Error): void {
    console.log('2.0.1: Redirecting to error page for:', error.message);
    
    // Store error in session storage for error page
    try {
      sessionStorage.setItem('v2-error-redirect', JSON.stringify(error));
    } catch (e) {
      console.error('2.0.1: Failed to store error for redirect:', e);
    }
    
    // Redirect to error page
    if (typeof window !== 'undefined') {
      window.location.href = '/error';
    }
  }
  
  // 2.0.1: Require manual intervention
  private requireManualIntervention(error: V2Error): void {
    console.error('2.0.1: Manual intervention required for:', error.message);
    
    // Show user-friendly error message
    if (typeof window !== 'undefined') {
      alert(`Er is een fout opgetreden: ${error.message}\n\nNeem contact op met de beheerder als het probleem aanhoudt.`);
    }
  }
  
  // 2.0.1: Determine error severity
  private determineSeverity(error: any): ErrorSeverity {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('timeout')) {
        return 'medium';
      }
      
      if (message.includes('auth') || message.includes('unauthorized')) {
        return 'high';
      }
      
      if (message.includes('validation') || message.includes('invalid')) {
        return 'low';
      }
    }
    
    return 'medium';
  }
  
  // 2.0.1: Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 2.0.1: Get all errors
  getErrors(): V2Error[] {
    return Array.from(this.errors.values());
  }
  
  // 2.0.1: Get errors by category
  getErrorsByCategory(category: ErrorCategory): V2Error[] {
    return this.getErrors().filter(error => error.category === category);
  }
  
  // 2.0.1: Get errors by severity
  getErrorsBySeverity(severity: ErrorSeverity): V2Error[] {
    return this.getErrors().filter(error => error.severity === severity);
  }
  
  // 2.0.1: Clear errors
  clearErrors(): void {
    this.errors.clear();
  }
  
  // 2.0.1: Clear errors by category
  clearErrorsByCategory(category: ErrorCategory): void {
    for (const [id, error] of this.errors.entries()) {
      if (error.category === category) {
        this.errors.delete(id);
      }
    }
  }
  
  // 2.0.1: Get error statistics
  getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recoverable: number;
    unrecoverable: number;
  } {
    const errors = this.getErrors();
    
    const byCategory: Record<ErrorCategory, number> = {
      network: 0,
      auth: 0,
      validation: 0,
      database: 0,
      ui: 0,
      unknown: 0,
    };
    
    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    let recoverable = 0;
    let unrecoverable = 0;
    
    errors.forEach(error => {
      byCategory[error.category]++;
      bySeverity[error.severity]++;
      
      if (error.isRecoverable) {
        recoverable++;
      } else {
        unrecoverable++;
      }
    });
    
    return {
      total: errors.length,
      byCategory,
      bySeverity,
      recoverable,
      unrecoverable,
    };
  }
}

// 2.0.1: Global error recovery manager
export const v2ErrorRecovery = new V2ErrorRecoveryManager();

// 2.0.1: React hook for error recovery
export function useV2ErrorRecovery() {
  const { setGlobalError, setComponentError, clearAllErrors } = useV2State();
  
  return {
    // 2.0.1: Handle error with recovery
    handleError: async <T>(
      operation: () => Promise<T>,
      errorMessage: string,
      category: ErrorCategory = 'unknown',
      fallbackData?: T,
      componentKey?: string
    ): Promise<T> => {
      try {
        return await v2ErrorRecovery.handleError(operation, errorMessage, category, fallbackData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (componentKey) {
          setComponentError(componentKey, errorMessage);
        } else {
          setGlobalError(errorMessage);
        }
        
        throw error;
      }
    },
    
    // 2.0.1: Create error
    createError: (
      message: string,
      category: ErrorCategory = 'unknown',
      severity: ErrorSeverity = 'medium',
      context?: Record<string, any>
    ): V2Error => {
      return v2ErrorRecovery.createError(message, category, severity, context);
    },
    
    // 2.0.1: Get error statistics
    getErrorStats: (): ReturnType<typeof v2ErrorRecovery.getErrorStats> => {
      return v2ErrorRecovery.getErrorStats();
    },
    
    // 2.0.1: Clear errors
    clearErrors: (): void => {
      v2ErrorRecovery.clearErrors();
      clearAllErrors();
    },
    
    // 2.0.1: Clear errors by category
    clearErrorsByCategory: (category: ErrorCategory): void => {
      v2ErrorRecovery.clearErrorsByCategory(category);
    },
  };
}

// 2.0.1: Error boundary hook
export function useV2ErrorBoundary() {
  const { setGlobalError } = useV2State();
  
  return {
    // 2.0.1: Handle component error
    handleComponentError: (error: Error, errorInfo?: any): void => {
      const v2Error = v2ErrorRecovery.createError(
        error.message,
        'ui',
        'high',
        { errorInfo, stack: error.stack }
      );
      
      setGlobalError(`Component error: ${error.message}`);
      console.error('2.0.1: Component error caught:', v2Error);
    },
    
    // 2.0.1: Handle async error
    handleAsyncError: (error: Error): void => {
      const v2Error = v2ErrorRecovery.createError(
        error.message,
        'unknown',
        'medium',
        { stack: error.stack }
      );
      
      setGlobalError(`Async error: ${error.message}`);
      console.error('2.0.1: Async error caught:', v2Error);
    },
  };
}

// 2.0.1: Network error recovery hook
export function useV2NetworkRecovery() {
  const { handleError } = useV2ErrorRecovery();
  
  return {
    // 2.0.1: Fetch with automatic retry
    fetchWithRetry: async <T>(
      url: string,
      options?: RequestInit,
      fallbackData?: T
    ): Promise<T> => {
      return await handleError(
        async () => {
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        },
        `Failed to fetch from ${url}`,
        'network',
        fallbackData
      );
    },
    
    // 2.0.1: API call with retry
    apiCallWithRetry: async <T>(
      endpoint: string,
      method: string = 'GET',
      body?: any,
      fallbackData?: T
    ): Promise<T> => {
      return await handleError(
        async () => {
          const response = await fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
          });
          
          if (!response.ok) {
            throw new Error(`API ${response.status}: ${response.statusText}`);
          }
          
          return response.json();
        },
        `Failed to call API ${method} ${endpoint}`,
        'network',
        fallbackData
      );
    },
  };
}
