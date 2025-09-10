require('dotenv').config({ path: '.env.local' });

async function checkFrodoMollie() {
  console.log('🔍 Checking Frodo van Houten Mollie payment...');
  
  const mollieLiveKey = process.env.MOLLIE_LIVE_KEY;
  const mollieTestKey = process.env.MOLLIE_TEST_KEY;
  
  const frodoPaymentId = 'tr_Me3SWvZXJYfzSuBEGbzDJ';
  
  console.log(`📋 Frodo Payment Details:`);
  console.log(`   Mollie ID: ${frodoPaymentId}`);
  console.log(`   Email: fvanhouten1986@gmail.com`);
  console.log(`   Amount: €25 (Basic Tier - 6months_monthly)`);
  console.log('');

  const keys = [
    { key: mollieLiveKey, type: 'LIVE' },
    { key: mollieTestKey, type: 'TEST' }
  ].filter(k => k.key);

  for (const { key, type } of keys) {
    console.log(`🔍 Checking with ${type} key...`);
    
    try {
      const response = await fetch(`https://api.mollie.com/v2/payments/${frodoPaymentId}`, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`❌ ${type} API error: ${response.status} ${response.statusText}`);
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
      
      if (payment.metadata) {
        console.log(`   Metadata:`, payment.metadata);
      }

      // Check if this matches our database record
      if (payment.amount.value === '25.00') {
        console.log(`✅ Amount matches database record (€25)`);
      } else {
        console.log(`❌ Amount mismatch: API shows €${payment.amount.value}, DB shows €25`);
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
}

checkFrodoMollie();
