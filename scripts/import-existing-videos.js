const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importExistingVideos() {
  console.log('🚀 Starting import of existing videos...');
  
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
      created_by: null, // Will be set by RLS policy
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

// Run the import
importExistingVideos().catch(console.error);
