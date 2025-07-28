import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST() {
  let client: Client | null = null;
  
  try {
    console.log('🔧 Setting up direct PostgreSQL connection...');

    // Get Supabase connection details
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase environment variables' 
      }, { status: 500 });
    }

    // Extract database connection details from Supabase URL
    const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const dbHost = `${projectId}.supabase.co`;
    const dbPort = 5432;
    const dbName = 'postgres';
    const dbUser = 'postgres';
    const dbPassword = supabaseServiceKey;

    console.log('🔗 Connecting to PostgreSQL database...');
    console.log('  Host:', dbHost);
    console.log('  Database:', dbName);
    console.log('  User:', dbUser);

    // Create PostgreSQL client
    client = new Client({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: {
        rejectUnauthorized: false,
        ca: undefined,
        key: undefined,
        cert: undefined
      }
    });

    // Connect to database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Check if affiliate columns already exist
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name IN ('affiliate_code', 'affiliate_status', 'total_referrals', 'active_referrals', 'total_earned', 'monthly_earnings', 'last_referral');
    `;

    const { rows: existingColumns } = await client.query(checkQuery);
    console.log('📋 Existing affiliate columns:', existingColumns.map(row => row.column_name));

    if (existingColumns.length === 7) {
      console.log('✅ All affiliate columns already exist');
      await client.end();
      return NextResponse.json({ 
        success: true, 
        message: 'All affiliate columns already exist',
        existingColumns: existingColumns.map(row => row.column_name)
      });
    }

    // Add affiliate columns
    const addColumnsQuery = `
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(50) UNIQUE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(20) DEFAULT 'inactive';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_referrals INTEGER DEFAULT 0;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0.00;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_earnings DECIMAL(10,2) DEFAULT 0.00;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_referral TIMESTAMP WITH TIME ZONE;
    `;

    console.log('🔧 Adding affiliate columns...');
    await client.query(addColumnsQuery);
    console.log('✅ Affiliate columns added successfully');

    // Create indexes
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);
      CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_status ON profiles(affiliate_status);
    `;

    console.log('🔧 Creating indexes...');
    await client.query(createIndexesQuery);
    console.log('✅ Indexes created successfully');

    // Update existing profiles with default codes
    const updateDefaultCodesQuery = `
      UPDATE profiles 
      SET affiliate_code = UPPER(REPLACE(COALESCE(full_name, 'USER'), ' ', '')) || SUBSTRING(id::text, -6)
      WHERE affiliate_code IS NULL;
    `;

    console.log('🔧 Updating default affiliate codes...');
    const { rowCount: updatedProfiles } = await client.query(updateDefaultCodesQuery);
    console.log(`✅ Updated ${updatedProfiles} profiles with default codes`);

    // Set specific affiliate code for Chiel
    const updateChielQuery = `
      UPDATE profiles 
      SET affiliate_code = 'CHIEL10'
      WHERE full_name ILIKE '%chiel%' OR email ILIKE '%chiel%';
    `;

    console.log('🔧 Setting CHIEL10 code for Chiel...');
    const { rowCount: updatedChiel } = await client.query(updateChielQuery);
    console.log(`✅ Updated ${updatedChiel} profiles for Chiel`);

    // Verify the setup
    const verifyQuery = `
      SELECT affiliate_code, affiliate_status, total_referrals, active_referrals, total_earned, monthly_earnings
      FROM profiles 
      LIMIT 3;
    `;

    const { rows: verificationData } = await client.query(verifyQuery);
    console.log('✅ Verification data:', verificationData);

    await client.end();
    console.log('✅ Database connection closed');

    return NextResponse.json({ 
      success: true, 
      message: 'Affiliate columns setup completed successfully',
      updatedProfiles,
      updatedChiel,
      verificationData
    });

  } catch (error) {
    console.error('❌ Error in direct PostgreSQL setup:', error);
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    
    if (client) {
      try {
        await client.end();
      } catch (endError) {
        console.error('❌ Error closing database connection:', endError);
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Database setup failed: ' + ((error as Error).message || 'Unknown error'),
      errorDetails: {
        name: (error as Error).name,
        message: (error as Error).message
      }
    }, { status: 500 });
  }
} 