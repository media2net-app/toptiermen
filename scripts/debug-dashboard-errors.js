const fs = require('fs');
const path = require('path');

console.log('🔍 V2.0: Debugging Dashboard Errors...\n');

// Check for common error sources
const errorChecks = [
  {
    name: 'V2.0 Monitoring System',
    file: 'src/lib/v2-monitoring.ts',
    check: (content) => {
      const issues = [];
      if (content.includes('trackFeatureUsage') && !content.includes('process.env.NODE_ENV')) {
        issues.push('trackFeatureUsage not properly debounced');
      }
      if (content.includes('useEffect') && content.includes('trackFeatureUsage')) {
        issues.push('trackFeatureUsage in useEffect without proper dependencies');
      }
      return issues;
    }
  },
  {
    name: 'V2StateContext',
    file: 'src/contexts/V2StateContext.tsx',
    check: (content) => {
      const issues = [];
      if (content.includes('useCallback') && content.includes('state.')) {
        issues.push('useCallback with state dependencies may cause infinite loops');
      }
      if (content.includes('dispatch') && content.includes('useCallback')) {
        issues.push('dispatch in useCallback without proper dependencies');
      }
      return issues;
    }
  },
  {
    name: 'DashboardContent',
    file: 'src/app/dashboard/DashboardContent.tsx',
    check: (content) => {
      const issues = [];
      if (content.includes('trackFeatureUsage') && content.includes('onClick')) {
        issues.push('trackFeatureUsage in click handlers may cause issues');
      }
      if (content.includes('useEffect') && content.includes('trackFeatureUsage')) {
        issues.push('trackFeatureUsage in useEffect');
      }
      return issues;
    }
  },
  {
    name: 'V2MonitoringDashboard',
    file: 'src/components/V2MonitoringDashboard.tsx',
    check: (content) => {
      const issues = [];
      if (content.includes('useEffect') && content.includes('trackFeatureUsage')) {
        issues.push('trackFeatureUsage in useEffect may cause loops');
      }
      if (content.includes('setInterval') && content.includes('updateMetrics')) {
        issues.push('setInterval with updateMetrics may cause performance issues');
      }
      return issues;
    }
  }
];

// Run checks
let totalIssues = 0;

errorChecks.forEach(check => {
  try {
    const filePath = path.join(process.cwd(), check.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = check.check(content);
      
      if (issues.length > 0) {
        console.log(`❌ ${check.name}:`);
        issues.forEach(issue => {
          console.log(`   - ${issue}`);
          totalIssues++;
        });
      } else {
        console.log(`✅ ${check.name}: No issues found`);
      }
    } else {
      console.log(`⚠️  ${check.name}: File not found`);
    }
  } catch (error) {
    console.log(`❌ ${check.name}: Error reading file - ${error.message}`);
  }
});

console.log(`\n📊 Summary: ${totalIssues} potential issues found`);

if (totalIssues > 0) {
  console.log('\n🔧 Recommended fixes:');
  console.log('1. Ensure all trackFeatureUsage calls are properly debounced');
  console.log('2. Check useCallback dependencies for infinite loops');
  console.log('3. Verify useEffect dependencies are correct');
  console.log('4. Consider disabling tracking in development mode');
} else {
  console.log('\n✅ No obvious issues found in code analysis');
  console.log('The 49 errors may be runtime JavaScript errors');
  console.log('Check browser console for specific error messages');
}
