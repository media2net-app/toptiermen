
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || 'EAAPexHzdG7YBPClZAArLJk5y6DxX8Kf0XUzYWQtS622FYOHVODKE5gWhhAjFYZBJPZAFiEXFM4r0heQdZBs691WrUCurjHr7uYqFFH83E7HVa5rHwycWZBrHcEnUzv5GxagADWAclxEZAEOtZApGY9tjMLy59UgQoeOgI3eHd9ZAzLlX70XZBeHgcsUhXgSEHoRY5wnAZD';

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
