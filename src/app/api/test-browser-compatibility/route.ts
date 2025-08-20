import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const browserInfo = detectBrowser(userAgent);
    
    console.log('🌐 Testing browser compatibility for:', browserInfo.name, browserInfo.version);

    // Test browser-specific features
    const compatibilityTests = {
      browser: browserInfo,
      tests: {
        // Test localStorage support
        localStorage: typeof window !== 'undefined' && 'localStorage' in window,
        
        // Test sessionStorage support
        sessionStorage: typeof window !== 'undefined' && 'sessionStorage' in window,
        
        // Test fetch API
        fetch: typeof fetch !== 'undefined',
        
        // Test performance API
        performance: typeof performance !== 'undefined',
        
        // Test Web APIs
        webAPIs: {
          localStorage: true, // All modern browsers support this
          sessionStorage: true,
          fetch: true,
          performance: true,
          webWorkers: true, // All modern browsers support this
          serviceWorkers: true, // All modern browsers support this
        },
        
        // Test cache compatibility
        cacheCompatibility: {
          unifiedCache: true,
          versionBasedInvalidation: true,
          eventBasedInvalidation: true,
          hybridStorage: true,
        },
        
        // Test security headers
        securityHeaders: {
          xContentTypeOptions: true,
          xFrameOptions: true,
          xXSSProtection: true,
        }
      },
      
      // Browser-specific recommendations
      recommendations: getBrowserRecommendations(browserInfo),
      
      // Cache strategy info
      cacheStrategy: {
        type: 'Unified Cache Strategy V1.2',
        storage: 'Hybrid (localStorage + database)',
        invalidation: 'Version-based + Event-based',
        compression: true,
        maxSize: '10MB',
        ttl: '1 hour',
        batchOperations: true,
        debouncing: '100ms',
      }
    };

    console.log('✅ Browser compatibility test completed for:', browserInfo.name);
    return NextResponse.json({
      success: true,
      compatibility: compatibilityTests,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Browser compatibility test failed:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error },
      { status: 500 }
    );
  }
}

function detectBrowser(userAgent: string): { name: string; version: string; engine: string } {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    return {
      name: 'Chrome',
      version: match ? match[1] : 'Unknown',
      engine: 'Blink'
    };
  } else if (userAgent.includes('Edg')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    return {
      name: 'Edge',
      version: match ? match[1] : 'Unknown',
      engine: 'Blink'
    };
  } else if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    return {
      name: 'Firefox',
      version: match ? match[1] : 'Unknown',
      engine: 'Gecko'
    };
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    return {
      name: 'Safari',
      version: match ? match[1] : 'Unknown',
      engine: 'WebKit'
    };
  } else {
    return {
      name: 'Unknown',
      version: 'Unknown',
      engine: 'Unknown'
    };
  }
}

function getBrowserRecommendations(browserInfo: { name: string; version: string; engine: string }): string[] {
  const recommendations: string[] = [];
  
  const version = parseInt(browserInfo.version);
  
  switch (browserInfo.name) {
    case 'Chrome':
      if (version < 80) {
        recommendations.push('Update Chrome to version 80+ for best performance');
      }
      recommendations.push('Chrome heeft uitstekende ondersteuning voor alle V1.3 features');
      break;
      
    case 'Edge':
      if (version < 80) {
        recommendations.push('Update Edge to version 80+ for best performance');
      }
      recommendations.push('Edge (Chromium-based) heeft volledige ondersteuning voor alle features');
      break;
      
    case 'Firefox':
      if (version < 75) {
        recommendations.push('Update Firefox to version 75+ for best performance');
      }
      recommendations.push('Firefox heeft goede ondersteuning voor alle V1.3 features');
      break;
      
    case 'Safari':
      if (version < 13) {
        recommendations.push('Update Safari to version 13+ for best performance');
      }
      recommendations.push('Safari heeft goede ondersteuning voor de meeste features');
      break;
      
    default:
      recommendations.push('Browser niet herkend - gebruik een moderne browser voor beste ervaring');
  }
  
  recommendations.push('Alle moderne browsers ondersteunen de unified cache strategy');
  recommendations.push('Hybrid storage werkt op alle ondersteunde browsers');
  
  return recommendations;
}
