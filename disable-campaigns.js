const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('URL exists:', !!supabaseUrl);
  console.log('Key exists:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableCampaigns() {
  console.log('🛑 Disabling all email campaigns for safety...');
  
  try {
    const { data: result, error } = await supabase
      .from('bulk_email_campaigns')
      .update({ 
        status: 'disabled',
        updated_at: new Date().toISOString()
      })
      .eq('id', '84bceade-eec6-4349-958f-6b04be0d3003');

    if (error) {
      console.error('❌ Error updating campaign:', error);
      return;
    }

    console.log('✅ Campaign 2 disabled successfully');
    
    const { data: campaigns, error: listError } = await supabase
      .from('bulk_email_campaigns')
      .select('id, name, status')
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('❌ Error listing campaigns:', listError);
      return;
    }

    console.log('📋 Current campaign statuses:');
    campaigns.forEach(campaign => {
      console.log(`   • ${campaign.name}: ${campaign.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

disableCampaigns();
