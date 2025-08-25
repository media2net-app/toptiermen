// V2.0 Systems Integration Script
// Run with: node scripts/integrate-v2-systems.js

const fs = require('fs');
const path = require('path');

// V2.0 Integration configuration
const V2_INTEGRATION_CONFIG = {
  components: [
    'src/app/layout.tsx',
    'src/app/dashboard/layout.tsx',
    'src/app/dashboard/DashboardContent.tsx',
    'src/contexts/V2StateContext.tsx',
    'src/lib/v2-api-utils.ts',
    'src/lib/v2-cache-strategy.ts',
    'src/lib/v2-error-recovery.ts',
    'src/lib/v2-monitoring.ts',
    'src/hooks/useV2Dashboard.ts',
    'src/app/api/v2/health/route.ts',
    'src/app/api/v2/dashboard/route.ts',
    'src/app/api/v2/users/route.ts'
  ],
  hooks: [
    'src/hooks/useV2State.ts',
    'src/hooks/useV2Cache.ts',
    'src/hooks/useV2ErrorRecovery.ts',
    'src/hooks/useV2Monitoring.ts'
  ],
  utils: [
    'src/lib/v2-api-utils.ts',
    'src/lib/v2-cache-strategy.ts',
    'src/lib/v2-error-recovery.ts',
    'src/lib/v2-monitoring.ts'
  ]
};

// Integration status
const integrationStatus = {
  components: { total: 0, integrated: 0, errors: [] },
  hooks: { total: 0, integrated: 0, errors: [] },
  utils: { total: 0, integrated: 0, errors: [] },
  api: { total: 0, working: 0, errors: [] },
  overall: { success: false, message: '' }
};

// Check if file exists and is properly integrated
function checkFileIntegration(filePath, category) {
  try {
    if (!fs.existsSync(filePath)) {
      integrationStatus[category].errors.push(`${filePath} - File not found`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for V2.0 indicators
    const v2Indicators = [
      'V2.0',
      'v2-',
      'V2State',
      'V2Cache',
      'V2Error',
      'V2Monitoring',
      'withApiHandler',
      'createSuccessResponse',
      'createErrorResponse'
    ];

    const hasV2Indicators = v2Indicators.some(indicator => 
      content.includes(indicator)
    );

    if (hasV2Indicators) {
      integrationStatus[category].integrated++;
      return true;
    } else {
      integrationStatus[category].errors.push(`${filePath} - No V2.0 indicators found`);
      return false;
    }

  } catch (error) {
    integrationStatus[category].errors.push(`${filePath} - Error: ${error.message}`);
    return false;
  }
}

// Test V2.0 API endpoints
async function testV2ApiEndpoints() {
  const endpoints = [
    { name: 'Health', url: 'http://localhost:3000/api/v2/health' },
    { name: 'Dashboard', url: 'http://localhost:3000/api/v2/dashboard' },
    { name: 'Users', url: 'http://localhost:3000/api/v2/users' }
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

      // Consider 401/403 as "working" (authentication required)
      if (response.status >= 200 && response.status < 500) {
        integrationStatus.api.working++;
        console.log(`✅ ${endpoint.name} API - Working (${response.status})`);
      } else {
        integrationStatus.api.errors.push(`${endpoint.name} - HTTP ${response.status}`);
        console.log(`❌ ${endpoint.name} API - Error (${response.status})`);
      }

    } catch (error) {
      integrationStatus.api.errors.push(`${endpoint.name} - ${error.message}`);
      console.log(`💥 ${endpoint.name} API - Error: ${error.message}`);
    }
  }
}

// Check package.json for V2.0 dependencies
function checkDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      '@supabase/supabase-js',
      'next',
      'react',
      'react-dom'
    ];

    const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
    
    if (missingDeps.length > 0) {
      console.log(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
    } else {
      console.log('✅ All required dependencies are installed');
    }

  } catch (error) {
    console.log(`❌ Error checking dependencies: ${error.message}`);
  }
}

// Check environment variables
function checkEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.log(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
  } else {
    console.log('✅ Environment variables are configured');
  }
}

// Main integration check
async function runIntegrationCheck() {
  console.log('🚀 Starting V2.0 Systems Integration Check...');
  console.log('');

  // Check components
  console.log('📦 Checking V2.0 Components...');
  V2_INTEGRATION_CONFIG.components.forEach(filePath => {
    integrationStatus.components.total++;
    checkFileIntegration(filePath, 'components');
  });

  // Check hooks
  console.log('🎣 Checking V2.0 Hooks...');
  V2_INTEGRATION_CONFIG.hooks.forEach(filePath => {
    integrationStatus.hooks.total++;
    checkFileIntegration(filePath, 'hooks');
  });

  // Check utils
  console.log('🔧 Checking V2.0 Utils...');
  V2_INTEGRATION_CONFIG.utils.forEach(filePath => {
    integrationStatus.utils.total++;
    checkFileIntegration(filePath, 'utils');
  });

  // Test API endpoints
  console.log('🌐 Testing V2.0 API Endpoints...');
  integrationStatus.api.total = 3;
  await testV2ApiEndpoints();

  // Check dependencies and environment
  console.log('📋 Checking Dependencies...');
  checkDependencies();
  
  console.log('🔐 Checking Environment...');
  checkEnvironment();

  // Generate integration report
  console.log('');
  console.log('📊 V2.0 Integration Report:');
  console.log('==========================');
  console.log(`📦 Components: ${integrationStatus.components.integrated}/${integrationStatus.components.total}`);
  console.log(`🎣 Hooks: ${integrationStatus.hooks.integrated}/${integrationStatus.hooks.total}`);
  console.log(`🔧 Utils: ${integrationStatus.utils.integrated}/${integrationStatus.utils.total}`);
  console.log(`🌐 API Endpoints: ${integrationStatus.api.working}/${integrationStatus.api.total}`);

  // Calculate overall success
  const totalFiles = integrationStatus.components.total + integrationStatus.hooks.total + integrationStatus.utils.total;
  const integratedFiles = integrationStatus.components.integrated + integrationStatus.hooks.integrated + integrationStatus.utils.integrated;
  const successRate = (integratedFiles / totalFiles) * 100;

  console.log(`📈 Integration Success Rate: ${successRate.toFixed(1)}%`);

  // Show errors if any
  const allErrors = [
    ...integrationStatus.components.errors,
    ...integrationStatus.hooks.errors,
    ...integrationStatus.utils.errors,
    ...integrationStatus.api.errors
  ];

  if (allErrors.length > 0) {
    console.log('');
    console.log('🚨 Integration Issues:');
    allErrors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }

  // Overall status
  integrationStatus.overall.success = successRate >= 80 && integrationStatus.api.working >= 2;
  integrationStatus.overall.message = integrationStatus.overall.success 
    ? 'V2.0 Systems successfully integrated!' 
    : 'V2.0 Integration needs attention';

  console.log('');
  console.log(`🎯 Overall Status: ${integrationStatus.overall.success ? '✅ SUCCESS' : '❌ NEEDS ATTENTION'}`);
  console.log(`💬 ${integrationStatus.overall.message}`);

  // Save detailed report
  const reportPath = 'v2-integration-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    status: integrationStatus,
    config: V2_INTEGRATION_CONFIG
  }, null, 2));

  console.log('');
  console.log(`📄 Detailed report saved to: ${reportPath}`);

  // Exit with appropriate code
  process.exit(integrationStatus.overall.success ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Integration check interrupted by user');
  process.exit(1);
});

// Run the integration check
runIntegrationCheck().catch(error => {
  console.error('💥 Integration check failed:', error);
  process.exit(1);
});
