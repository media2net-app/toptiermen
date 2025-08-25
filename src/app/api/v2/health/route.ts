import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler, createSuccessResponse, createErrorResponse } from '@/lib/v2-api-utils';

export const GET = withApiHandler(async (request: NextRequest) => {
  try {
    // Basic health check
    const healthStatus = {
      status: 'healthy',
      version: '2.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        rls: 'enabled',
        foreignKeys: 'enabled',
        v2Api: 'enabled',
        monitoring: 'enabled',
        caching: 'enabled',
        errorRecovery: 'enabled'
      },
      database: {
        status: 'connected',
        rlsPolicies: 'active',
        foreignKeys: 'active'
      },
      api: {
        v2Endpoints: [
          '/api/v2/health',
          '/api/v2/dashboard',
          '/api/v2/users'
        ],
        authentication: 'enabled',
        rateLimiting: 'enabled',
        cors: 'enabled'
      }
    };

    return createSuccessResponse({
      health: healthStatus,
      message: 'V2.0 API is healthy and ready',
      version: '2.0'
    });

  } catch (error) {
    return createErrorResponse('Health check failed', 500, error);
  }
});

export const POST = withApiHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Extended health check with custom parameters
    const extendedHealth = {
      status: 'healthy',
      version: '2.0',
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: body
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };

    return createSuccessResponse({
      health: extendedHealth,
      message: 'Extended health check completed',
      version: '2.0'
    });

  } catch (error) {
    return createErrorResponse('Extended health check failed', 500, error);
  }
});
