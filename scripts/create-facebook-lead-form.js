require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

// Lead form configuration based on prelaunch page text
const LEAD_FORM_CONFIG = {
  name: 'TTM - Pre Launch Lead Form',
  description: 'Schrijf je in voor de wachtlijst van Top Tier Men',
  
  // Form fields
  fields: [
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
  
  // Form content based on prelaunch page
  intro: {
    title: 'Word een Top Tier Man',
    description: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk. Met mariniersdiscipline word jij een Top Tier Men.',
    image_url: 'https://platform.toptiermen.eu/rick-01.jpg'
  },
  
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
  
  // Thank you page content
  thank_you_page: {
    title: 'Bedankt voor je interesse!',
    description: 'Je bent ingeschreven voor de wachtlijst van Top Tier Men. Je staat nu op de wachtlijst en zit nergens aan vast. Je ontvangt in de dagen voor de lancering meer informatie over het platform en een exclusief aanbod voor de eerste 100 mannen die Top Tier Men joinen.',
    button_text: 'Bezoek onze website',
    button_url: 'https://platform.toptiermen.eu/prelaunch'
  },
  
  // Privacy policy and terms
  privacy_policy_url: 'https://platform.toptiermen.eu/privacy',
  terms_of_service_url: 'https://platform.toptiermen.eu/terms',
  
  // Lead form settings
  allow_organic_leads: false, // Only allow leads from ads
  context_card: {
    style: 'LIST',
    button_text: 'Schrijf je in voor de wachtlijst'
  }
};

async function createLeadForm() {
  try {
    console.log('🎯 Creating Facebook Lead Form...');
    console.log('📋 Form name:', LEAD_FORM_CONFIG.name);
    
    const createFormResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/leadgen_forms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          name: LEAD_FORM_CONFIG.name,
          description: LEAD_FORM_CONFIG.description,
          questions: LEAD_FORM_CONFIG.questions,
          intro: LEAD_FORM_CONFIG.intro,
          thank_you_page: LEAD_FORM_CONFIG.thank_you_page,
          privacy_policy_url: LEAD_FORM_CONFIG.privacy_policy_url,
          terms_of_service_url: LEAD_FORM_CONFIG.terms_of_service_url,
          allow_organic_leads: LEAD_FORM_CONFIG.allow_organic_leads,
          context_card: LEAD_FORM_CONFIG.context_card
        })
      }
    );

    if (!createFormResponse.ok) {
      const errorText = await createFormResponse.text();
      console.error('❌ Failed to create lead form:', errorText);
      return null;
    }

    const formData = await createFormResponse.json();
    console.log('✅ Lead form created successfully!');
    console.log('📋 Form ID:', formData.id);
    console.log('📋 Form name:', formData.name);
    
    return formData;

  } catch (error) {
    console.error('❌ Error creating lead form:', error);
    return null;
  }
}

async function testLeadForm(formId) {
  try {
    console.log('\n🧪 Testing lead form...');
    
    const testResponse = await fetch(
      `https://graph.facebook.com/v19.0/${formId}/test_leads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          field_data: [
            {
              name: 'full_name',
              values: ['Test User']
            },
            {
              name: 'email',
              values: ['test@example.com']
            }
          ]
        })
      }
    );

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ Failed to test lead form:', errorText);
      return false;
    }

    const testData = await testResponse.json();
    console.log('✅ Lead form test successful!');
    console.log('📋 Test lead ID:', testData.id);
    
    return true;

  } catch (error) {
    console.error('❌ Error testing lead form:', error);
    return false;
  }
}

async function getLeadFormDetails(formId) {
  try {
    console.log('\n📊 Getting lead form details...');
    
    const detailsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${formId}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,description,questions,intro,thank_you_page,privacy_policy_url,terms_of_service_url,allow_organic_leads,context_card,status,created_time`
    );

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('❌ Failed to get lead form details:', errorText);
      return null;
    }

    const details = await detailsResponse.json();
    console.log('✅ Lead form details retrieved!');
    
    return details;

  } catch (error) {
    console.error('❌ Error getting lead form details:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 Creating Facebook Lead Form for Top Tier Men...\n');
  
  // Step 1: Create the lead form
  const formData = await createLeadForm();
  
  if (!formData) {
    console.error('❌ Failed to create lead form');
    return;
  }
  
  // Step 2: Get form details
  const formDetails = await getLeadFormDetails(formData.id);
  
  if (formDetails) {
    console.log('\n📋 Lead Form Details:');
    console.log('====================');
    console.log(`ID: ${formDetails.id}`);
    console.log(`Name: ${formDetails.name}`);
    console.log(`Description: ${formDetails.description}`);
    console.log(`Status: ${formDetails.status}`);
    console.log(`Created: ${formDetails.created_time}`);
    console.log(`Privacy Policy: ${formDetails.privacy_policy_url}`);
    console.log(`Terms of Service: ${formDetails.terms_of_service_url}`);
    console.log(`Allow Organic Leads: ${formDetails.allow_organic_leads}`);
    
    console.log('\n📝 Questions:');
    formDetails.questions?.forEach((question, index) => {
      console.log(`  ${index + 1}. ${question.label} (${question.type}) - Required: ${question.required}`);
    });
    
    console.log('\n🎯 Intro:');
    console.log(`  Title: ${formDetails.intro?.title}`);
    console.log(`  Description: ${formDetails.intro?.description}`);
    console.log(`  Image: ${formDetails.intro?.image_url}`);
    
    console.log('\n🙏 Thank You Page:');
    console.log(`  Title: ${formDetails.thank_you_page?.title}`);
    console.log(`  Description: ${formDetails.thank_you_page?.description}`);
    console.log(`  Button Text: ${formDetails.thank_you_page?.button_text}`);
    console.log(`  Button URL: ${formDetails.thank_you_page?.button_url}`);
  }
  
  // Step 3: Test the form (optional)
  console.log('\n🧪 Testing lead form...');
  const testSuccess = await testLeadForm(formData.id);
  
  if (testSuccess) {
    console.log('✅ Lead form is working correctly!');
  } else {
    console.log('⚠️  Lead form test failed, but form was created');
  }
  
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
  console.log('5. Set up lead notifications in your CRM');
  
  console.log('\n⚠️  Important notes:');
  console.log('- Form only accepts leads from ads (organic leads disabled)');
  console.log('- Form includes name and email fields only');
  console.log('- Thank you page redirects to prelaunch page');
  console.log('- Privacy policy and terms URLs need to be valid');
}

main().catch(console.error);
