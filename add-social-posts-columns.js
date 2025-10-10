const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addColumns() {
  console.log('🔍 Adding columns to social_posts table...\n');

  const columns = [
    { name: 'image_url', type: 'TEXT' },
    { name: 'video_url', type: 'TEXT' },
    { name: 'location', type: 'TEXT' },
    { name: 'tags', type: 'TEXT[]' }
  ];

  for (const column of columns) {
    console.log(`Adding column: ${column.name} (${column.type})`);
    
    const query = `ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`;
    
    const { error } = await supabase.rpc('exec_sql', { sql: query });
    
    if (error) {
      console.log(`⚠️  Error (might already exist): ${error.message}`);
    } else {
      console.log(`✅ Column ${column.name} added successfully`);
    }
  }

  console.log('\n✅ All columns processed!');
  console.log('\n📝 Note: You need to create the "social-media" storage bucket manually in Supabase Dashboard:');
  console.log('   1. Go to Storage in Supabase Dashboard');
  console.log('   2. Create new bucket: "social-media"');
  console.log('   3. Make it public');
  console.log('   4. Set file size limit to 10MB');
  console.log('   5. Allow MIME types: image/*');
}

addColumns().catch(console.error);

