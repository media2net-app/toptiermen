import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up videos table...');

    // Create the videos table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS videos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL UNIQUE,
          file_path VARCHAR(500) NOT NULL,
          file_size BIGINT NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          duration_seconds INTEGER,
          width INTEGER,
          height INTEGER,
          target_audience TEXT,
          campaign_status VARCHAR(20) DEFAULT 'inactive' CHECK (campaign_status IN ('active', 'inactive')),
          bucket_name VARCHAR(100) DEFAULT 'advertenties',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID,
          is_deleted BOOLEAN DEFAULT FALSE
        );
      `
    });

    if (createTableError) {
      console.error('❌ Error creating table:', createTableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create videos table',
        details: createTableError 
      }, { status: 500 });
    }

    console.log('✅ Videos table created successfully');

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_videos_bucket_name ON videos(bucket_name);
        CREATE INDEX IF NOT EXISTS idx_videos_campaign_status ON videos(campaign_status);
        CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
      `
    });

    if (indexError) {
      console.error('⚠️ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE videos ENABLE ROW LEVEL SECURITY;`
    });

    if (rlsError) {
      console.error('⚠️ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Create RLS policies
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view videos" ON videos;
        CREATE POLICY "Users can view videos" ON videos FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Users can insert videos" ON videos;
        CREATE POLICY "Users can insert videos" ON videos FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Users can update videos" ON videos;
        CREATE POLICY "Users can update videos" ON videos FOR UPDATE USING (true);
        
        DROP POLICY IF EXISTS "Users can delete videos" ON videos;
        CREATE POLICY "Users can delete videos" ON videos FOR DELETE USING (true);
      `
    });

    if (policiesError) {
      console.error('⚠️ Error creating policies:', policiesError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // Insert sample videos
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO videos (name, original_name, file_path, file_size, mime_type, campaign_status, bucket_name, is_deleted) VALUES
        ('TTM_Het_Merk_Prelaunch_Reel_01_V2', 'TTM_Het_Merk_Prelaunch_Reel_01_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_01_V2.mov', 29068067, 'video/quicktime', 'active', 'advertenties', false),
        ('TTM_Het_Merk_Prelaunch_Reel_02_V2', 'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_02_V2.mov', 28255179, 'video/quicktime', 'active', 'advertenties', false),
        ('TTM_Het_Merk_Prelaunch_Reel_03_V2', 'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_03_V2.mov', 28295891, 'video/quicktime', 'active', 'advertenties', false),
        ('TTM_Het_Merk_Prelaunch_Reel_04_V2', 'TTM_Het_Merk_Prelaunch_Reel_04_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_04_V2.mov', 29115492, 'video/quicktime', 'inactive', 'advertenties', false),
        ('TTM_Het_Merk_Prelaunch_Reel_05_V2', 'TTM_Het_Merk_Prelaunch_Reel_05_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_05_V2.mov', 38721989, 'video/quicktime', 'inactive', 'advertenties', false),
        ('TTM_Jeugd_Prelaunch_Reel_01_V2', 'TTM_Jeugd_Prelaunch_Reel_01_V2.mov', '/videos/advertenties/TTM_Jeugd_Prelaunch_Reel_01_V2.mov', 32705119, 'video/quicktime', 'inactive', 'advertenties', false),
        ('TTM_Jeugd_Prelaunch_Reel_02_V2', 'TTM_Jeugd_Prelaunch_Reel_02_V2.mov', '/videos/advertenties/TTM_Jeugd_Prelaunch_Reel_02_V2.mov', 38990079, 'video/quicktime', 'inactive', 'advertenties', false),
        ('TTM_Vader_Prelaunch_Reel_01_V2', 'TTM_Vader_Prelaunch_Reel_01_V2.mov', '/videos/advertenties/TTM_Vader_Prelaunch_Reel_01_V2.mov', 32788453, 'video/quicktime', 'inactive', 'advertenties', false),
        ('TTM_Vader_Prelaunch_Reel_02_V2', 'TTM_Vader_Prelaunch_Reel_02_V2.mov', '/videos/advertenties/TTM_Vader_Prelaunch_Reel_02_V2.mov', 30234110, 'video/quicktime', 'inactive', 'advertenties', false),
        ('TTM_Zakelijk_Prelaunch_Reel_01_V2', 'TTM_Zakelijk_Prelaunch_Reel_01_V2.mov', '/videos/advertenties/TTM_Zakelijk_Prelaunch_Reel_01_V2.mov', 41052881, 'video/quicktime', 'inactive', 'advertenties', false),
        ('TTM_Zakelijk_Prelaunch_Reel_02_V2', 'TTM_Zakelijk_Prelaunch_Reel_02_V2.mov', '/videos/advertenties/TTM_Zakelijk_Prelaunch_Reel_02_V2.mov', 41056769, 'video/quicktime', 'inactive', 'advertenties', false)
        ON CONFLICT (original_name) DO NOTHING;
      `
    });

    if (insertError) {
      console.error('⚠️ Error inserting sample videos:', insertError);
    } else {
      console.log('✅ Sample videos inserted successfully');
    }

    // Verify the table was created
    const { data: videos, error: selectError } = await supabase
      .from('videos')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ Error verifying table:', selectError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to verify videos table',
        details: selectError 
      }, { status: 500 });
    }

    console.log('✅ Videos table setup completed successfully');
    console.log(`📊 Found ${videos?.length || 0} videos in table`);

    return NextResponse.json({ 
      success: true, 
      message: 'Videos table setup completed successfully',
      videoCount: videos?.length || 0
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: error 
    }, { status: 500 });
  }
}
