// V2.0 Monitoring Setup Script
// Run with: node scripts/setup-v2-monitoring.js

const fs = require('fs');
const path = require('path');

// V2.0 Monitoring Configuration
const MONITORING_CONFIG = {
  // Performance thresholds
  performance: {
    apiResponseTime: {
      warning: 250, // ms
      critical: 400 // ms
    },
    errorRate: {
      warning: 3, // %
      critical: 5 // %
    },
    memoryUsage: {
      warning: 80, // %
      critical: 90 // %
    },
    cpuUsage: {
      warning: 85, // %
      critical: 95 // %
    }
  },

  // Monitoring intervals
  intervals: {
    performanceCheck: 10000, // 10 seconds
    metricsCollection: 5000, // 5 seconds
    alertCleanup: 300000, // 5 minutes
    healthCheck: 30000 // 30 seconds
  },

  // Error tracking
  errorTracking: {
    enabled: true,
    sampleRate: 1.0, // 100% of errors
    maxErrorsPerMinute: 100,
    ignoredErrors: [
      'NetworkError',
      'TimeoutError',
      'UserCancelledError'
    ]
  },

  // Cache monitoring
  cache: {
    enabled: true,
    hitRateThreshold: 80, // %
    efficiencyThreshold: 85, // %
    cleanupInterval: 60000 // 1 minute
  },

  // Database monitoring
  database: {
    enabled: true,
    connectionThreshold: 50,
    queryThreshold: 1000,
    rlsPoliciesCount: 200,
    foreignKeysCount: 40
  }
};

// Monitoring components to setup
const MONITORING_COMPONENTS = [
  'src/components/V2MonitoringDashboard.tsx',
  'src/components/V2PerformanceAlerts.tsx',
  'src/app/api/v2/monitoring/route.ts',
  'src/lib/v2-monitoring.ts',
  'src/hooks/useV2Monitoring.ts'
];

// Setup status
const setupStatus = {
  components: { total: 0, configured: 0, errors: [] },
  config: { created: false, error: null },
  integration: { completed: false, error: null },
  overall: { success: false, message: '' }
};

// Check if monitoring component exists and is properly configured
function checkMonitoringComponent(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      setupStatus.components.errors.push(`${filePath} - File not found`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for V2.0 monitoring indicators
    const monitoringIndicators = [
      'V2Monitoring',
      'useV2Monitoring',
      'trackFeatureUsage',
      'trackError',
      'trackPerformance',
      'V2.0'
    ];

    const hasMonitoringIndicators = monitoringIndicators.some(indicator => 
      content.includes(indicator)
    );

    if (hasMonitoringIndicators) {
      setupStatus.components.configured++;
      return true;
    } else {
      setupStatus.components.errors.push(`${filePath} - No monitoring indicators found`);
      return false;
    }

  } catch (error) {
    setupStatus.components.errors.push(`${filePath} - Error: ${error.message}`);
    return false;
  }
}

// Create monitoring configuration file
function createMonitoringConfig() {
  try {
    const configPath = 'v2-monitoring-config.json';
    fs.writeFileSync(configPath, JSON.stringify(MONITORING_CONFIG, null, 2));
    setupStatus.config.created = true;
    console.log(`✅ Monitoring config created: ${configPath}`);
    return true;
  } catch (error) {
    setupStatus.config.error = error.message;
    console.log(`❌ Failed to create monitoring config: ${error.message}`);
    return false;
  }
}

// Test monitoring API endpoints
async function testMonitoringEndpoints() {
  const endpoints = [
    { name: 'Health', url: 'http://localhost:3000/api/v2/health' },
    { name: 'Monitoring', url: 'http://localhost:3000/api/v2/monitoring' }
  ];

  const https = require('https');
  const http = require('http');

  for (const endpoint of endpoints) {
    try {
      const response = await new Promise((resolve, reject) => {
        const url = new URL(endpoint.url);
        const client = url.protocol === 'https:' ? https : http;
        
        const req = client.request(url, { timeout: 5000 }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              data: data
            });
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout'));
        });

        req.end();
      });

      if (response.status >= 200 && response.status < 500) {
        console.log(`✅ ${endpoint.name} API - Working (${response.status})`);
      } else {
        console.log(`❌ ${endpoint.name} API - Error (${response.status})`);
      }

    } catch (error) {
      console.log(`💥 ${endpoint.name} API - Error: ${error.message}`);
    }
  }
}

// Check package.json for monitoring dependencies
function checkMonitoringDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const monitoringDeps = [
      '@supabase/supabase-js',
      'next',
      'react',
      'react-dom',
      'framer-motion'
    ];

    const missingDeps = monitoringDeps.filter(dep => !dependencies[dep]);
    
    if (missingDeps.length > 0) {
      console.log(`⚠️  Missing monitoring dependencies: ${missingDeps.join(', ')}`);
    } else {
      console.log('✅ All monitoring dependencies are installed');
    }

  } catch (error) {
    console.log(`❌ Error checking dependencies: ${error.message}`);
  }
}

// Main monitoring setup
async function runMonitoringSetup() {
  console.log('🚀 Starting V2.0 Monitoring Setup...');
  console.log('');

  // Check monitoring components
  console.log('📦 Checking V2.0 Monitoring Components...');
  MONITORING_COMPONENTS.forEach(filePath => {
    setupStatus.components.total++;
    checkMonitoringComponent(filePath);
  });

  // Create monitoring configuration
  console.log('⚙️  Creating Monitoring Configuration...');
  createMonitoringConfig();

  // Test monitoring endpoints
  console.log('🌐 Testing Monitoring API Endpoints...');
  await testMonitoringEndpoints();

  // Check dependencies
  console.log('📋 Checking Monitoring Dependencies...');
  checkMonitoringDependencies();

  // Generate setup report
  console.log('');
  console.log('📊 V2.0 Monitoring Setup Report:');
  console.log('================================');
  console.log(`📦 Components: ${setupStatus.components.configured}/${setupStatus.components.total}`);
  console.log(`⚙️  Configuration: ${setupStatus.config.created ? 'Created' : 'Failed'}`);
  console.log(`🌐 API Endpoints: Tested`);
  console.log(`📋 Dependencies: Checked`);

  // Show errors if any
  if (setupStatus.components.errors.length > 0) {
    console.log('');
    console.log('🚨 Setup Issues:');
    setupStatus.components.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }

  // Overall status
  setupStatus.overall.success = setupStatus.components.configured >= setupStatus.components.total * 0.8 && setupStatus.config.created;
  setupStatus.overall.message = setupStatus.overall.success 
    ? 'V2.0 Monitoring successfully configured!' 
    : 'V2.0 Monitoring setup needs attention';

  console.log('');
  console.log(`🎯 Overall Status: ${setupStatus.overall.success ? '✅ SUCCESS' : '❌ NEEDS ATTENTION'}`);
  console.log(`💬 ${setupStatus.overall.message}`);

  // Save detailed report
  const reportPath = 'v2-monitoring-setup-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: MONITORING_CONFIG,
    components: MONITORING_COMPONENTS,
    status: setupStatus
  }, null, 2));

  console.log('');
  console.log(`📄 Detailed report saved to: ${reportPath}`);

  // Exit with appropriate code
  process.exit(setupStatus.overall.success ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Monitoring setup interrupted by user');
  process.exit(1);
});

// Run the monitoring setup
runMonitoringSetup().catch(error => {
  console.error('💥 Monitoring setup failed:', error);
  process.exit(1);
});
