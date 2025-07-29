// Script to add Dominiqueboot@outlook.com to pre-launch email list
const addDominiqueEmail = async () => {
  try {
    console.log('📧 Adding Dominiqueboot@outlook.com to pre-launch email list...');
    
    const response = await fetch('/api/admin/prelaunch-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'Dominiqueboot@outlook.com',
        name: 'Dominique Boot',
        source: 'Manual Admin Addition',
        status: 'active',
        package: 'BASIC',
        notes: 'Added manually by admin - interested in Top Tier Men platform'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Successfully added Dominiqueboot@outlook.com to pre-launch list');
      console.log('📋 Email details:', data.email);
    } else {
      console.error('❌ Failed to add email:', data.error);
    }
  } catch (error) {
    console.error('❌ Error adding email:', error);
  }
};

// Run the function
addDominiqueEmail();