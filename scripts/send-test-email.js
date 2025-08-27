require('dotenv').config({ path: '.env.local' });

async function sendTestEmail() {
  try {
    console.log('🧪 Sending test email...\n');
    
    // Test email configuration
    const testEmail = {
      to: 'chiel@media2net.nl', // Chiel's email for testing
      name: 'Chiel van der Zee'
    };
    
    console.log('📧 Test Email Details:');
    console.log('======================');
    console.log(`To: ${testEmail.to}`);
    console.log(`Name: ${testEmail.name}`);
    console.log('');
    
    // Send test email via API
    console.log('🔗 Sending via API...');
    const response = await fetch('https://platform.toptiermen.eu/api/email/send-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmail)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test email sent successfully!');
      console.log('📊 Response:', result);
      
      console.log('\n🎉 Test Email Complete!');
      console.log('='.repeat(50));
      console.log('✅ SMTP configuration working');
      console.log('✅ Test email sent to Chiel');
      console.log('✅ Email service ready for production');
      console.log('');
      console.log('📧 Check Chiel\'s email inbox for the test message');
      console.log('📧 Subject: "Test Email - Top Tier Men Platform"');
      
    } else {
      const error = await response.text();
      console.log('❌ Test email failed:', response.status, response.statusText);
      console.log('Error details:', error);
      
      // Try local endpoint as fallback
      console.log('\n🔄 Trying local endpoint...');
      try {
        const localResponse = await fetch('http://localhost:3000/api/email/send-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testEmail)
        });
        
        if (localResponse.ok) {
          const localResult = await localResponse.json();
          console.log('✅ Local test email sent successfully!');
          console.log('📊 Response:', localResult);
        } else {
          const localError = await localResponse.text();
          console.log('❌ Local test also failed:', localResponse.status, localError);
        }
      } catch (localError) {
        console.log('❌ Local endpoint not available:', localError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check if the platform is deployed');
    console.log('2. Verify SMTP settings in database');
    console.log('3. Check network connectivity');
    console.log('4. Verify email service is running');
  }
}

sendTestEmail();
