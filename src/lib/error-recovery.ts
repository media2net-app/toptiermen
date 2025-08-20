// V1.1: Error Recovery System with Circuit Breaker Pattern
// This utility provides automatic error recovery, circuit breaker pattern, and graceful degradation

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  recoveryTimeout: number; // Time in ms to wait before attempting recovery
  monitoringWindow: number; // Time window for failure counting
  expectedErrors: string[]; // Error types that should trigger circuit breaker
}

export interface ErrorRecoveryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export interface CircuitBreakerState {
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  successCount: number;
  totalRequests: number;
}

// Default configurations
const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5, // 5 failures before opening circuit
  recoveryTimeout: 30000, // 30 seconds recovery timeout
  monitoringWindow: 60000, // 1 minute monitoring window
  expectedErrors: [
    'connection_timeout',
    'database_unavailable',
    'network_error',
    'rate_limit_exceeded',
    'service_unavailable',
  ],
};

const DEFAULT_ERROR_RECOVERY_CONFIG: ErrorRecoveryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitter: true,
};

class CircuitBreaker {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;
  private failureHistory: Array<{ timestamp: number; error: string }> = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
    this.state = {
      status: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0,
      totalRequests: 0,
    };
  }

  // Check if circuit breaker allows the operation
  canExecute(): boolean {
    const now = Date.now();

    switch (this.state.status) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        if (now >= this.state.nextAttemptTime) {
          this.state.status = 'HALF_OPEN';
          console.log('🔄 Circuit breaker: Attempting recovery (HALF_OPEN)');
          return true;
        }
        return false;

      case 'HALF_OPEN':
        return true;

      default:
        return false;
    }
  }

  // Record a successful operation
  onSuccess(): void {
    this.state.totalRequests++;
    this.state.successCount++;

    if (this.state.status === 'HALF_OPEN') {
      this.state.status = 'CLOSED';
      this.state.failureCount = 0;
      this.failureHistory = [];
      console.log('✅ Circuit breaker: Recovery successful, circuit CLOSED');
    }
  }

  // Record a failed operation
  onFailure(error: Error): void {
    const now = Date.now();
    this.state.totalRequests++;
    this.state.lastFailureTime = now;

    // Add to failure history
    this.failureHistory.push({
      timestamp: now,
      error: error.message,
    });

    // Clean up old failures outside monitoring window
    this.failureHistory = this.failureHistory.filter(
      failure => (now - failure.timestamp) < this.config.monitoringWindow
    );

    this.state.failureCount = this.failureHistory.length;

    if (this.state.status === 'CLOSED' && this.state.failureCount >= this.config.failureThreshold) {
      this.state.status = 'OPEN';
      this.state.nextAttemptTime = now + this.config.recoveryTimeout;
      console.log(`🚨 Circuit breaker: Circuit OPENED after ${this.state.failureCount} failures`);
    } else if (this.state.status === 'HALF_OPEN') {
      this.state.status = 'OPEN';
      this.state.nextAttemptTime = now + this.config.recoveryTimeout;
      console.log('🚨 Circuit breaker: Recovery failed, circuit OPENED again');
    }
  }

  // Get current state
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  // Force reset circuit breaker
  reset(): void {
    this.state = {
      status: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0,
      totalRequests: 0,
    };
    this.failureHistory = [];
    console.log('🔄 Circuit breaker: Manually reset');
  }

  // Get statistics
  getStats() {
    const successRate = this.state.totalRequests > 0 
      ? (this.state.successCount / this.state.totalRequests) * 100 
      : 0;

    return {
      status: this.state.status,
      successRate: `${successRate.toFixed(1)}%`,
      totalRequests: this.state.totalRequests,
      failureCount: this.state.failureCount,
      successCount: this.state.successCount,
      failureHistory: this.failureHistory.length,
    };
  }
}

// Exponential backoff with jitter
function calculateBackoffDelay(
  attempt: number,
  config: ErrorRecoveryConfig
): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  );

  if (config.jitter) {
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }

  return delay;
}

// Error classification
function classifyError(error: Error): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('timeout') || message.includes('connection')) {
    return 'connection_timeout';
  }
  if (message.includes('database') || message.includes('relation')) {
    return 'database_unavailable';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'network_error';
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return 'rate_limit_exceeded';
  }
  if (message.includes('service unavailable') || message.includes('503')) {
    return 'service_unavailable';
  }
  
  return 'unknown_error';
}

