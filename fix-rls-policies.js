const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies...\n');
  
  try {
    // Drop existing policies
    console.log('Dropping existing policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view their own group memberships" ON brotherhood_group_members;
        DROP POLICY IF EXISTS "Users can view their own event registrations" ON brotherhood_event_attendees;
        DROP POLICY IF EXISTS "Users can insert their own group memberships" ON brotherhood_group_members;
        DROP POLICY IF EXISTS "Users can insert their own event registrations" ON brotherhood_event_attendees;
        DROP POLICY IF EXISTS "Users can view their own reviews" ON product_reviews;
        DROP POLICY IF EXISTS "Users can insert their own reviews" ON product_reviews;
        DROP POLICY IF EXISTS "Users can update their own reviews" ON product_reviews;
      `
    });
    
    // Create new permissive policies
    console.log('Creating new permissive policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- Brotherhood policies
        CREATE POLICY "Brotherhood groups are viewable by everyone" ON brotherhood_groups
          FOR SELECT USING (true);
          
        CREATE POLICY "Brotherhood events are viewable by everyone" ON brotherhood_events
          FOR SELECT USING (true);
          
        CREATE POLICY "Brotherhood group members are viewable by everyone" ON brotherhood_group_members
          FOR SELECT USING (true);
          
        CREATE POLICY "Brotherhood event attendees are viewable by everyone" ON brotherhood_event_attendees
          FOR SELECT USING (true);
          
        -- Product policies
        CREATE POLICY "Products are viewable by everyone" ON products
          FOR SELECT USING (true);
          
        CREATE POLICY "Product categories are viewable by everyone" ON product_categories
          FOR SELECT USING (true);
          
        CREATE POLICY "Product images are viewable by everyone" ON product_images
          FOR SELECT USING (true);
          
        CREATE POLICY "Product reviews are viewable by everyone" ON product_reviews
          FOR SELECT USING (true);
      `
    });
    
    console.log('✅ RLS policies fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error.message);
  }
}

fixRLSPolicies();
