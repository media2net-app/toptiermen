const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateScreenshotUrl() {
  try {
    console.log('🔧 Updating test note with screenshot URL...');

    const screenshotUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/bug-screenshots/screenshots/1754403928627-test-screenshot.png';
    
    const { data, error } = await supabase
      .from('test_notes')
      .update({ 
        screenshot_url: screenshotUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', '4a68a305-60cf-42d0-aa14-3cb2d708c24e')
      .select();

    if (error) {
      console.error('❌ Error updating test note:', error);
      return;
    }

    console.log('✅ Test note updated successfully:', data[0]);

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('test_notes')
      .select('id, description, screenshot_url, created_at')
      .eq('id', '4a68a305-60cf-42d0-aa14-3cb2d708c24e')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('✅ Verification successful:', verifyData);
    
  } catch (error) {
    console.error('❌ Error updating screenshot URL:', error);
  }
}

updateScreenshotUrl(); 