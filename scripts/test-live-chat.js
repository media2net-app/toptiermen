require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLiveChat() {
  console.log('🚀 Testing Live Chat Functionality...\n');

  try {
    // Get Rick and Chiel's user IDs
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    console.log('1️⃣ Getting conversation between Rick and Chiel...');
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .or(`and(participant1_id.eq.${rickId},participant2_id.eq.${chielId}),and(participant1_id.eq.${chielId},participant2_id.eq.${rickId})`)
      .eq('is_active', true)
      .single();

    if (convError || !conversation) {
      console.error('❌ No conversation found between Rick and Chiel');
      return;
    }

    console.log(`✅ Found conversation: ${conversation.id}`);

    // Send multiple messages to simulate live chat
    const messages = [
      { sender: 'Rick', content: 'Hey Chiel! Hoe gaat het met je training? 💪' },
      { sender: 'Rick', content: 'Ik heb vandaag een geweldige workout gehad!' },
      { sender: 'Rick', content: 'Ben je klaar voor de challenge van deze week?' },
      { sender: 'Chiel', content: 'Hey Rick! Ja, het gaat goed hier 🏋️‍♂️' },
      { sender: 'Chiel', content: 'Ik heb net een nieuwe PR gehaald!' },
      { sender: 'Rick', content: 'Dat is geweldig! Wat voor oefening?' },
      { sender: 'Chiel', content: 'Deadlift - 180kg! 💪' },
      { sender: 'Rick', content: 'WOW! Dat is indrukwekkend! 🔥' },
      { sender: 'Rick', content: 'Je wordt steeds sterker!' },
      { sender: 'Chiel', content: 'Dank je! Jij ook trouwens 😄' }
    ];

    console.log('\n2️⃣ Sending live chat messages...');
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const senderId = message.sender === 'Rick' ? rickId : chielId;
      
      // Add a small delay to simulate real typing
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      }

      const { data: sentMessage, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: senderId,
          content: message.content,
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) {
        console.error(`❌ Error sending message from ${message.sender}:`, messageError);
        continue;
      }

      console.log(`✅ ${message.sender}: "${message.content}"`);
      console.log(`   Time: ${new Date(sentMessage.created_at).toLocaleTimeString()}`);
    }

    console.log('\n🎯 Live chat test completed!');
    console.log('📱 Open the inbox in two different browser tabs:');
    console.log('   - Tab 1: Log in as Rick');
    console.log('   - Tab 2: Log in as Chiel');
    console.log('   - Both go to: http://localhost:6001/dashboard/inbox');
    console.log('🔔 You should see messages appearing in real-time without refreshing!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testLiveChat();

