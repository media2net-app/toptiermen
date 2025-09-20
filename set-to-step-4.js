const { createClient } = require('@supabase/supabase-js');

// Use the API to set user to step 4
async function setUserToStep4() {
  const userEmail = 'onboarding.basic.1758346121028@toptiermen.eu';
  
  try {
    console.log(`🔄 Setting user ${userEmail} to step 4...`);

    // First, create onboarding status for step 4
    const response = await fetch('http://localhost:3000/api/onboarding-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        step: 4,
        action: 'set_step'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ User set to step 4:', result);

  } catch (error) {
    console.error('❌ Error setting user to step 4:', error);
  }
}

setUserToStep4();
