const { createClient } = require('@supabase/supabase-js');

// Hardcode the values for testing (these are public anyway)
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTAyNTUsImV4cCI6MjA2NTgyNjI1NX0.x3F0xVyufYUEk3PPTgNuonOrgI70OQan2mFd3wkIlKQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies on exercises table...');
  
  try {
    // Check if RLS is enabled
    const { data: rlsEnabled, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('row_security')
      .eq('table_name', 'exercises')
      .eq('table_schema', 'public')
      .single();
    
    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
      return;
    }
    
    console.log('📋 RLS enabled on exercises table:', rlsEnabled?.row_security);
    
    // Check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_name', 'exercises')
      .eq('table_schema', 'public');
    
    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
      return;
    }
    
    console.log('📋 RLS policies on exercises table:');
    policies?.forEach(policy => {
      console.log(`  - ${policy.policy_name}: ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'} ${policy.roles?.join(', ')}`);
      console.log(`    Command: ${policy.cmd}`);
      console.log(`    Definition: ${policy.qual}`);
    });
    
    if (!policies || policies.length === 0) {
      console.log('⚠️ No RLS policies found on exercises table');
    }
    
  } catch (err) {
    console.error('❌ Exception during RLS check:', err);
  }
}

checkRLSPolicies(); 