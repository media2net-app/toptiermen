require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

if (!facebookAppId) {
  console.error('❌ Missing Facebook App ID');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupFacebookIntegration() {
  console.log('🔧 Setting up Facebook Marketing API Integration...\n');

  try {
    // 1. Verify environment setup
    console.log('📋 Environment Setup:');
    console.log(`   Facebook App ID: ${facebookAppId}`);
    console.log(`   Supabase URL: ${supabaseUrl ? 'Configured' : 'NOT CONFIGURED'}`);
    console.log(`   Supabase Key: ${supabaseAnonKey ? 'Configured' : 'NOT CONFIGURED'}`);
    console.log('');

    // 2. Create Facebook integration table if it doesn't exist
    console.log('📝 Creating Facebook integration table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS facebook_integration (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          access_token TEXT NOT NULL,
          user_id_facebook TEXT,
          app_id TEXT NOT NULL DEFAULT '1089360419953590',
          permissions TEXT[],
          token_expires_at TIMESTAMP WITH TIME ZONE,
          ad_accounts JSONB,
          business_accounts JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    });

    if (tableError) {
      console.log('   ⚠️  Could not create table (might already exist):', tableError.message);
    } else {
      console.log('   ✅ Facebook integration table created');
    }

    // 3. Enable RLS on the table
    console.log('🔒 Setting up RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE facebook_integration ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view their own facebook integration" ON facebook_integration;
        CREATE POLICY "Users can view their own facebook integration" ON facebook_integration
          FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update their own facebook integration" ON facebook_integration;
        CREATE POLICY "Users can update their own facebook integration" ON facebook_integration
          FOR UPDATE USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert their own facebook integration" ON facebook_integration;
        CREATE POLICY "Users can insert their own facebook integration" ON facebook_integration
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });

    if (rlsError) {
      console.log('   ⚠️  Could not set up RLS policies:', rlsError.message);
    } else {
      console.log('   ✅ RLS policies created');
    }

    // 4. Create indexes
    console.log('📊 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_facebook_integration_user_id ON facebook_integration(user_id);
        CREATE INDEX IF NOT EXISTS idx_facebook_integration_is_active ON facebook_integration(is_active);
      `
    });

    if (indexError) {
      console.log('   ⚠️  Could not create indexes:', indexError.message);
    } else {
      console.log('   ✅ Indexes created');
    }

    // 5. Instructions for token setup
    console.log('🔑 Facebook Access Token Setup:');
    console.log('');
    console.log('📋 To complete the setup, you need to:');
    console.log('');
    console.log('1. **Copy the access token** from Facebook App Dashboard');
    console.log('   Token: EAAPexHzdG7YBPLbclyRpgNovSwB84K9fxhw7c7VnxEj5AEYr4ySi7p0z517LuqozTYFOTCjpZB08S2VRIXzwB7NPcL506BVIPzIDqOytXw0VUJIIMvZBqfc01ATi6PvEyIW16ps9nRbX09yCdRW16p4zvHi5xLBbTM30dGASZBrBqF6ObxL0yVZCkgoxqZAySOukZD');
    console.log('');
    console.log('2. **Add it to your environment variables**:');
    console.log('   Add this line to your .env.local file:');
    console.log('   FACEBOOK_ACCESS_TOKEN=your_token_here');
    console.log('');
    console.log('3. **Or store it in the database** for a specific user');
    console.log('');
    console.log('4. **Test the integration** with:');
    console.log('   node scripts/test-facebook-integration.js');
    console.log('');

    // 6. Create test integration script
    console.log('📝 Creating test integration script...');
    const testScript = `
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || 'EAAPexHzdG7YBPLbclyRpgNovSwB84K9fxhw7c7VnxEj5AEYr4ySi7p0z517LuqozTYFOTCjpZB08S2VRIXzwB7NPcL506BVIPzIDqOytXw0VUJIIMvZBqfc01ATi6PvEyIW16ps9nRbX09yCdRW16p4zvHi5xLBbTM30dGASZBrBqF6ObxL0yVZCkgoxqZAySOukZD';

async function testIntegration() {
  console.log('🔍 Testing Facebook Integration...');
  
  try {
    // Test basic API call
    const response = await fetch(\`https://graph.facebook.com/v18.0/me?access_token=\${accessToken}\`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Integration successful!');
      console.log(\`User ID: \${data.id}\`);
      console.log(\`Name: \${data.name}\`);
    } else {
      console.log('❌ Integration failed:', data.error?.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testIntegration();
`;

    require('fs').writeFileSync('scripts/test-facebook-integration.js', testScript);
    console.log('   ✅ Test script created: scripts/test-facebook-integration.js');

    console.log('');
    console.log('🎉 Facebook Integration Setup Completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Add FACEBOOK_ACCESS_TOKEN to .env.local');
    console.log('   2. Test the integration');
    console.log('   3. Integrate with Top Tier Men platform');
    console.log('');

  } catch (error) {
    console.error('❌ Error setting up Facebook integration:', error);
  }
}

// Run the setup
setupFacebookIntegration()
  .then(() => {
    console.log('✅ Setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
