const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDominiqueEmail() {
  try {
    console.log('📧 Adding Dominiqueboot@outlook.com to pre-launch email list...');
    
    const { data, error } = await supabase
      .from('prelaunch_emails')
      .insert({
        email: 'Dominiqueboot@outlook.com',
        name: 'Dominique Boot',
        source: 'Manual Admin Addition',
        status: 'active',
        package: 'BASIC',
        notes: 'Added manually by admin - interested in Top Tier Men platform'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('⚠️ Email already exists, updating...');
        
        const { data: updateData, error: updateError } = await supabase
          .from('prelaunch_emails')
          .update({
            name: 'Dominique Boot',
            source: 'Manual Admin Addition',
            status: 'active',
            package: 'BASIC',
            notes: 'Added manually by admin - interested in Top Tier Men platform',
            updated_at: new Date().toISOString()
          })
          .eq('email', 'Dominiqueboot@outlook.com')
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error updating email:', updateError);
          return;
        }

        console.log('✅ Successfully updated Dominiqueboot@outlook.com in pre-launch list');
        console.log('📋 Updated email details:', updateData);
      } else {
        console.error('❌ Error adding email:', error);
      }
    } else {
      console.log('✅ Successfully added Dominiqueboot@outlook.com to pre-launch list');
      console.log('📋 Email details:', data);
    }

    // Verify the email exists
    const { data: verifyData, error: verifyError } = await supabase
      .from('prelaunch_emails')
      .select('*')
      .eq('email', 'Dominiqueboot@outlook.com')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying email:', verifyError);
    } else {
      console.log('✅ Verification successful - email found in database');
      console.log('📋 Final email record:', verifyData);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
addDominiqueEmail();