import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔧 Attempting direct database connection...');

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
    // Supabase URL format: https://[project-id].supabase.co
    const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    
    console.log('📋 Supabase Project ID:', projectId);
    console.log('🔑 Service Key available:', !!supabaseServiceKey);

    // Try to construct a direct PostgreSQL connection string
    const dbHost = `${projectId}.supabase.co`;
    const dbPort = 5432;
    const dbName = 'postgres';
    const dbUser = 'postgres';
    
    // The service key contains the password
    const dbPassword = supabaseServiceKey;

    console.log('🔗 Database connection details:');
    console.log('  Host:', dbHost);
    console.log('  Port:', dbPort);
    console.log('  Database:', dbName);
    console.log('  User:', dbUser);
    console.log('  Password:', dbPassword ? '***' : 'MISSING');

    // Since we can't use direct PostgreSQL connection in this environment,
    // let's provide the user with the exact connection details they need

    const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection details retrieved',
      connectionInfo: {
        host: dbHost,
        port: dbPort,
        database: dbName,
        user: dbUser,
        password: '***' // masked for security
      },
      sqlCommands: [
        '-- Run these commands in Supabase SQL Editor:',
        '',
        '-- Add affiliate columns to profiles table',
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(50) UNIQUE;',
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(20) DEFAULT \'inactive\';',
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;',
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_referrals INTEGER DEFAULT 0;',
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0.00;',
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_earnings DECIMAL(10,2) DEFAULT 0.00;',
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_referral TIMESTAMP WITH TIME ZONE;',
        '',
        '-- Create indexes',
        'CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);',
        'CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_status ON profiles(affiliate_status);',
        '',
        '-- Update existing profiles with default codes',
        'UPDATE profiles SET affiliate_code = UPPER(REPLACE(COALESCE(full_name, \'USER\'), \' \', \'\')) || SUBSTRING(id::text, -6) WHERE affiliate_code IS NULL;',
        '',
        '-- Set specific code for Chiel',
        'UPDATE profiles SET affiliate_code = \'CHIEL10\' WHERE full_name ILIKE \'%chiel%\' OR email ILIKE \'%chiel%\';'
      ],
      instructions: [
        '1. Go to your Supabase Dashboard',
        '2. Navigate to SQL Editor',
        '3. Copy and paste the SQL commands above',
        '4. Click "Run" to execute',
        '5. The affiliate fields will be added to your profiles table'
      ]
    });

  } catch (error) {
    console.error('❌ Error getting database connection details:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get database connection details: ' + (error as Error).message 
    }, { status: 500 });
  }
} 