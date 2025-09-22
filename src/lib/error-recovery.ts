/**
 * Error Recovery Utility
 * Provides robust error handling and recovery mechanisms
 */

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

class ErrorRecovery {
  private static instance: ErrorRecovery;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private retryAttempts: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ErrorRecovery {
    if (!ErrorRecovery.instance) {
      ErrorRecovery.instance = new ErrorRecovery();
    }
    return ErrorRecovery.instance;
  }

  /**
   * Retry an operation with exponential backoff
   */
  public async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    }
  ): Promise<T> {
    let lastError: any;
    const operationId = Math.random().toString(36).substr(2, 9);

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Reset retry attempts on success
        this.retryAttempts.delete(operationId);
        
        if (attempt > 0) {
          console.log(`✅ Operation succeeded after ${attempt} retries: ${operationId}`);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        // Check if we should retry this error
        if (options.retryCondition && !options.retryCondition(error)) {
          console.log(`❌ Non-retryable error: ${error.message}`);
          throw error;
        }

        if (attempt === options.maxRetries) {
          console.error(`❌ Operation failed after ${options.maxRetries} retries: ${operationId}`);
          this.retryAttempts.delete(operationId);
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          options.baseDelay * Math.pow(options.backoffMultiplier, attempt),
          options.maxDelay
        );

        console.log(`⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${error.message}`);
        
        this.retryAttempts.set(operationId, attempt + 1);
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Circuit breaker pattern implementation
   */
  public async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    key: string,
    options: CircuitBreakerOptions = {
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 300000
    }
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(key, options);
    
    if (circuitBreaker.state === 'OPEN') {
      if (Date.now() - circuitBreaker.lastFailureTime > options.recoveryTimeout) {
        circuitBreaker.state = 'HALF_OPEN';
        console.log(`🔄 Circuit breaker ${key} moved to HALF_OPEN state`);
      } else {
        throw new Error(`Circuit breaker ${key} is OPEN - operation blocked`);
      }
    }

    try {
      const result = await operation();
      
      if (circuitBreaker.state === 'HALF_OPEN') {
        circuitBreaker.state = 'CLOSED';
        circuitBreaker.failureCount = 0;
        console.log(`✅ Circuit breaker ${key} moved to CLOSED state`);
      }
      
      return result;
    } catch (error: any) {
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailureTime = Date.now();
      
      if (circuitBreaker.failureCount >= options.failureThreshold) {
        circuitBreaker.state = 'OPEN';
        console.log(`🚨 Circuit breaker ${key} moved to OPEN state after ${circuitBreaker.failureCount} failures`);
      }
      
      throw error;
    }
  }

  /**
   * Fallback mechanism with graceful degradation
   */
  public async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    fallbackCondition?: (error: any) => boolean
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error: any) {
      if (fallbackCondition && !fallbackCondition(error)) {
        throw error;
      }
      
      console.log(`🔄 Primary operation failed, using fallback: ${error.message}`);
      
      try {
        return await fallbackOperation();
      } catch (fallbackError: any) {
        console.error(`❌ Both primary and fallback operations failed`);
        throw new Error(`Primary: ${error.message}, Fallback: ${fallbackError.message}`);
      }
    }
  }

  /**
   * Timeout wrapper for operations
   */
  public async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    timeoutMessage?: string
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  /**
   * Bulk operation with partial success handling
   */
  public async bulkOperation<T>(
    operations: Array<() => Promise<T>>,
    options: {
      continueOnError?: boolean;
      maxConcurrency?: number;
      retryOptions?: RetryOptions;
    } = {}
  ): Promise<{
    results: T[];
    errors: Array<{ index: number; error: any }>;
    successCount: number;
    failureCount: number;
  }> {
    const {
      continueOnError = true,
      maxConcurrency = 5,
      retryOptions
    } = options;

    const results: T[] = [];
    const errors: Array<{ index: number; error: any }> = [];
    let successCount = 0;
    let failureCount = 0;

    // Process operations in batches to control concurrency
    for (let i = 0; i < operations.length; i += maxConcurrency) {
      const batch = operations.slice(i, i + maxConcurrency);
      
      const batchPromises = batch.map(async (operation, batchIndex) => {
        const globalIndex = i + batchIndex;
        
        try {
          const result = retryOptions 
            ? await this.retry(operation, retryOptions)
            : await operation();
          
          results[globalIndex] = result;
          successCount++;
          return { index: globalIndex, result, error: null };
        } catch (error: any) {
          failureCount++;
          const errorInfo = { index: globalIndex, error };
          errors.push(errorInfo);
          
          if (!continueOnError) {
            throw error;
          }
          
          return { index: globalIndex, result: null, error };
        }
      });

      await Promise.allSettled(batchPromises);
    }

    return {
      results,
      errors,
      successCount,
      failureCount
    };
  }

  /**
   * Get circuit breaker state
   */
  private getCircuitBreaker(key: string, options: CircuitBreakerOptions): CircuitBreakerState {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: 0
      });
    }
    
    return this.circuitBreakers.get(key)!;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics
   */
  public getRetryStats(): { [operationId: string]: number } {
    return Object.fromEntries(this.retryAttempts);
  }

  /**
   * Get circuit breaker states
   */
  public getCircuitBreakerStates(): { [key: string]: CircuitBreakerState } {
    return Object.fromEntries(this.circuitBreakers);
  }

  /**
   * Reset all circuit breakers
   */
  public resetCircuitBreakers(): void {
    this.circuitBreakers.clear();
    console.log('🔄 All circuit breakers reset');
  }
}

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
}

// Export singleton instance
export const errorRecovery = ErrorRecovery.getInstance();

// Helper functions for common error recovery patterns
export const withRetry = <T>(
  operation: () => Promise<T>,
  options?: RetryOptions
) => errorRecovery.retry(operation, options);

export const withCircuitBreaker = <T>(
  operation: () => Promise<T>,
  key: string,
  options?: CircuitBreakerOptions
) => errorRecovery.withCircuitBreaker(operation, key, options);

export const withFallback = <T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  fallbackCondition?: (error: any) => boolean
) => errorRecovery.withFallback(primaryOperation, fallbackOperation, fallbackCondition);

export const withTimeout = <T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
) => errorRecovery.withTimeout(operation, timeoutMs, timeoutMessage);