// Main error recovery function with circuit breaker
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  options: {
    circuitBreaker?: Partial<CircuitBreakerConfig>;
    retry?: Partial<ErrorRecoveryConfig>;
    fallback?: () => Promise<T>;
    context?: string;
  } = {}
): Promise<T> {
  const circuitBreaker = new CircuitBreaker(options.circuitBreaker);
  const retryConfig = { ...DEFAULT_ERROR_RECOVERY_CONFIG, ...options.retry };
  const context = options.context || 'unknown';

  // Check if circuit breaker allows execution
  if (!circuitBreaker.canExecute()) {
    console.log(`🚨 Circuit breaker blocked operation: ${context}`);
    
    if (options.fallback) {
      console.log(`🔄 Using fallback for: ${context}`);
      return await options.fallback();
    }
    
    throw new Error(`Circuit breaker is OPEN for: ${context}`);
  }

  let lastError: Error;

  // Attempt operation with retries
  for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = await operation();
      circuitBreaker.onSuccess();
      console.log(`✅ Operation successful: ${context} (attempt ${attempt})`);
      return result;
    } catch (error) {
      lastError = error as Error;
      const errorType = classifyError(lastError);
      
      console.warn(`⚠️ Operation failed: ${context} (attempt ${attempt}/${retryConfig.maxRetries}) - ${errorType}: ${lastError.message}`);
      
      circuitBreaker.onFailure(lastError);

      // If this is the last attempt, don't retry
      if (attempt === retryConfig.maxRetries) {
        break;
      }

      // Check if circuit breaker is now open
      if (!circuitBreaker.canExecute()) {
        console.log(`🚨 Circuit breaker opened during retry: ${context}`);
        break;
      }

      // Calculate delay for next attempt
      const delay = calculateBackoffDelay(attempt, retryConfig);
      console.log(`⏳ Waiting ${delay}ms before retry: ${context}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  console.error(`❌ Operation failed after ${retryConfig.maxRetries} attempts: ${context}`);
  
  if (options.fallback) {
    console.log(`🔄 Using fallback after all retries failed: ${context}`);
    return await options.fallback();
  }

  throw lastError!;
}

// Database-specific error recovery
export async function withDatabaseErrorRecovery<T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  return withErrorRecovery(operation, {
    circuitBreaker: {
      failureThreshold: 3, // Lower threshold for database operations
      recoveryTimeout: 15000, // 15 seconds for database recovery
      expectedErrors: [
        'database_unavailable',
        'connection_timeout',
        'relation_does_not_exist',
      ],
    },
    retry: {
      maxRetries: 2, // Fewer retries for database operations
      baseDelay: 500, // Faster retry for database
    },
    fallback,
    context: 'database_operation',
  });
}

// API-specific error recovery
export async function withAPIErrorRecovery<T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  return withErrorRecovery(operation, {
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      expectedErrors: [
        'network_error',
        'rate_limit_exceeded',
        'service_unavailable',
      ],
    },
    retry: {
      maxRetries: 3,
      baseDelay: 1000,
    },
    fallback,
    context: 'api_operation',
  });
}

// Auth-specific error recovery
export async function withAuthErrorRecovery<T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  return withErrorRecovery(operation, {
    circuitBreaker: {
      failureThreshold: 2, // Very low threshold for auth operations
      recoveryTimeout: 10000, // 10 seconds for auth recovery
      expectedErrors: [
        'auth_timeout',
        'session_expired',
        'invalid_token',
      ],
    },
    retry: {
      maxRetries: 1, // Minimal retries for auth
      baseDelay: 200, // Very fast retry for auth
    },
    fallback,
    context: 'auth_operation',
  });
}

// Global error recovery manager
class ErrorRecoveryManager {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  // Get or create circuit breaker for a specific service
  getCircuitBreaker(service: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuitBreakers.has(service)) {
      this.circuitBreakers.set(service, new CircuitBreaker(config));
    }
    return this.circuitBreakers.get(service)!;
  }

  // Get all circuit breaker statistics
  getAllStats() {
    const stats: Record<string, any> = {};
    
    for (const [service, circuitBreaker] of this.circuitBreakers) {
      stats[service] = circuitBreaker.getStats();
    }
    
    return stats;
  }

  // Reset all circuit breakers
  resetAll() {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }
    console.log('🔄 All circuit breakers reset');
  }

  // Get overall system health
  getSystemHealth() {
    const stats = this.getAllStats();
    const totalServices = Object.keys(stats).length;
    const healthyServices = Object.values(stats).filter(
      (stat: any) => stat.status === 'CLOSED'
    ).length;

    return {
      totalServices,
      healthyServices,
      unhealthyServices: totalServices - healthyServices,
      healthPercentage: totalServices > 0 ? (healthyServices / totalServices) * 100 : 100,
    };
  }
}

// Export singleton instance
export const errorRecoveryManager = new ErrorRecoveryManager();

// Export utility functions
export {
  CircuitBreaker,
  calculateBackoffDelay,
  classifyError,
};

// Export types
export type {
  CircuitBreakerConfig,
  ErrorRecoveryConfig,
  CircuitBreakerState,
};
