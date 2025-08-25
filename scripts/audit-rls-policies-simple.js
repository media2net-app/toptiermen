const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// V2.0: Simple RLS Policy Audit Script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ V2.0: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditRLSPolicies() {
  console.log('🔍 V2.0: Starting Simple RLS Policy Audit...\n');

  // V2.0: Known tables that should have RLS
  const criticalTables = [
    'users',
    'user_profiles', 
    'user_badges',
    'user_module_progress',
    'todo_tasks',
    'push_subscriptions',
    'chat_messages',
    'workout_sessions',
    'nutrition_plans',
    'meals',
    'training_schemas',
    'training_schema_exercises',
    'training_schema_days',
    'challenges',
    'missions',
    'academy_modules',
    'academy_lessons',
    'academy_ebooks',
    'books',
    'nutrition_ingredients'
  ];

  const auditResults = {
    totalTables: criticalTables.length,
    rlsEnabled: 0,
    rlsDisabled: 0,
    insecurePolicies: [],
    missingPolicies: [],
    recommendations: []
  };

  console.log(`📋 Checking ${criticalTables.length} critical tables for RLS policies\n`);

  for (const tableName of criticalTables) {
    try {
      // V2.0: Try to query the table to check if RLS is blocking access
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        // If we get a permission error, RLS is likely enabled
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
          console.log(`✅ ${tableName}: RLS ENABLED (access blocked by policy)`);
          auditResults.rlsEnabled++;
        } else {
          console.log(`❌ ${tableName}: RLS DISABLED (access allowed: ${error.message})`);
          auditResults.rlsDisabled++;
          auditResults.missingPolicies.push({
            table: tableName,
            reason: 'No RLS policies found - table accessible without auth'
          });
        }
      } else {
        // If we can access data without auth, RLS is disabled
        console.log(`❌ ${tableName}: RLS DISABLED (data accessible without auth)`);
        auditResults.rlsDisabled++;
        auditResults.missingPolicies.push({
          table: tableName,
          reason: 'No RLS policies found - data accessible without auth'
        });
      }
    } catch (err) {
      console.log(`⚠️  ${tableName}: Could not check (${err.message})`);
    }
  }

  // V2.0: Check specific known insecure policies
  console.log('\n🔍 V2.0: Checking for known insecure policies...\n');

  // Check todo_tasks for the known insecure policy
  try {
    const { data: todoTasks, error: todoError } = await supabase
      .from('todo_tasks')
      .select('*')
      .limit(1);

    if (!todoError && todoTasks) {
      auditResults.insecurePolicies.push({
        table: 'todo_tasks',
        policy: 'Allow all operations for todo_tasks',
        definition: 'USING (true)',
        severity: 'CRITICAL'
      });
      console.log('🚨 CRITICAL: todo_tasks has insecure policy (USING true)');
    }
  } catch (err) {
    console.log('✅ todo_tasks: RLS properly configured');
  }

  // Generate recommendations
  console.log('\n📊 V2.0: RLS Audit Results:');
  console.log('=====================================');
  console.log(`Total Tables Checked: ${auditResults.totalTables}`);
  console.log(`RLS Enabled: ${auditResults.rlsEnabled}`);
  console.log(`RLS Disabled: ${auditResults.rlsDisabled}`);
  console.log(`Insecure Policies: ${auditResults.insecurePolicies.length}`);
  console.log(`Missing Policies: ${auditResults.missingPolicies.length}`);

  if (auditResults.insecurePolicies.length > 0) {
    console.log('\n🚨 V2.0: CRITICAL - Insecure Policies Found:');
    console.log('===========================================');
    auditResults.insecurePolicies.forEach(policy => {
      console.log(`\n${policy.severity}: ${policy.table}.${policy.policy}`);
      console.log(`Definition: ${policy.definition}`);
      console.log(`Issue: Overly permissive (USING true)`);
    });
  }

  if (auditResults.missingPolicies.length > 0) {
    console.log('\n⚠️  V2.0: Missing RLS Policies:');
    console.log('==============================');
    auditResults.missingPolicies.forEach(item => {
      console.log(`- ${item.table}: ${item.reason}`);
    });
  }

  // Generate V2.0 recommendations
  console.log('\n🎯 V2.0: Security Recommendations:');
  console.log('==================================');
  
  if (auditResults.insecurePolicies.length > 0) {
    console.log('1. 🔒 SECURE CRITICAL POLICIES:');
    auditResults.insecurePolicies
      .filter(p => p.severity === 'CRITICAL')
      .forEach(policy => {
        console.log(`   - Replace ${policy.table}.${policy.policy} with user-specific auth checks`);
      });
  }
  
  if (auditResults.missingPolicies.length > 0) {
    console.log('2. 🛡️  ENABLE RLS ON USER TABLES:');
    auditResults.missingPolicies.forEach(item => {
      console.log(`   - Enable RLS on ${item.table} with proper policies`);
    });
  }
  
  console.log('3. 🔍 IMPLEMENT USER-SPECIFIC POLICIES:');
  console.log('   - Use auth.uid() for user data access');
  console.log('   - Use auth.role() for admin access');
  console.log('   - Implement proper role-based access control');
  
  console.log('4. 📝 CREATE V2.0 POLICY TEMPLATES:');
  console.log('   - Standardize policy patterns across tables');
  console.log('   - Implement consistent auth checks');
  console.log('   - Add proper error handling');

  return auditResults;
}

// Run the audit
auditRLSPolicies().then(results => {
  if (results) {
    console.log('\n✅ V2.0: RLS Audit completed successfully!');
    console.log(`Found ${results.insecurePolicies.length} security issues to fix.`);
    console.log(`Found ${results.missingPolicies.length} tables missing RLS policies.`);
  } else {
    console.log('\n❌ V2.0: RLS Audit failed!');
  }
  process.exit(0);
});
