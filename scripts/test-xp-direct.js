const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testXPDirect() {
  console.log('🧪 Testing XP Directly in Database...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; // Rick's user ID

  try {
    // Step 1: Get current XP
    console.log('📋 Step 1: Getting current XP...');
    const { data: currentXP, error: xpError } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpError) {
      console.error('❌ Error getting current XP:', xpError);
      return;
    }

    const initialXP = currentXP?.total_xp || 0;
    console.log(`💰 Current XP: ${initialXP}`);

    // Step 2: Get user missions
    console.log('\n📋 Step 2: Getting user missions...');
    const { data: userMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId);

    if (missionsError) {
      console.error('❌ Error getting missions:', missionsError);
      return;
    }

    console.log(`📊 Found ${userMissions.length} missions`);
    
    // Find a daily mission to test with
    const testMission = userMissions.find(m => m.frequency_type === 'daily');
    if (!testMission) {
      console.log('❌ No daily mission found for testing');
      return;
    }
    
    console.log(`🎯 Testing with mission: "${testMission.title}" (ID: ${testMission.id})`);
    console.log(`📈 Current completion date: ${testMission.last_completion_date}`);
    console.log(`💰 XP reward: ${testMission.xp_reward}`);

    // Step 3: Simulate completing the mission
    console.log('\n📋 Step 3: Simulating mission completion...');
    const today = new Date().toISOString().split('T')[0];
    
    // Update mission to completed
    const { error: updateError } = await supabase
      .from('user_missions')
      .update({ 
        last_completion_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('id', testMission.id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating mission:', updateError);
      return;
    }

    // Add XP
    const { error: xpUpdateError } = await supabase
      .rpc('exec_sql', {
        sql_query: `UPDATE user_xp SET total_xp = total_xp + ${testMission.xp_reward}, updated_at = NOW() WHERE user_id = '${userId}'`
      });

    if (xpUpdateError) {
      console.error('❌ Error updating XP:', xpUpdateError);
    } else {
      console.log(`✅ Added ${testMission.xp_reward} XP`);
    }

    // Log XP transaction
    const { error: txError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: userId,
        xp_amount: testMission.xp_reward,
        source_type: 'mission_completion',
        source_id: testMission.id,
        description: `Missie voltooid: ${testMission.title}`,
        created_at: new Date().toISOString()
      });

    if (txError) {
      console.error('❌ Error logging transaction:', txError);
    } else {
      console.log('✅ XP transaction logged');
    }

    // Step 4: Check XP after completion
    console.log('\n📋 Step 4: Checking XP after completion...');
    const { data: xpAfterComplete, error: xpError2 } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpError2) {
      console.error('❌ Error getting XP after completion:', xpError2);
    } else {
      const xpAfter = xpAfterComplete?.total_xp || 0;
      console.log(`💰 XP after completion: ${xpAfter}`);
      console.log(`📊 XP difference: ${xpAfter - initialXP}`);
    }

    // Step 5: Simulate uncompleting the mission
    console.log('\n📋 Step 5: Simulating mission uncompletion...');
    
    // Update mission to uncompleted
    const { error: updateError2 } = await supabase
      .from('user_missions')
      .update({ 
        last_completion_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', testMission.id)
      .eq('user_id', userId);

    if (updateError2) {
      console.error('❌ Error updating mission:', updateError2);
      return;
    }

    // Remove XP
    const { error: xpUpdateError2 } = await supabase
      .rpc('exec_sql', {
        sql_query: `UPDATE user_xp SET total_xp = total_xp - ${testMission.xp_reward}, updated_at = NOW() WHERE user_id = '${userId}'`
      });

    if (xpUpdateError2) {
      console.error('❌ Error updating XP:', xpUpdateError2);
    } else {
      console.log(`✅ Removed ${testMission.xp_reward} XP`);
    }

    // Log XP transaction
    const { error: txError2 } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: userId,
        xp_amount: -testMission.xp_reward,
        source_type: 'mission_uncompletion',
        source_id: testMission.id,
        description: `Missie ongedaan gemaakt: ${testMission.title}`,
        created_at: new Date().toISOString()
      });

    if (txError2) {
      console.error('❌ Error logging transaction:', txError2);
    } else {
      console.log('✅ XP transaction logged');
    }

    // Step 6: Check final XP
    console.log('\n📋 Step 6: Checking final XP...');
    const { data: finalXP, error: xpError3 } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpError3) {
      console.error('❌ Error getting final XP:', xpError3);
    } else {
      const finalXPValue = finalXP?.total_xp || 0;
      console.log(`💰 Final XP: ${finalXPValue}`);
      console.log(`📊 Total XP difference: ${finalXPValue - initialXP}`);
      
      if (finalXPValue === initialXP) {
        console.log('✅ XP correctly restored to original value!');
      } else {
        console.log('❌ XP not correctly restored!');
      }
    }

    // Step 7: Check recent XP transactions
    console.log('\n📋 Step 7: Checking recent XP transactions...');
    const { data: xpTransactions, error: xpTxError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (xpTxError) {
      console.error('❌ Error fetching XP transactions:', xpTxError);
    } else {
      console.log('✅ Recent XP transactions:');
      xpTransactions.forEach(tx => {
        console.log(`  - ${tx.description}: ${tx.xp_amount > 0 ? '+' : ''}${tx.xp_amount} XP`);
      });
    }

    console.log('\n🎉 XP direct test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testXPDirect(); 