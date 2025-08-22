require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook environment variables');
  process.exit(1);
}

async function checkRickCuijpersMedia() {
  console.log('🔍 Checking Rick Cuijpers Top Tier Men Media Library...\n');
  
  try {
    // First, let's get the Rick Cuijpers Top Tier Men business ID
    console.log('🏢 Finding Rick Cuijpers Top Tier Men business...');
    const businessesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/businesses?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,verification_status`
    );
    
    if (!businessesResponse.ok) {
      throw new Error(`Failed to fetch businesses: ${businessesResponse.status}`);
    }
    
    const businessesData = await businessesResponse.json();
    const rickCuijpersBusiness = businessesData.data?.find(business => 
      business.name === 'Rick Cuijpers Top Tier Men'
    );
    
    if (!rickCuijpersBusiness) {
      console.error('❌ Rick Cuijpers Top Tier Men business not found');
      return;
    }
    
    console.log(`✅ Found Rick Cuijpers Top Tier Men business: ${rickCuijpersBusiness.id}`);
    console.log(`   Status: ${rickCuijpersBusiness.verification_status}\n`);
    
    // Now let's check the business media library
    console.log('📁 Checking Rick Cuijpers Top Tier Men Media Library...');
    const businessMediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${rickCuijpersBusiness.id}/business_media?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,media_type,created_time,url,folder&limit=100`
    );
    
    if (!businessMediaResponse.ok) {
      console.log(`⚠️  Could not access business media: ${businessMediaResponse.status}`);
      console.log('Trying alternative endpoint...');
      
      // Try alternative endpoint
      const altBusinessMediaResponse = await fetch(
        `https://graph.facebook.com/v19.0/${rickCuijpersBusiness.id}/media_library?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,media_type,created_time,url&limit=100`
      );
      
      if (!altBusinessMediaResponse.ok) {
        console.log(`⚠️  Alternative endpoint also failed: ${altBusinessMediaResponse.status}`);
      } else {
        const altBusinessMediaData = await altBusinessMediaResponse.json();
        console.log(`📋 Found ${altBusinessMediaData.data?.length || 0} media items in alternative endpoint`);
        
        const ttmVideos = altBusinessMediaData.data?.filter(item => 
          item.name && item.name.includes('TTM_')
        ) || [];
        
        console.log(`🎯 Found ${ttmVideos.length} TTM videos:`);
        ttmVideos.forEach(video => {
          console.log(`   ✅ ${video.name} (ID: ${video.id})`);
          console.log(`      Type: ${video.media_type}`);
          console.log(`      Created: ${video.created_time}`);
          console.log(`      URL: ${video.url}`);
          console.log('');
        });
      }
    } else {
      const businessMediaData = await businessMediaResponse.json();
      console.log(`📋 Found ${businessMediaData.data?.length || 0} media items in Rick Cuijpers Top Tier Men`);
      
      // Group by folder
      const folderGroups = {};
      businessMediaData.data?.forEach(item => {
        const folderName = item.folder?.name || 'No Folder';
        if (!folderGroups[folderName]) {
          folderGroups[folderName] = [];
        }
        folderGroups[folderName].push(item);
      });
      
      console.log('\n📂 Media organized by folders:');
      Object.keys(folderGroups).forEach(folderName => {
        console.log(`\n📁 Folder: "${folderName}" (${folderGroups[folderName].length} items)`);
        folderGroups[folderName].forEach(item => {
          console.log(`   - ${item.name} (${item.media_type})`);
        });
      });
      
      // Look for TTM videos specifically
      const ttmVideos = businessMediaData.data?.filter(item => 
        item.name && item.name.includes('TTM_')
      ) || [];
      
      console.log(`\n🎯 Found ${ttmVideos.length} TTM videos in Rick Cuijpers Top Tier Men:`);
      ttmVideos.forEach(video => {
        console.log(`   ✅ ${video.name} (ID: ${video.id})`);
        console.log(`      Folder: ${video.folder?.name || 'No Folder'}`);
        console.log(`      Type: ${video.media_type}`);
        console.log(`      Created: ${video.created_time}`);
        console.log(`      URL: ${video.url}`);
        console.log('');
      });
    }
    
    // Let's also try to get the business's ad accounts
    console.log('💼 Checking Rick Cuijpers Top Tier Men Ad Accounts...');
    const businessAdAccountsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${rickCuijpersBusiness.id}/owned_ad_accounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,account_status`
    );
    
    if (businessAdAccountsResponse.ok) {
      const businessAdAccountsData = await businessAdAccountsResponse.json();
      console.log(`📋 Found ${businessAdAccountsData.data?.length || 0} ad accounts owned by Rick Cuijpers Top Tier Men`);
      
      businessAdAccountsData.data?.forEach(account => {
        console.log(`   - ${account.name} (${account.id}) - Status: ${account.account_status}`);
      });
    } else {
      console.log(`⚠️  Could not access business ad accounts: ${businessAdAccountsResponse.status}`);
    }
    
    // Let's try to get the business's pages
    console.log('📄 Checking Rick Cuijpers Top Tier Men Pages...');
    const businessPagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/${rickCuijpersBusiness.id}/owned_pages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,category`
    );
    
    if (businessPagesResponse.ok) {
      const businessPagesData = await businessPagesResponse.json();
      console.log(`📋 Found ${businessPagesData.data?.length || 0} pages owned by Rick Cuijpers Top Tier Men`);
      
      businessPagesData.data?.forEach(page => {
        console.log(`   - ${page.name} (${page.id}) - Category: ${page.category}`);
      });
    } else {
      console.log(`⚠️  Could not access business pages: ${businessPagesResponse.status}`);
    }
    
    console.log('\n🎉 Rick Cuijpers Top Tier Men Media Check Summary:');
    console.log('===============================================');
    console.log(`✅ Business ID: ${rickCuijpersBusiness.id}`);
    console.log(`✅ Business Status: ${rickCuijpersBusiness.verification_status}`);
    console.log('✅ Checked multiple media endpoints');
    console.log('✅ Looked for TTM videos in business media library');
    
  } catch (error) {
    console.error('❌ Error checking Rick Cuijpers Top Tier Men media:', error);
  }
}

checkRickCuijpersMedia().catch(console.error);
