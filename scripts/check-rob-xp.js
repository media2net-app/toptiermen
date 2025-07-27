const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qwblryvtwzjqajfkvsya.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YmxyeXZ0d3pqcWFqZmt2c3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTE0ODI3MSwiZXhwIjoyMDI0NzI0MjcxfQ.DmI8yF5WFKZ2lWbVzUUjGQs-Y9nGo8pNm2QTQE8I3x8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRobXP() {
  console.log('🔍 Checking Rob\'s XP status...\n');

  try {
    // Step 1: Find Rob's user ID
    console.log('📋 Step 1: Finding Rob\'s user ID...');
    const { data: robUser, error: userError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .eq('email', 'rob@media2net.nl')
      .single();

    if (userError) {
      console.error('❌ Error finding Rob:', userError);
      return;
    }

    if (!robUser) {
      console.error('❌ Rob user not found');
      return;
    }

    console.log('✅ Found Rob:', {
      id: robUser.id,
      email: robUser.email,
      created_at: robUser.created_at
    });

    // Step 2: Check if user_xp table exists and has Rob's record
    console.log('\n📋 Step 2: Checking user_xp table...');
    
    // First, check if the table exists
    const { data: tableCheck, error: tableError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_xp'
          );
        `
      });

    if (tableError) {
      console.error('❌ Error checking table existence:', tableError);
    } else {
      console.log('✅ user_xp table exists:', tableCheck);
    }

    // Check Rob's XP record
    const { data: robXP, error: xpError } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', robUser.id)
      .single();

    if (xpError) {
      if (xpError.code === 'PGRST116') {
        console.log('⚠️  Rob has no XP record - creating one...');
        
        // Create XP record for Rob
        const { data: newXP, error: createError } = await supabase
          .from('user_xp')
          .insert({
            user_id: robUser.id,
            total_xp: 0,
            current_rank_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating XP record:', createError);
        } else {
          console.log('✅ Created XP record for Rob:', newXP);
        }
      } else {
        console.error('❌ Error checking Rob\'s XP:', xpError);
      }
    } else {
      console.log('✅ Rob\'s XP record found:', robXP);
    }

    // Step 3: Check XP transactions
    console.log('\n📋 Step 3: Checking XP transactions...');
    const { data: transactions, error: txError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', robUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) {
      console.error('❌ Error checking transactions:', txError);
    } else {
      console.log(`✅ Found ${transactions?.length || 0} XP transactions for Rob`);
      if (transactions && transactions.length > 0) {
        console.log('📊 Recent transactions:');
        transactions.forEach((tx, index) => {
          console.log(`  ${index + 1}. ${tx.xp_amount} XP - ${tx.description} (${tx.created_at})`);
        });
      }
    }

    // Step 4: Check missions
    console.log('\n📋 Step 4: Checking Rob\'s missions...');
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', robUser.id);

    if (missionsError) {
      console.error('❌ Error checking missions:', missionsError);
    } else {
      console.log(`✅ Found ${missions?.length || 0} missions for Rob`);
      if (missions && missions.length > 0) {
        console.log('📋 Rob\'s missions:');
        missions.forEach((mission, index) => {
          console.log(`  ${index + 1}. ${mission.title} (${mission.xp_reward} XP) - Status: ${mission.status}`);
        });
      }
    }

    // Step 5: Test XP update functionality
    console.log('\n📋 Step 5: Testing XP update functionality...');
    
    // Try to update XP using the same method as the missions API
    const testXP = 50;
    const { data: updateResult, error: updateError } = await supabase
      .rpc('exec_sql', {
        sql_query: `UPDATE user_xp SET total_xp = total_xp + ${testXP}, updated_at = NOW() WHERE user_id = '${robUser.id}' RETURNING total_xp;`
      });

    if (updateError) {
      console.error('❌ Error updating XP:', updateError);
    } else {
      console.log('✅ XP update test successful:', updateResult);
    }

    // Step 6: Check RLS policies
    console.log('\n📋 Step 6: Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies 
          WHERE tablename = 'user_xp';
        `
      });

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log('✅ RLS policies for user_xp table:');
      if (policies && policies.length > 0) {
        policies.forEach((policy, index) => {
          console.log(`  ${index + 1}. ${policy.policyname} - ${policy.cmd} - ${policy.qual}`);
        });
      } else {
        console.log('  ⚠️  No RLS policies found for user_xp table');
      }
    }

    // Step 7: Check if exec_sql function exists
    console.log('\n📋 Step 7: Checking exec_sql function...');
    const { data: functionCheck, error: functionError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT routine_name, routine_type 
          FROM information_schema.routines 
          WHERE routine_name = 'exec_sql';
        `
      });

    if (functionError) {
      console.error('❌ exec_sql function not available:', functionError);
    } else {
      console.log('✅ exec_sql function exists:', functionCheck);
    }

    // Step 8: Check current XP after test
    console.log('\n📋 Step 8: Final XP check...');
    const { data: finalXP, error: finalError } = await supabase
      .from('user_xp')
      .select('total_xp, current_rank_id, updated_at')
      .eq('user_id', robUser.id)
      .single();

    if (finalError) {
      console.error('❌ Error getting final XP:', finalError);
    } else {
      console.log('💰 Rob\'s current XP status:', finalXP);
    }

    console.log('\n🎉 XP check completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkRobXP(); 