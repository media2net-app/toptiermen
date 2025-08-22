require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

async function listFacebookPages() {
  console.log('🔍 Fetching Facebook Pages...\n');

  try {
    // Get the user's pages
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,username,verification_status,fan_count,category`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error fetching pages:', errorData);
      return;
    }

    const data = await response.json();
    const pages = data.data || [];

    console.log(`✅ Found ${pages.length} Facebook pages:\n`);

    if (pages.length === 0) {
      console.log('❌ No Facebook pages found. Please check your Facebook permissions.');
      console.log('💡 You need to be an admin of a Facebook page to create ads.');
      return;
    }

    pages.forEach((page, index) => {
      console.log(`${index + 1}. Page: ${page.name}`);
      console.log(`   📊 ID: ${page.id}`);
      console.log(`   👤 Username: ${page.username || 'N/A'}`);
      console.log(`   📈 Category: ${page.category || 'N/A'}`);
      console.log(`   ✅ Verification: ${page.verification_status || 'N/A'}`);
      console.log(`   👥 Fans: ${page.fan_count || 'N/A'}`);
      console.log('');
    });

    console.log('💡 To use a page for ads, add this to your campaign data:');
    console.log(`page_id: '${pages[0]?.id || 'YOUR_PAGE_ID'}'`);

    // Also try to get business pages
    console.log('\n🔍 Fetching Business Pages...\n');

    const businessResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/businesses?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,verification_status`
    );

    if (businessResponse.ok) {
      const businessData = await businessResponse.json();
      const businesses = businessData.data || [];

      if (businesses.length > 0) {
        console.log(`✅ Found ${businesses.length} businesses:\n`);

        for (const business of businesses) {
          console.log(`🏢 Business: ${business.name}`);
          console.log(`   📊 ID: ${business.id}`);
          console.log(`   ✅ Verification: ${business.verification_status}`);
          
          // Get pages for this business
          const businessPagesResponse = await fetch(
            `https://graph.facebook.com/v19.0/${business.id}/owned_pages?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,username,fan_count`
          );

          if (businessPagesResponse.ok) {
            const businessPagesData = await businessPagesResponse.json();
            const businessPages = businessPagesData.data || [];

            if (businessPages.length > 0) {
              console.log(`   📊 Pages: ${businessPages.length}`);
              businessPages.forEach(page => {
                console.log(`      - ${page.name} (${page.id}) - ${page.fan_count || 0} fans`);
              });
            } else {
              console.log(`   📊 No pages found for this business`);
            }
          }
          console.log('');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
listFacebookPages()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
