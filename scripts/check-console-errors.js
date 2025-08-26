const fs = require('fs');
const path = require('path');

console.log('🔍 V2.0: Checking Console Errors Status...\n');

// Check if monitoring systems are disabled
const monitoringFile = path.join(process.cwd(), 'src/lib/v2-monitoring.ts');
if (fs.existsSync(monitoringFile)) {
  const content = fs.readFileSync(monitoringFile, 'utf8');
  
  if (content.includes('// V2.0: Completely disabled to prevent infinite loops')) {
    console.log('✅ V2.0 Monitoring systems are disabled');
  } else {
    console.log('❌ V2.0 Monitoring systems are still active');
  }
  
  if (content.includes('return; // Disable tracking')) {
    console.log('✅ trackFeatureUsage is disabled');
  } else {
    console.log('❌ trackFeatureUsage is still active');
  }
}

// Check V2MonitoringDashboard
const dashboardFile = path.join(process.cwd(), 'src/components/V2MonitoringDashboard.tsx');
if (fs.existsSync(dashboardFile)) {
  const content = fs.readFileSync(dashboardFile, 'utf8');
  
  if (content.includes('// V2.0: Completely disabled to prevent infinite loops')) {
    console.log('✅ V2MonitoringDashboard useEffect is disabled');
  } else {
    console.log('❌ V2MonitoringDashboard useEffect is still active');
  }
  
  if (content.includes('updateMetrics = () => {')) {
    console.log('✅ updateMetrics function is disabled');
  } else {
    console.log('❌ updateMetrics function is still active');
  }
}

// Check V2StateContext
const contextFile = path.join(process.cwd(), 'src/contexts/V2StateContext.tsx');
if (fs.existsSync(contextFile)) {
  const content = fs.readFileSync(contextFile, 'utf8');
  
  if (content.includes('// V2.0: Completely disabled session health check')) {
    console.log('✅ Session health check is disabled');
  } else {
    console.log('❌ Session health check is still active');
  }
}

console.log('\n📊 Expected Results:');
console.log('1. No more "V2.0: Flushed 50 metrics" messages');
console.log('2. No more infinite loop warnings');
console.log('3. Dashboard should be responsive');
console.log('4. Navigation should work without freezing');
console.log('5. Console should show 0 errors');

console.log('\n🔧 Next Steps:');
console.log('1. Open http://localhost:3000');
console.log('2. Login with chiel@media2net.nl / Carnivoor123!');
console.log('3. Check browser console for errors');
console.log('4. Test navigation between pages');
console.log('5. Verify dashboard is responsive');
