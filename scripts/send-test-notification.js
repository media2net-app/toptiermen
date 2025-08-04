require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Database connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendTestNotification() {
  console.log('🚀 Sending Test Push Notification...\n');

  try {
    // Get all users with push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint')
      .not('endpoint', 'like', '%test%'); // Exclude test subscriptions

    if (error) {
      console.error('❌ Error getting subscriptions:', error.message);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️  No real push subscriptions found');
      console.log('📋 Please:');
      console.log('1. Open http://localhost:3000 in browser');
      console.log('2. Log in and enable push notifications');
      console.log('3. Run this script again');
      return;
    }

    console.log(`✅ Found ${subscriptions.length} real push subscription(s)`);

    // Send test notification to each user
    for (const subscription of subscriptions) {
      console.log(`\n📱 Sending to user: ${subscription.user_id}`);
      
      const testNotification = {
        userId: subscription.user_id,
        title: "🎉 Welkom bij Top Tier Men!",
        body: "Je push notificaties werken perfect!",
        icon: "/logo.svg",
        badge: "/badge-no-excuses.png",
        data: { 
          url: "/dashboard",
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch('http://localhost:3000/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testNotification)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notification sent successfully!');
      } else {
        console.log('❌ Failed:', result.error);
      }
    }

    console.log('\n🎉 Test notifications sent!');
    console.log('📱 Check your browser/phone for notifications');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run
sendTestNotification(); 