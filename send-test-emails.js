const fetch = require('node-fetch');

async function sendTestEmails() {
  const emails = [
    'chielvanderzee@gmail.com',
    'rick@toptiermen.eu'
  ];

  for (const email of emails) {
    try {
      console.log(`📧 Versturen van test email naar ${email}...`);
      
      const response = await fetch('http://localhost:3000/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          template: 'platform-update',
          variables: {
            name: email === 'chielvanderzee@gmail.com' ? 'Chiel' : 'Rick',
            platform_url: 'https://platform.toptiermen.eu',
            version: '3.1 Improved'
          }
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Email succesvol verstuurd naar ${email}!`);
      } else {
        console.log(`❌ Fout bij versturen naar ${email}:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Fout bij versturen naar ${email}:`, error.message);
    }
  }
}

sendTestEmails();
