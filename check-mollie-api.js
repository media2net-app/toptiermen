require('dotenv').config();

async function checkMollieAPI() {
  console.log('🔍 Checking Mollie API for recent payments...');
  
  const mollieApiKey = process.env.MOLLIE_API_KEY;
  
  if (!mollieApiKey) {
    console.error('❌ MOLLIE_API_KEY not found in environment variables');
    return;
  }

  try {
    // Check the most recent payment from Panchero de kort
    const molliePaymentId = 'tr_7BdZYHY4K6FcpbFUkeyDJ';
    
    console.log(`🔍 Checking Mollie payment: ${molliePaymentId}`);
    
    const response = await fetch(`https://api.mollie.com/v2/payments/${molliePaymentId}`, {
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Mollie API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const payment = await response.json();
    
    console.log('✅ Mollie payment details:');
    console.log(`   ID: ${payment.id}`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Amount: €${payment.amount.value}`);
    console.log(`   Description: ${payment.description}`);
    console.log(`   Created: ${payment.createdAt}`);
    console.log(`   Paid: ${payment.paidAt || 'Not paid'}`);
    console.log(`   Method: ${payment.method}`);
    console.log(`   Customer: ${payment.customerId || 'N/A'}`);
    
    if (payment.metadata) {
      console.log(`   Metadata:`, payment.metadata);
    }

    // Also check recent payments
    console.log('\n🔍 Checking recent payments...');
    const recentResponse = await fetch('https://api.mollie.com/v2/payments?limit=10', {
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (recentResponse.ok) {
      const recentData = await recentResponse.json();
      console.log(`📊 Found ${recentData.count} recent payments`);
      
      if (recentData._embedded && recentData._embedded.payments) {
        console.log('\n📋 Recent payments:');
        recentData._embedded.payments.forEach((payment, index) => {
          const date = new Date(payment.createdAt);
          const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
          console.log(`${index + 1}. ${payment.id}`);
          console.log(`   Amount: €${payment.amount.value}`);
          console.log(`   Status: ${payment.status}`);
          console.log(`   Time: ${timeStr}`);
          console.log(`   Description: ${payment.description || 'N/A'}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Error checking Mollie API:', error);
  }
}

checkMollieAPI();
