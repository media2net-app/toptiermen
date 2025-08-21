import { NextRequest, NextResponse } from 'next/server';
import { 
  withErrorRecovery, 
  withDatabaseErrorRecovery, 
  withAPIErrorRecovery, 
  withAuthErrorRecovery,
  errorRecoveryManager,
  CircuitBreaker 
} from '@/lib/error-recovery';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing error recovery system...');

    const testResults = {
      basicRecovery: false,
      databaseRecovery: false,
      apiRecovery: false,
      authRecovery: false,
      circuitBreaker: false,
      fallbackMechanism: false,
      performance: {
        basicRecovery: 0,
        databaseRecovery: 0,
        apiRecovery: 0,
        authRecovery: 0,
      },
      errors: [] as string[],
    };

    // Test 1: Basic error recovery with circuit breaker
    try {
      const startTime = Date.now();
      
      await withErrorRecovery(
        async () => {
          // Simulate a failing operation that succeeds on retry
          const attempt = Math.random();
          if (attempt < 0.7) {
            throw new Error('Simulated network error');
          }
          return { success: true, data: 'Basic recovery test passed' };
        },
        {
          circuitBreaker: {
            failureThreshold: 3,
            recoveryTimeout: 5000,
          },
          retry: {
            maxRetries: 2,
            baseDelay: 100,
          },
          context: 'basic_recovery_test',
        }
      );

      testResults.performance.basicRecovery = Date.now() - startTime;
      testResults.basicRecovery = true;
      console.log(`✅ Basic error recovery test: ${testResults.performance.basicRecovery}ms`);
    } catch (error) {
      testResults.errors.push(`Basic recovery error: ${error}`);
    }

    // Test 2: Database error recovery
    try {
      const startTime = Date.now();
      
      await withDatabaseErrorRecovery(
        async () => {
          // Simulate database operation
          const attempt = Math.random();
          if (attempt < 0.6) {
            throw new Error('Database connection timeout');
          }
          return { success: true, data: 'Database recovery test passed' };
        },
        async () => {
          // Fallback operation
          return { success: true, data: 'Database fallback used' };
        }
      );

      testResults.performance.databaseRecovery = Date.now() - startTime;
      testResults.databaseRecovery = true;
      console.log(`✅ Database error recovery test: ${testResults.performance.databaseRecovery}ms`);
    } catch (error) {
      testResults.errors.push(`Database recovery error: ${error}`);
    }

    // Test 3: API error recovery
    try {
      const startTime = Date.now();
      
      await withAPIErrorRecovery(
        async () => {
          // Simulate API call
          const attempt = Math.random();
          if (attempt < 0.5) {
            throw new Error('Rate limit exceeded');
          }
          return { success: true, data: 'API recovery test passed' };
        }
      );

      testResults.performance.apiRecovery = Date.now() - startTime;
      testResults.apiRecovery = true;
      console.log(`✅ API error recovery test: ${testResults.performance.apiRecovery}ms`);
    } catch (error) {
      testResults.errors.push(`API recovery error: ${error}`);
    }

    // Test 4: Auth error recovery
    try {
      const startTime = Date.now();
      
      await withAuthErrorRecovery(
        async () => {
          // Simulate auth operation
          const attempt = Math.random();
          if (attempt < 0.4) {
            throw new Error('Session expired');
          }
          return { success: true, data: 'Auth recovery test passed' };
        }
      );

      testResults.performance.authRecovery = Date.now() - startTime;
      testResults.authRecovery = true;
      console.log(`✅ Auth error recovery test: ${testResults.performance.authRecovery}ms`);
    } catch (error) {
      testResults.errors.push(`Auth recovery error: ${error}`);
    }

    // Test 5: Circuit breaker functionality
    try {
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 2,
        recoveryTimeout: 3000,
      });

      // Simulate failures to trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        try {
          if (!circuitBreaker.canExecute()) {
            console.log(`🚨 Circuit breaker blocked execution (attempt ${i + 1})`);
            break;
          }

          // Simulate failure
          throw new Error('Simulated failure');
        } catch (error) {
          circuitBreaker.onFailure(error as Error);
        }
      }

      // Wait for recovery
      await new Promise(resolve => setTimeout(resolve, 3500));

      // Test recovery
      if (circuitBreaker.canExecute()) {
        circuitBreaker.onSuccess();
        testResults.circuitBreaker = true;
        console.log('✅ Circuit breaker recovery test passed');
      }
    } catch (error) {
      testResults.errors.push(`Circuit breaker error: ${error}`);
    }

    // Test 6: Fallback mechanism
    try {
      await withErrorRecovery(
        async () => {
          // Always fail
          throw new Error('Persistent failure');
        },
        {
          retry: { maxRetries: 1 },
          fallback: async () => ({ success: true, data: 'Fallback mechanism used' }),
          context: 'fallback_test',
        }
      );

      testResults.fallbackMechanism = true;
      console.log('✅ Fallback mechanism test passed');
    } catch (error) {
      testResults.errors.push(`Fallback mechanism error: ${error}`);
    }

    // Get system health
    const systemHealth = errorRecoveryManager.getSystemHealth();
    const allStats = errorRecoveryManager.getAllStats();

    return NextResponse.json({
      success: true,
      message: 'Error recovery system test completed',
      results: testResults,
      systemHealth,
      circuitBreakerStats: allStats,
      summary: {
        totalTests: 6,
        passedTests: [
          testResults.basicRecovery ? 'Basic Recovery' : null,
          testResults.databaseRecovery ? 'Database Recovery' : null,
          testResults.apiRecovery ? 'API Recovery' : null,
          testResults.authRecovery ? 'Auth Recovery' : null,
          testResults.circuitBreaker ? 'Circuit Breaker' : null,
          testResults.fallbackMechanism ? 'Fallback Mechanism' : null,
        ].filter(Boolean).length,
        performance: {
          basicRecovery: `${testResults.performance.basicRecovery}ms`,
          databaseRecovery: `${testResults.performance.databaseRecovery}ms`,
          apiRecovery: `${testResults.performance.apiRecovery}ms`,
          authRecovery: `${testResults.performance.authRecovery}ms`,
        },
        systemHealth: `${systemHealth.healthPercentage.toFixed(1)}%`,
      },
    });

  } catch (error) {
    console.error('❌ Error recovery test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error recovery test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, service } = body;

    switch (action) {
      case 'stats':
        const stats = errorRecoveryManager.getAllStats();
        const health = errorRecoveryManager.getSystemHealth();
        
        return NextResponse.json({
          success: true,
          stats,
          health,
        });

      case 'reset':
        errorRecoveryManager.resetAll();
        
        return NextResponse.json({
          success: true,
          message: 'All circuit breakers reset',
        });

      case 'stress-test':
        const { operations = 20, failureRate = 0.3 } = body;
        console.log(`🧪 Starting error recovery stress test: ${operations} operations, ${failureRate * 100}% failure rate`);

        const results = {
          successful: 0,
          failed: 0,
          recovered: 0,
          totalTime: 0,
          averageTime: 0,
        };

        const startTime = Date.now();
        const promises = Array.from({ length: operations }, (_, i) =>
          withErrorRecovery(
            async () => {
              const operationStart = Date.now();
              
              // Simulate operation with configurable failure rate
              if (Math.random() < failureRate) {
                throw new Error(`Simulated failure ${i + 1}`);
              }
              
              return {
                index: i,
                duration: Date.now() - operationStart,
                success: true,
              };
            },
            {
              retry: { maxRetries: 2, baseDelay: 50 },
              fallback: async () => ({ index: i, duration: 0, success: true }),
              context: `stress_test_${i}`,
            }
          ).then(result => {
            results.successful++;
            if (result.duration === 0) {
              results.recovered++;
            }
            return result;
          }).catch(() => {
            results.failed++;
            return null;
          })
        );

        const operationResults = await Promise.all(promises);
        const validResults = operationResults.filter(result => result !== null);

        results.totalTime = Date.now() - startTime;
        results.averageTime = validResults.length > 0 
          ? validResults.reduce((sum, result: any) => sum + (result.duration || 0), 0) / validResults.length 
          : 0;

        const finalHealth = errorRecoveryManager.getSystemHealth();

        return NextResponse.json({
          success: true,
          stressTest: results,
          finalHealth,
          summary: {
            operations: operations,
            successRate: `${((results.successful / operations) * 100).toFixed(1)}%`,
            recoveryRate: `${((results.recovered / operations) * 100).toFixed(1)}%`,
            averageOperationTime: `${results.averageTime.toFixed(0)}ms`,
            systemHealth: `${finalHealth.healthPercentage.toFixed(1)}%`,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Error recovery action failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error recovery action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
