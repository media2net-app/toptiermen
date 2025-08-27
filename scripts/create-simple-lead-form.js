require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function createSimpleLeadForm() {
  try {
    console.log('🎯 Creating simple Facebook Lead Form...\n');
    
    // First, let's check what permissions we have
    console.log('📋 Checking permissions...');
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/permissions?access_token=${FACEBOOK_ACCESS_TOKEN}`
    );

    if (permissionsResponse.ok) {
      const permissionsData = await permissionsResponse.json();
      console.log('✅ Available permissions:');
      permissionsData.data?.forEach(permission => {
        console.log(`  - ${permission.permission}: ${permission.status}`);
      });
    }

    // Check if we have a page
    console.log('\n📋 Checking pages...');
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,access_token&limit=100`
    );

    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      console.log(`✅ Found ${pagesData.data?.length || 0} pages:`);
      
      if (pagesData.data?.length > 0) {
        const page = pagesData.data[0];
        console.log(`📋 Using page: ${page.name} (ID: ${page.id})`);
        
        // Try to create a simple lead form on this page
        console.log('\n🎯 Creating lead form on page...');
        
        const formData = {
          name: 'TTM - Pre Launch Lead Form',
          description: 'Schrijf je in voor de wachtlijst van Top Tier Men',
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
          ],
          intro: {
            title: 'Word een Top Tier Man',
            description: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk. Met mariniersdiscipline word jij een Top Tier Men.'
          },
          thank_you_page: {
            title: 'Bedankt voor je interesse!',
            description: 'Je bent ingeschreven voor de wachtlijst van Top Tier Men. Je staat nu op de wachtlijst en zit nergens aan vast.',
            button_text: 'Bezoek onze website',
            button_url: 'https://platform.toptiermen.eu/prelaunch'
          }
        };

        const createFormResponse = await fetch(
          `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: page.access_token,
              ...formData
            })
          }
        );

        if (createFormResponse.ok) {
          const formResult = await createFormResponse.json();
          console.log('✅ Lead form created successfully!');
          console.log(`📋 Form ID: ${formResult.id}`);
          console.log(`📋 Form name: ${formResult.name}`);
          console.log(`🔗 Form URL: https://business.facebook.com/latest/instant_forms/${formResult.id}`);
          
          return formResult;
        } else {
          const errorText = await createFormResponse.text();
          console.error('❌ Failed to create lead form:', errorText);
        }
      } else {
        console.log('❌ No pages found. You need to have a Facebook page to create lead forms.');
      }
    } else {
      const errorText = await pagesResponse.text();
      console.error('❌ Failed to get pages:', errorText);
    }

    return null;

  } catch (error) {
    console.error('❌ Error creating lead form:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 Creating Facebook Lead Form for Top Tier Men...\n');
  
  const formData = await createSimpleLeadForm();
  
  if (formData) {
    console.log('\n🎉 Lead Form Creation Summary:');
    console.log('==============================');
    console.log(`✅ Form created successfully`);
    console.log(`📋 Form ID: ${formData.id}`);
    console.log(`📋 Form name: ${formData.name}`);
    console.log(`🔗 Form URL: https://business.facebook.com/latest/instant_forms/${formData.id}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Review the form in Facebook Business Manager');
    console.log('2. Link the form to your LEADS campaigns');
    console.log('3. Test the form with real data');
    console.log('4. Monitor lead quality and conversion rates');
    
    console.log('\n⚠️  Important notes:');
    console.log('- Form includes name and email fields only');
    console.log('- Thank you page redirects to prelaunch page');
    console.log('- Form uses text from your prelaunch page');
  } else {
    console.log('\n❌ Failed to create lead form');
    console.log('\n📝 Alternative approach:');
    console.log('1. Create the lead form manually in Facebook Business Manager');
    console.log('2. Use the form ID in your LEADS campaigns');
    console.log('3. The form should have name and email fields');
    console.log('4. Use the text from your prelaunch page');
  }
}

main().catch(console.error);
