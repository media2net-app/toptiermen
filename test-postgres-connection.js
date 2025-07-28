const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  let client = null;
  
  try {
    console.log('🔧 Testing PostgreSQL connection...');

    // Get Supabase connection details
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return;
    }

    // Extract database connection details
    const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const dbHost = `${projectId}.supabase.co`;
    const dbPort = 5432;
    const dbName = 'postgres';
    const dbUser = 'postgres';
    const dbPassword = supabaseServiceKey;

    console.log('🔗 Connection details:');
    console.log('  Host:', dbHost);
    console.log('  Database:', dbName);
    console.log('  User:', dbUser);
    console.log('  Password:', dbPassword ? '***' : 'MISSING');

    // Create PostgreSQL client
    client = new Client({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Connect to database
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Test query
    const { rows } = await client.query('SELECT NOW() as current_time');
    console.log('✅ Test query successful:', rows[0]);

    // Check if affiliate columns exist
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name IN ('affiliate_code', 'affiliate_status', 'total_referrals', 'active_referrals', 'total_earned', 'monthly_earnings', 'last_referral');
    `;

    const { rows: existingColumns } = await client.query(checkQuery);
    console.log('📋 Existing affiliate columns:', existingColumns.map(row => row.column_name));

    if (existingColumns.length === 7) {
      console.log('✅ All affiliate columns already exist!');
    } else {
      console.log('🔧 Adding affiliate columns...');
      
      // Add columns one by one
      const columns = [
        'affiliate_code VARCHAR(50) UNIQUE',
        'affiliate_status VARCHAR(20) DEFAULT \'inactive\'',
        'total_referrals INTEGER DEFAULT 0',
        'active_referrals INTEGER DEFAULT 0',
        'total_earned DECIMAL(10,2) DEFAULT 0.00',
        'monthly_earnings DECIMAL(10,2) DEFAULT 0.00',
        'last_referral TIMESTAMP WITH TIME ZONE'
      ];

      for (const column of columns) {
        try {
          await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${column};`);
          console.log(`✅ Added column: ${column.split(' ')[0]}`);
        } catch (error) {
          console.log(`⚠️ Could not add ${column.split(' ')[0]}:`, error.message);
        }
      }

      // Create indexes
      try {
        await client.query('CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_status ON profiles(affiliate_status);');
        console.log('✅ Indexes created');
      } catch (error) {
        console.log('⚠️ Could not create indexes:', error.message);
      }

      // Update default codes
      try {
        const { rowCount } = await client.query(`
          UPDATE profiles 
          SET affiliate_code = UPPER(REPLACE(COALESCE(full_name, 'USER'), ' ', '')) || SUBSTRING(id::text, -6)
          WHERE affiliate_code IS NULL;
        `);
        console.log(`✅ Updated ${rowCount} profiles with default codes`);
      } catch (error) {
        console.log('⚠️ Could not update default codes:', error.message);
      }

      // Set CHIEL10 for Chiel
      try {
        const { rowCount } = await client.query(`
          UPDATE profiles 
          SET affiliate_code = 'CHIEL10'
          WHERE full_name ILIKE '%chiel%' OR email ILIKE '%chiel%';
        `);
        console.log(`✅ Updated ${rowCount} profiles for Chiel`);
      } catch (error) {
        console.log('⚠️ Could not update Chiel:', error.message);
      }
    }

    // Verify final state
    const { rows: finalCheck } = await client.query(`
      SELECT affiliate_code, affiliate_status, total_referrals, active_referrals, total_earned, monthly_earnings
      FROM profiles 
      LIMIT 3;
    `);
    console.log('✅ Final verification:', finalCheck);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('✅ Database connection closed');
      } catch (error) {
        console.error('❌ Error closing connection:', error.message);
      }
    }
  }
}

testConnection(); 