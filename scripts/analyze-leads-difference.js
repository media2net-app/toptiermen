// Analyze Leads Difference Script
// This script analyzes the difference between leads shown in different pages

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

async function analyzeLeadsDifference() {
  console.log('🔍 Analyzing leads difference...');
  
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
    
    console.log(`✅ After test lead filtering: ${filteredLeads.length}`);
    
    // Check for leads with notes that might be filtered
    const leadsWithNotes = filteredLeads.filter(lead => lead.notes && lead.notes.trim() !== '');
    const leadsWithoutNotes = filteredLeads.filter(lead => !lead.notes || lead.notes.trim() === '');
    
    console.log(`📝 Leads with notes: ${leadsWithNotes.length}`);
    console.log(`📝 Leads without notes: ${leadsWithoutNotes.length}`);
    
    // Check for leads with campaign tracking
    const leadsWithCampaign = filteredLeads.filter(lead => 
      lead.notes && lead.notes.includes('Campaign:') && !lead.notes.includes('Campaign: test')
    );
    const leadsWithoutCampaign = filteredLeads.filter(lead => 
      !lead.notes || !lead.notes.includes('Campaign:')
    );
    
    console.log(`🎯 Leads with campaign tracking: ${leadsWithCampaign.length}`);
    console.log(`🎯 Leads without campaign tracking: ${leadsWithoutCampaign.length}`);
    
    // Show leads with campaign tracking
    console.log('\n📋 Leads with campaign tracking:');
    leadsWithCampaign.forEach(lead => {
      const campaignInfo = getCampaignFromNotes(lead.notes);
      console.log(`   - ${lead.email} | Campaign: ${campaignInfo.campaign} | Ad Set: ${campaignInfo.adSet}`);
    });
    
    // Show leads without campaign tracking
    console.log('\n📋 Leads without campaign tracking:');
    leadsWithoutCampaign.forEach(lead => {
      console.log(`   - ${lead.email} | Source: ${lead.source || 'No source'} | Notes: ${lead.notes || 'No notes'}`);
    });
    
    // Check for any leads that might be filtered by other criteria
    const leadsWithTestInNotes = filteredLeads.filter(lead => 
      lead.notes && lead.notes.toLowerCase().includes('test')
    );
    
    if (leadsWithTestInNotes.length > 0) {
      console.log('\n⚠️ Leads with "test" in notes:');
      leadsWithTestInNotes.forEach(lead => {
        console.log(`   - ${lead.email} | Notes: ${lead.notes}`);
      });
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Total API leads: ${allLeads.length}`);
    console.log(`   After test email filtering: ${filteredLeads.length}`);
    console.log(`   With campaign tracking: ${leadsWithCampaign.length}`);
    console.log(`   Without campaign tracking: ${leadsWithoutCampaign.length}`);
    
    // If the difference is 2, let's find which 2 leads might be missing
    if (allLeads.length - leadsWithCampaign.length === 2) {
      console.log('\n🎯 POTENTIAL MISSING LEADS (2 leads difference):');
      leadsWithoutCampaign.forEach(lead => {
        console.log(`   - ${lead.email} | Source: ${lead.source || 'No source'} | Notes: ${lead.notes || 'No notes'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error analyzing leads:', error);
  }
}

// Helper function to extract campaign info from notes (same as in the page)
function getCampaignFromNotes(notes) {
  const campaignMatch = notes.match(/Campaign: ([^|]+)/);
  const adSetMatch = notes.match(/Ad Set: ([^|]+)/);
  return {
    campaign: campaignMatch ? campaignMatch[1].trim() : 'Onbekend',
    adSet: adSetMatch ? adSetMatch[1].trim() : 'Onbekend'
  };
}

// Run the analysis
analyzeLeadsDifference();
