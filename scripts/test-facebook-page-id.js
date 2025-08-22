require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PAGE_ID = '610571295471584';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

async function testFacebookPageId() {
  console.log('🔍 Testing Facebook Page ID...\n');
  console.log(`📊 Page ID: ${FACEBOOK_PAGE_ID}\n`);

  try {
    // Test 1: Get page details
    console.log('📊 Test 1: Getting page details...');
    const pageResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,username,verification_status,fan_count,category`
    );

    if (pageResponse.ok) {
      const pageData = await pageResponse.json();
      console.log('✅ Page details retrieved successfully:');
      console.log(`   📊 Name: ${pageData.name}`);
      console.log(`   📊 ID: ${pageData.id}`);
      console.log(`   👤 Username: ${pageData.username || 'N/A'}`);
      console.log(`   📈 Category: ${pageData.category || 'N/A'}`);
      console.log(`   ✅ Verification: ${pageData.verification_status || 'N/A'}`);
      console.log(`   👥 Fans: ${pageData.fan_count || 'N/A'}`);
    } else {
      const errorData = await pageResponse.json();
      console.error('❌ Error getting page details:', errorData);
    }

    console.log('\n📊 Test 2: Testing ad creative creation...');
    
    // Test 2: Try to create a simple ad creative
    const creativePayload = {
      name: 'Test Creative',
      object_story_spec: {
        page_id: FACEBOOK_PAGE_ID,
        link_data: {
          link: 'https://platform.toptiermen.eu/prelaunch',
          message: 'Test message',
          name: 'Test Ad',
          call_to_action: {
            type: 'LEARN_MORE',
            value: {
              link: 'https://platform.toptiermen.eu/prelaunch'
            }
          }
        }
      }
    };

    const creativeResponse = await fetch(
      `https://graph.facebook.com/v19.0/act_1465834431278978/adcreatives?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creativePayload)
      }
    );

    if (creativeResponse.ok) {
      const creativeData = await creativeResponse.json();
      console.log('✅ Ad creative created successfully:');
      console.log(`   📊 Creative ID: ${creativeData.id}`);
      
      // Delete the test creative
      console.log('🗑️ Deleting test creative...');
      const deleteResponse = await fetch(
        `https://graph.facebook.com/v19.0/${creativeData.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
          method: 'DELETE'
        }
      );
      
      if (deleteResponse.ok) {
        console.log('✅ Test creative deleted successfully');
      } else {
        console.log('⚠️ Could not delete test creative (this is okay)');
      }
    } else {
      const errorData = await creativeResponse.json();
      console.error('❌ Error creating ad creative:', errorData);
    }

    console.log('\n📊 Test 3: Checking page permissions...');
    
    // Test 3: Check if we have access to the page
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,permissions`
    );

    if (permissionsResponse.ok) {
      const permissionsData = await permissionsResponse.json();
      const pages = permissionsData.data || [];
      
      const targetPage = pages.find(page => page.id === FACEBOOK_PAGE_ID);
      if (targetPage) {
        console.log('✅ Page found in user accounts:');
        console.log(`   📊 Name: ${targetPage.name}`);
        console.log(`   📊 ID: ${targetPage.id}`);
        console.log(`   🔑 Permissions: ${targetPage.permissions ? targetPage.permissions.join(', ') : 'N/A'}`);
      } else {
        console.log('⚠️ Page not found in user accounts');
        console.log('💡 Available pages:');
        pages.forEach(page => {
          console.log(`   - ${page.name} (${page.id})`);
        });
      }
    } else {
      const errorData = await permissionsResponse.json();
      console.error('❌ Error checking page permissions:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
testFacebookPageId()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
