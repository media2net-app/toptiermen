const fetch = require('node-fetch');

async function sendEmail() {
  try {
    console.log('📧 Versturen van platform update email...');
    
    const response = await fetch('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chielvanderzee@gmail.com',
        template: 'platform-update',
        variables: {
          name: 'Chiel',
          platform_url: 'https://platform.toptiermen.eu',
          version: '3.1 Improved'
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email succesvol verstuurd!');
      console.log('📬 Ontvanger: chielvanderzee@gmail.com');
      console.log('📋 Onderwerp: Platform gereed voor gebruik!');
    } else {
      console.log('❌ Fout bij versturen:', result.error);
    }
  } catch (error) {
    console.error('❌ Fout bij versturen email:', error.message);
  }
}

sendEmail();
