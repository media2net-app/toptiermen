
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || 'EAAPexHzdG7YBPLbclyRpgNovSwB84K9fxhw7c7VnxEj5AEYr4ySi7p0z517LuqozTYFOTCjpZB08S2VRIXzwB7NPcL506BVIPzIDqOytXw0VUJIIMvZBqfc01ATi6PvEyIW16ps9nRbX09yCdRW16p4zvHi5xLBbTM30dGASZBrBqF6ObxL0yVZCkgoxqZAySOukZD';

async function testIntegration() {
  console.log('🔍 Testing Facebook Integration...');
  
  try {
    // Test basic API call
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Integration successful!');
      console.log(`User ID: ${data.id}`);
      console.log(`Name: ${data.name}`);
    } else {
      console.log('❌ Integration failed:', data.error?.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testIntegration();
