const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMissionsXP() {
  const testUserId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
  
  console.log('🧪 Testing Missions XP System...');
  console.log('=====================================');
  
  try {
    // 1. Test missions API
    console.log('1️⃣ Testing missions API...');
    const missionsResponse = await fetch(`http://localhost:3001/api/missions-simple?userId=${testUserId}`);
    const missionsData = await missionsResponse.json();
    console.log('✅ Missions API response:', missionsData.missions.length, 'missions found');
    
    // 2. Test mission toggle
    console.log('\n2️⃣ Testing mission toggle...');
    const toggleResponse = await fetch('http://localhost:3001/api/missions-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle',
        userId: testUserId,
        missionId: '1'
      })
    });
    const toggleData = await toggleResponse.json();
    console.log('✅ Mission toggle response:', toggleData);
    
    // 3. Check XP transactions
    console.log('\n3️⃣ Checking XP transactions...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (transactionsError) {
      console.error('❌ Error fetching XP transactions:', transactionsError);
    } else {
      console.log('✅ XP transactions found:', transactions.length);
      transactions.forEach(tx => {
        console.log(`   📝 ${tx.xp_amount} XP - ${tx.description} (${tx.source_type})`);
      });
    }
    
    // 4. Check user XP
    console.log('\n4️⃣ Checking user XP...');
    const { data: userXP, error: userXPError } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (userXPError) {
      console.error('❌ Error fetching user XP:', userXPError);
    } else {
      console.log('✅ User XP:', userXP.total_xp);
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMissionsXP(); 