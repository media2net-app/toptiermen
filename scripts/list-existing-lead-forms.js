require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function listLeadForms() {
  try {
    console.log('🔍 Listing existing lead forms...\n');
    
    // Method 1: Try to get lead forms from ad account
    console.log('📋 Method 1: Getting lead forms from ad account...');
    const adAccountResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/leadgen_forms?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,description,status,created_time&limit=100`
    );

    if (adAccountResponse.ok) {
      const adAccountData = await adAccountResponse.json();
      console.log(`✅ Found ${adAccountData.data?.length || 0} lead forms in ad account:`);
      
      adAccountData.data?.forEach((form, index) => {
        console.log(`  ${index + 1}. ${form.name} (ID: ${form.id}) - ${form.status}`);
        console.log(`     Description: ${form.description}`);
        console.log(`     Created: ${form.created_time}`);
      });
    } else {
      const errorText = await adAccountResponse.text();
      console.error(`❌ Failed to get lead forms from ad account:`, errorText);
    }

    // Method 2: Try to get lead forms from user account
    console.log('\n📋 Method 2: Getting lead forms from user account...');
    const userResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/leadgen_forms?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,description,status,created_time&limit=100`
    );

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log(`✅ Found ${userData.data?.length || 0} lead forms in user account:`);
      
      userData.data?.forEach((form, index) => {
        console.log(`  ${index + 1}. ${form.name} (ID: ${form.id}) - ${form.status}`);
        console.log(`     Description: ${form.description}`);
        console.log(`     Created: ${form.created_time}`);
      });
    } else {
      const errorText = await userResponse.text();
      console.error(`❌ Failed to get lead forms from user account:`, errorText);
    }

    // Method 3: Check if we can create forms at user level
    console.log('\n📋 Method 3: Testing form creation permissions...');
    const testFormData = {
      name: 'TTM - Test Lead Form',
      description: 'Test form for Top Tier Men',
      questions: [
        {
          type: 'FULL_NAME',
          label: 'Vul je naam in',
          required: true
        },
        {
          type: 'EMAIL',
          label: 'Vul je email adres in',
          required: true
        }
      ]
    };

    const testResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/leadgen_forms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          ...testFormData
        })
      }
    );

    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Can create lead forms at user level!');
      console.log(`📋 Test form created: ${testData.name} (ID: ${testData.id})`);
      
      // Delete the test form
      const deleteResponse = await fetch(
        `https://graph.facebook.com/v19.0/${testData.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        { method: 'DELETE' }
      );
      
      if (deleteResponse.ok) {
        console.log('✅ Test form deleted successfully');
      } else {
        console.log('⚠️  Could not delete test form (this is normal)');
      }
    } else {
      const errorText = await testResponse.text();
      console.error(`❌ Cannot create lead forms at user level:`, errorText);
    }

    // Method 4: Check page-level permissions
    console.log('\n📋 Method 4: Checking page permissions...');
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,access_token&limit=100`
    );

    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      console.log(`✅ Found ${pagesData.data?.length || 0} pages:`);
      
      pagesData.data?.forEach((page, index) => {
        console.log(`  ${index + 1}. ${page.name} (ID: ${page.id})`);
      });
      
      // Try to create form on first page
      if (pagesData.data?.length > 0) {
        const firstPage = pagesData.data[0];
        console.log(`\n📋 Testing form creation on page: ${firstPage.name}`);
        
        const pageFormResponse = await fetch(
          `https://graph.facebook.com/v19.0/${firstPage.id}/leadgen_forms`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: firstPage.access_token,
              name: 'TTM - Page Test Lead Form',
              description: 'Test form for Top Tier Men',
              questions: [
                {
                  type: 'FULL_NAME',
                  label: 'Vul je naam in',
                  required: true
                },
                {
                  type: 'EMAIL',
                  label: 'Vul je email adres in',
                  required: true
                }
              ]
            })
          }
        );

        if (pageFormResponse.ok) {
          const pageFormData = await pageFormResponse.json();
          console.log('✅ Can create lead forms on page level!');
          console.log(`📋 Page form created: ${pageFormData.name} (ID: ${pageFormData.id})`);
          
          // Delete the test form
          const deletePageFormResponse = await fetch(
            `https://graph.facebook.com/v19.0/${pageFormData.id}?access_token=${firstPage.access_token}`,
            { method: 'DELETE' }
          );
          
          if (deletePageFormResponse.ok) {
            console.log('✅ Page test form deleted successfully');
          }
        } else {
          const errorText = await pageFormResponse.text();
          console.error(`❌ Cannot create lead forms on page level:`, errorText);
        }
      }
    } else {
      const errorText = await pagesResponse.text();
      console.error(`❌ Failed to get pages:`, errorText);
    }

  } catch (error) {
    console.error('❌ Error listing lead forms:', error);
  }
}

listLeadForms();
