const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupVideosDatabase() {
  console.log('🚀 Setting up videos database...');
  
  // First, let's check if the videos table exists
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'videos');
  
  if (tablesError) {
    console.log('ℹ️ Could not check tables, proceeding with import...');
  } else if (tables && tables.length > 0) {
    console.log('✅ Videos table already exists');
  } else {
    console.log('⚠️ Videos table does not exist, creating it...');
    
    // Create the videos table using SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS videos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
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
    
    if (createError) {
      console.log('⚠️ Could not create table, proceeding with import anyway...');
    } else {
      console.log('✅ Videos table created');
    }
  }
  
  // Now import existing videos
  await importExistingVideos();
}

async function importExistingVideos() {
  console.log('📁 Importing existing videos...');
  
  const videosDir = path.join(process.cwd(), 'public', 'videos', 'advertenties');
  
  if (!fs.existsSync(videosDir)) {
    console.error('❌ Videos directory does not exist:', videosDir);
    return;
  }
  
  const files = fs.readdirSync(videosDir);
  const videoFiles = files.filter(file => 
    /\.(mp4|mov|avi|mkv|webm)$/i.test(file)
  );
  
  console.log(`📁 Found ${videoFiles.length} video files`);
  
  for (const fileName of videoFiles) {
    const filePath = path.join(videosDir, fileName);
    const stats = fs.statSync(filePath);
    
    // Create a clean name without extension
    const cleanName = fileName.replace(/\.[^/.]+$/, '');
    
    const videoData = {
      name: cleanName,
      original_name: fileName,
      file_path: `/videos/advertenties/${fileName}`,
      file_size: stats.size,
      mime_type: getMimeType(fileName),
      campaign_status: 'inactive',
      bucket_name: 'advertenties',
      is_deleted: false
    };
    
    try {
      // Check if video already exists
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('original_name', fileName)
        .single();
      
      if (existingVideo) {
        console.log(`⏭️  Skipping ${fileName} - already exists`);
        continue;
      }
      
      // Insert new video
      const { data, error } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error importing ${fileName}:`, error);
      } else {
        console.log(`✅ Imported ${fileName} with ID: ${data.id}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error);
    }
  }
  
  console.log('🎉 Import completed!');
}

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm'
  };
  return mimeTypes[ext] || 'video/mp4';
}

// Run the setup
setupVideosDatabase().catch(console.error);
