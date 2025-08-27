// Test Leads Filtering Script
// This script tests the exact filtering logic used in the conversion overview page

const http = require('http');

// Helper function to make API requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function testLeadsFiltering() {
  console.log('🔍 Testing leads filtering logic...');
  
  try {
    // Fetch leads from the API
    const response = await makeRequest('http://localhost:3000/api/prelaunch-leads');
    
    if (!response.success) {
      console.error('❌ Failed to fetch leads:', response.error);
      return;
    }
    
    const allLeads = response.leads;
    console.log(`📊 Total leads from API: ${allLeads.length}`);
    
    // Apply the exact filtering logic from conversie-overzicht page
    const filteredLeads = allLeads.filter(lead => 
      !lead.email.includes('@media2net.nl') && 
      !lead.email.includes('@test.com') &&
      !lead.email.includes('admin@test.com')
    );
    
    console.log(`✅ Filtered leads (removed test leads): ${filteredLeads.length}`);
    
    // Show which leads were filtered out
    const filteredOutLeads = allLeads.filter(lead => 
      lead.email.includes('@media2net.nl') || 
      lead.email.includes('@test.com') ||
      lead.email.includes('admin@test.com')
    );
    
    if (filteredOutLeads.length > 0) {
      console.log('\n🚫 Filtered out leads:');
      filteredOutLeads.forEach(lead => {
        console.log(`   - ${lead.email} (${lead.name || 'No name'})`);
      });
    } else {
      console.log('\n✅ No test leads found - all leads are valid');
    }
    
    // Show first few leads for verification
    console.log('\n📋 First 5 leads:');
    filteredLeads.slice(0, 5).forEach(lead => {
      console.log(`   - ${lead.email} (${lead.name || 'No name'}) - ${lead.source || 'No source'}`);
    });
    
    // Check if there are any leads with specific patterns
    const media2netLeads = allLeads.filter(lead => lead.email.includes('@media2net.nl'));
    const testLeads = allLeads.filter(lead => lead.email.includes('@test.com'));
    const adminTestLeads = allLeads.filter(lead => lead.email.includes('admin@test.com'));
    
    console.log('\n🔍 Lead breakdown:');
    console.log(`   - Media2net leads: ${media2netLeads.length}`);
    console.log(`   - Test.com leads: ${testLeads.length}`);
    console.log(`   - Admin test leads: ${adminTestLeads.length}`);
    console.log(`   - Valid leads: ${filteredLeads.length}`);
    
    // Check for any other potential test patterns
    const potentialTestLeads = allLeads.filter(lead => 
      lead.email.includes('test') || 
      lead.email.includes('admin') ||
      lead.email.includes('demo') ||
      lead.email.includes('example')
    );
    
    if (potentialTestLeads.length > 0) {
      console.log('\n⚠️ Potential test leads (not filtered):');
      potentialTestLeads.forEach(lead => {
        console.log(`   - ${lead.email} (${lead.name || 'No name'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing leads filtering:', error);
  }
}

// Run the test
testLeadsFiltering();
