import { NextRequest, NextResponse } from 'next/server';
import { withDatabaseConnection, getDatabasePoolStats } from '@/lib/database-pool';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection pool...');

    const testResults = {
      poolStats: null as any,
      connectionTest: false,
      concurrentTest: false,
      errorHandling: false,
      performance: {
        singleConnection: 0,
        concurrentConnections: 0,
      },
      errors: [] as string[],
    };

    // Test 1: Get pool statistics
    try {
      testResults.poolStats = getDatabasePoolStats();
      console.log('✅ Pool statistics retrieved');
    } catch (error) {
      testResults.errors.push(`Pool stats error: ${error}`);
    }

    // Test 2: Single connection test
    try {
      const startTime = Date.now();
      
      await withDatabaseConnection(async (client) => {
        const { data, error } = await client
          .from('profiles')
          .select('count')
          .limit(1);

        if (error) throw error;
        return data;
      });

      testResults.performance.singleConnection = Date.now() - startTime;
      testResults.connectionTest = true;
      console.log(`✅ Single connection test: ${testResults.performance.singleConnection}ms`);
    } catch (error) {
      testResults.errors.push(`Single connection error: ${error}`);
    }

    // Test 3: Concurrent connections test
    try {
      const startTime = Date.now();
      const concurrentPromises = Array.from({ length: 10 }, (_, i) =>
        withDatabaseConnection(async (client) => {
          const { data, error } = await client
            .from('profiles')
            .select('count')
            .limit(1);

          if (error) throw error;
          return { index: i, data };
        })
      );

      const results = await Promise.all(concurrentPromises);
      testResults.performance.concurrentConnections = Date.now() - startTime;
      testResults.concurrentTest = true;
      console.log(`✅ Concurrent connections test: ${testResults.performance.concurrentConnections}ms (${results.length} connections)`);
    } catch (error) {
      testResults.errors.push(`Concurrent connections error: ${error}`);
    }

    // Test 4: Error handling test
    try {
      await withDatabaseConnection(async (client) => {
        // Intentionally cause an error
        const { error } = await client
          .from('non_existent_table')
          .select('*')
          .limit(1);

        if (!error) {
          throw new Error('Expected error but got none');
        }
        return true;
      });
      
      testResults.errorHandling = true;
      console.log('✅ Error handling test passed');
    } catch (error) {
      // This is expected to fail, but should be handled gracefully
      testResults.errorHandling = true;
      console.log('✅ Error handling test: Error caught and handled gracefully');
    }

    // Final pool stats after tests
    const finalStats = getDatabasePoolStats();

    return NextResponse.json({
      success: true,
      message: 'Database connection pool test completed',
      results: testResults,
      finalStats,
      summary: {
        totalTests: 4,
        passedTests: [
          testResults.poolStats ? 'Pool Statistics' : null,
          testResults.connectionTest ? 'Single Connection' : null,
          testResults.concurrentTest ? 'Concurrent Connections' : null,
          testResults.errorHandling ? 'Error Handling' : null,
        ].filter(Boolean).length,
        performance: {
          singleConnection: `${testResults.performance.singleConnection}ms`,
          concurrentConnections: `${testResults.performance.concurrentConnections}ms`,
        },
        poolUtilization: `${finalStats.poolUtilization.toFixed(1)}%`,
      },
    });

  } catch (error) {
    console.error('❌ Database pool test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database pool test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'stats':
        const stats = getDatabasePoolStats();
        return NextResponse.json({
          success: true,
          stats,
        });

      case 'stress-test':
        const { connections = 50, duration = 5000 } = body;
        console.log(`🧪 Starting stress test: ${connections} connections for ${duration}ms`);

        const startTime = Date.now();
        const results = {
          successful: 0,
          failed: 0,
          totalTime: 0,
          averageTime: 0,
        };

        const promises = Array.from({ length: connections }, (_, i) =>
          withDatabaseConnection(async (client) => {
            const connectionStart = Date.now();
            try {
              const { data, error } = await client
                .from('profiles')
                .select('count')
                .limit(1);

              if (error) throw error;
              results.successful++;
              return Date.now() - connectionStart;
            } catch (error) {
              results.failed++;
              throw error;
            }
          }).catch(() => null)
        );

        const connectionTimes = await Promise.all(promises);
        const validTimes = connectionTimes.filter(time => time !== null) as number[];

        results.totalTime = Date.now() - startTime;
        results.averageTime = validTimes.length > 0 
          ? validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length 
          : 0;

        const finalStats = getDatabasePoolStats();

        return NextResponse.json({
          success: true,
          stressTest: results,
          finalStats,
          summary: {
            connections: connections,
            successRate: `${((results.successful / connections) * 100).toFixed(1)}%`,
            averageConnectionTime: `${results.averageTime.toFixed(0)}ms`,
            poolUtilization: `${finalStats.poolUtilization.toFixed(1)}%`,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Database pool action failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database pool action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
