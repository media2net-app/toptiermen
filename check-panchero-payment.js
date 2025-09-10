require('dotenv').config({ path: '.env.local' });

async function checkPancheroPayment() {
  console.log('🔍 Checking Panchero de kort payment via Mollie API...');
  
  const mollieLiveKey = process.env.MOLLIE_LIVE_KEY;
  const mollieTestKey = process.env.MOLLIE_TEST_KEY;
  
  console.log('🔑 Keys found:', {
    live: mollieLiveKey ? 'Yes' : 'No',
    test: mollieTestKey ? 'Yes' : 'No'
  });
  
  if (!mollieLiveKey && !mollieTestKey) {
    console.error('❌ No Mollie API keys found in environment variables');
    return;
  }

  // Panchero de kort payment details from database
  const pancheroPaymentId = 'tr_7BdZYHY4K6FcpbFUkeyDJ';
  const pancheroEmail = 'p.d.kort@rodekruis.nl';
  const pancheroAmount = 426;
  
  console.log(`📋 Payment details:`);
  console.log(`   Mollie ID: ${pancheroPaymentId}`);
  console.log(`   Email: ${pancheroEmail}`);
  console.log(`   Amount: €${pancheroAmount}`);
  console.log(`   Date: 2025-09-09T21:01:46.585`);
  console.log('');

  // Try both live and test keys
  const keys = [
    { key: mollieLiveKey, type: 'LIVE' },
    { key: mollieTestKey, type: 'TEST' }
  ].filter(k => k.key);

  for (const { key, type } of keys) {
    console.log(`🔍 Checking with ${type} key...`);
    
    try {
      const response = await fetch(`https://api.mollie.com/v2/payments/${pancheroPaymentId}`, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`❌ ${type} API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   Error details: ${errorText}`);
        continue;
      }

      const payment = await response.json();
      
      console.log(`✅ ${type} payment found:`);
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

      // Check if this matches our database record
      if (payment.amount.value === pancheroAmount.toString()) {
        console.log(`✅ Amount matches database record (€${pancheroAmount})`);
      } else {
        console.log(`❌ Amount mismatch: API shows €${payment.amount.value}, DB shows €${pancheroAmount}`);
      }

      // Check payment status
      if (payment.status === 'paid') {
        console.log(`✅ Payment is PAID!`);
        console.log(`   Paid at: ${payment.paidAt}`);
      } else if (payment.status === 'pending') {
        console.log(`⏳ Payment is still PENDING`);
      } else if (payment.status === 'expired') {
        console.log(`❌ Payment has EXPIRED`);
      } else {
        console.log(`ℹ️ Payment status: ${payment.status}`);
      }

      break; // Found the payment, no need to check other keys

    } catch (error) {
      console.error(`❌ Error checking ${type} API:`, error.message);
    }
  }

  // Also check recent payments to see if there are any other €426 payments
  console.log('\n🔍 Checking recent payments for any €426 transactions...');
  
  for (const { key, type } of keys) {
    try {
      const response = await fetch('https://api.mollie.com/v2/payments?limit=20', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`❌ ${type} recent payments error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data._embedded && data._embedded.payments) {
        const euro426Payments = data._embedded.payments.filter(p => 
          p.amount.value === '426.00' || p.amount.value === '426'
        );
        
        if (euro426Payments.length > 0) {
          console.log(`✅ Found ${euro426Payments.length} €426 payments in ${type}:`);
          euro426Payments.forEach((payment, index) => {
            const date = new Date(payment.createdAt);
            const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
            console.log(`   ${index + 1}. ${payment.id}`);
            console.log(`      Status: ${payment.status}`);
            console.log(`      Time: ${timeStr}`);
            console.log(`      Description: ${payment.description || 'N/A'}`);
            console.log(`      Paid: ${payment.paidAt || 'Not paid'}`);
            console.log('');
          });
        } else {
          console.log(`❌ No €426 payments found in ${type} recent payments`);
        }
      }
      
      break; // Only check one key for recent payments
      
    } catch (error) {
      console.error(`❌ Error checking ${type} recent payments:`, error.message);
    }
  }
}

checkPancheroPayment();
