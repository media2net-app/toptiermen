const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// V2.0: RLS Policy Audit Script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ V2.0: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditRLSPolicies() {
  console.log('🔍 V2.0: Starting RLS Policy Audit...\n');

  try {
    // V2.0: Get all tables using raw SQL query
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_all_tables');

    if (tablesError) {
      // Fallback: use direct SQL query
      const { data: tablesData, error: fallbackError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      if (fallbackError) {
        console.error('❌ Error fetching tables:', fallbackError);
        return;
      }
      
      tables = tablesData;
    }

    console.log(`📋 Found ${tables.length} tables in database\n`);

    const auditResults = {
      totalTables: tables.length,
      rlsEnabled: 0,
      rlsDisabled: 0,
      insecurePolicies: [],
      missingPolicies: [],
      recommendations: []
    };

    // V2.0: Check each table for RLS policies
    for (const table of tables) {
      const tableName = table.tablename || table.table_name;
      
      // Check if RLS is enabled using pg_policies
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', tableName)
        .eq('schemaname', 'public');

      if (policiesError) {
        console.log(`⚠️  Could not check RLS for ${tableName}: ${policiesError.message}`);
        continue;
      }

      const hasRLS = policies.length > 0;
      console.log(`${hasRLS ? '✅' : '❌'} ${tableName}: RLS ${hasRLS ? 'ENABLED' : 'DISABLED'} (${policies.length} policies)`);
      
      if (hasRLS) {
        auditResults.rlsEnabled++;
        
        // Check for insecure policies
        policies.forEach(policy => {
          const policyDef = policy.cmd || '';
          const policyName = policy.policyname;
          
          // Check for overly permissive policies
          if (policyDef.includes('true') || policyDef.includes('USING (true)')) {
            auditResults.insecurePolicies.push({
              table: tableName,
              policy: policyName,
              definition: policyDef,
              severity: 'CRITICAL'
            });
          }
          
          // Check for missing auth checks
          if (!policyDef.includes('auth.role()') && !policyDef.includes('auth.uid()')) {
            auditResults.insecurePolicies.push({
              table: tableName,
              policy: policyName,
              definition: policyDef,
              severity: 'HIGH'
            });
          }
        });
      } else {
        auditResults.rlsDisabled++;
        
        // Check if table should have RLS
        const shouldHaveRLS = [
          'users', 'user_profiles', 'user_badges', 'user_module_progress',
          'todo_tasks', 'push_subscriptions', 'chat_messages', 'workout_sessions',
          'nutrition_plans', 'meals', 'training_schemas'
        ];
        
        if (shouldHaveRLS.includes(tableName)) {
          auditResults.missingPolicies.push({
            table: tableName,
            reason: 'Contains user-specific data'
          });
        }
      }
    }

    // Generate recommendations
    console.log('\n📊 V2.0: RLS Audit Results:');
    console.log('=====================================');
    console.log(`Total Tables: ${auditResults.totalTables}`);
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
        console.log(`Issue: ${policy.severity === 'CRITICAL' ? 'Overly permissive (USING true)' : 'Missing auth checks'}`);
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

  } catch (error) {
    console.error('❌ V2.0: RLS Audit failed:', error);
    return null;
  }
}

// Run the audit
auditRLSPolicies().then(results => {
  if (results) {
    console.log('\n✅ V2.0: RLS Audit completed successfully!');
    console.log(`Found ${results.insecurePolicies.length} security issues to fix.`);
  } else {
    console.log('\n❌ V2.0: RLS Audit failed!');
  }
  process.exit(0);
});
