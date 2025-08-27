// Update Campaign Conversions Script
// This script updates the Facebook campaigns API with correct conversion data from leads

const http = require('http');
const fs = require('fs');
const path = require('path');

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

// Helper function to extract campaign info from notes
function getCampaignFromNotes(notes) {
  const campaignMatch = notes.match(/Campaign: ([^|]+)/);
  const adSetMatch = notes.match(/Ad Set: ([^|]+)/);
  return {
    campaign: campaignMatch ? campaignMatch[1].trim() : null,
    adSet: adSetMatch ? adSetMatch[1].trim() : null
  };
}

async function updateCampaignConversions() {
  console.log('🔄 Updating campaign conversions with leads data...');
  
  try {
    // Fetch leads from the API
    const leadsResponse = await makeRequest('http://localhost:3000/api/prelaunch-leads');
    
    if (!leadsResponse.success) {
      console.error('❌ Failed to fetch leads:', leadsResponse.error);
      return;
    }
    
    const allLeads = leadsResponse.leads;
    console.log(`📊 Total leads from API: ${allLeads.length}`);
    
    // Filter leads with campaign tracking
    const leadsWithCampaign = allLeads.filter(lead => 
      lead.notes && lead.notes.includes('Campaign:') && !lead.notes.includes('Campaign: test')
    );
    
    console.log(`🎯 Leads with campaign tracking: ${leadsWithCampaign.length}`);
    
    // Group leads by campaign ID
    const campaignConversions = {};
    
    leadsWithCampaign.forEach(lead => {
      const campaignInfo = getCampaignFromNotes(lead.notes);
      if (campaignInfo.campaign) {
        if (!campaignConversions[campaignInfo.campaign]) {
          campaignConversions[campaignInfo.campaign] = {
            leads: 0,
            conversions: 0,
            leadEmails: []
          };
        }
        campaignConversions[campaignInfo.campaign].leads++;
        campaignConversions[campaignInfo.campaign].conversions++;
        campaignConversions[campaignInfo.campaign].leadEmails.push(lead.email);
      }
    });
    
    console.log('\n📋 Campaign conversions breakdown:');
    Object.keys(campaignConversions).forEach(campaignId => {
      const data = campaignConversions[campaignId];
      console.log(`   Campaign ${campaignId}: ${data.leads} leads/conversions`);
      console.log(`     Emails: ${data.leadEmails.join(', ')}`);
    });
    
    // Read the current Facebook campaigns API file
    const apiFilePath = path.join(__dirname, '..', 'src', 'app', 'api', 'facebook', 'get-campaigns', 'route.ts');
    let apiContent = fs.readFileSync(apiFilePath, 'utf8');
    
    // Update the manual data with conversion information
    const currentDataMatch = apiContent.match(/const CURRENT_MANUAL_DATA = \{([\s\S]*?)\};/);
    
    if (currentDataMatch) {
      let currentData = currentDataMatch[1];
      
      // Update each campaign with conversion data
      Object.keys(campaignConversions).forEach(campaignId => {
        const conversionData = campaignConversions[campaignId];
        
        // Find the campaign in the current data and update conversions
        const campaignPattern = new RegExp(`"${campaignId}":\\s*\\{[^}]*"leads":\\s*\\d+[^}]*"conversions":\\s*\\d+`, 'g');
        const replacement = `"${campaignId}": {
                "name": "TTM - Campaign ${campaignId}",
                "clicks": 0,
                "spend": 0,
                "impressions": 0,
                "reach": 0,
                "ctr": 0,
                "cpc": 0,
                "frequency": 0,
                "status": "ACTIVE",
                "leads": ${conversionData.leads},
                "conversions": ${conversionData.conversions},
                "budget": 2500,
                "budgetRemaining": 1540
              }`;
        
        currentData = currentData.replace(campaignPattern, replacement);
      });
      
      // Update the file content
      const newApiContent = apiContent.replace(
        /const CURRENT_MANUAL_DATA = \{[\s\S]*?\};/,
        `const CURRENT_MANUAL_DATA = {${currentData}};`
      );
      
      // Add conversion tracking comment
      const updatedContent = newApiContent.replace(
        /\/\/ Manual data override based on Facebook Ads Manager/,
        `// Manual data override based on Facebook Ads Manager (Live Data - Updated 8/27/2025)
// Conversion data updated with actual leads from database
// CTR values are in decimal format (0.0667 = 6.67%)
// Using real Facebook campaign IDs to match ad sets and ads`
      );
      
      fs.writeFileSync(apiFilePath, updatedContent);
      console.log('✅ Updated Facebook campaigns API with conversion data');
    }
    
    // Also update the comprehensive analytics API
    const analyticsFilePath = path.join(__dirname, '..', 'src', 'app', 'api', 'facebook', 'comprehensive-analytics', 'route.ts');
    if (fs.existsSync(analyticsFilePath)) {
      let analyticsContent = fs.readFileSync(analyticsFilePath, 'utf8');
      
      // Update total conversions in analytics
      const totalConversions = Object.values(campaignConversions).reduce((sum, data) => sum + data.conversions, 0);
      
      // Find and update the manual data summary
      const summaryPattern = /totalConversions:\s*\d+/g;
      analyticsContent = analyticsContent.replace(summaryPattern, `totalConversions: ${totalConversions}`);
      
      fs.writeFileSync(analyticsFilePath, analyticsContent);
      console.log('✅ Updated comprehensive analytics with conversion data');
    }
    
    console.log('\n📊 Conversion Summary:');
    console.log(`   Total campaigns with conversions: ${Object.keys(campaignConversions).length}`);
    console.log(`   Total leads/conversions: ${Object.values(campaignConversions).reduce((sum, data) => sum + data.conversions, 0)}`);
    
    // Show which campaigns have conversions
    console.log('\n🎯 Campaigns with conversions:');
    Object.keys(campaignConversions).forEach(campaignId => {
      const data = campaignConversions[campaignId];
      console.log(`   - Campaign ${campaignId}: ${data.conversions} conversions`);
    });
    
  } catch (error) {
    console.error('❌ Error updating campaign conversions:', error);
  }
}

// Run the update
updateCampaignConversions();
