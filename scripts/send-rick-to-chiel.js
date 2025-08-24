require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendRickToChiel() {
  console.log('📨 Sending message from Rick to Chiel...\n');

  try {
    // Get Rick and Chiel's user IDs
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    console.log('1️⃣ Getting user profiles...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .in('id', [rickId, chielId]);

    if (usersError) {
      console.error('❌ Error getting users:', usersError);
      return;
    }

    const rick = users.find(u => u.id === rickId);
    const chiel = users.find(u => u.id === chielId);

    console.log(`✅ Rick: ${rick?.display_name || rick?.full_name} (${rickId})`);
    console.log(`✅ Chiel: ${chiel?.display_name || chiel?.full_name} (${chielId})`);

    // Get or create conversation between Rick and Chiel
    console.log('\n2️⃣ Getting or creating conversation...');
    const { data: existingConversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .or(`and(participant1_id.eq.${rickId},participant2_id.eq.${chielId}),and(participant1_id.eq.${chielId},participant2_id.eq.${rickId})`)
      .eq('is_active', true)
      .single();

    let conversationId;
    if (existingConversation) {
      conversationId = existingConversation.id;
      console.log(`✅ Using existing conversation: ${conversationId}`);
    } else {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          participant1_id: rickId,
          participant2_id: chielId,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating conversation:', createError);
        return;
      }

      conversationId = newConversation.id;
      console.log(`✅ Created new conversation: ${conversationId}`);
    }

    // Send message from Rick to Chiel
    console.log('\n3️⃣ Sending message from Rick to Chiel...');
    const testMessage = `Hey Chiel! Dit is Rick. Hoe gaat het met je? 🏋️‍♂️`;
    
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: rickId, // Rick is the sender
        content: testMessage,
        message_type: 'text'
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error sending message:', messageError);
      return;
    }

    console.log(`✅ Message sent successfully!`);
    console.log(`   Message ID: ${message.id}`);
    console.log(`   From: ${rick?.display_name || rick?.full_name} (Rick)`);
    console.log(`   To: ${chiel?.display_name || chiel?.full_name} (Chiel)`);
    console.log(`   Content: "${testMessage}"`);
    console.log(`   Time: ${new Date(message.created_at).toLocaleString()}`);

    // Check if Chiel has push subscription
    console.log('\n4️⃣ Checking Chiel\'s push subscription...');
    const { data: pushSubscription, error: pushError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', chielId)
      .single();

    if (pushError || !pushSubscription) {
      console.log('⚠️  Chiel heeft geen push subscription');
      console.log('💡 Om push notificaties te testen:');
      console.log('   1. Log in als Chiel');
      console.log('   2. Ga naar inbox en activeer push notificaties');
      console.log('   3. Run dit script opnieuw');
    } else {
      console.log('✅ Chiel heeft een push subscription');
      console.log('   Endpoint:', pushSubscription.endpoint.substring(0, 50) + '...');
    }

    console.log('\n🎯 Bericht succesvol verzonden!');
    console.log('📱 Chiel kan nu in zijn inbox het bericht van Rick zien');
    console.log('🔔 Als push notificaties zijn ingeschakeld, krijgt Chiel een notificatie');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

sendRickToChiel();

