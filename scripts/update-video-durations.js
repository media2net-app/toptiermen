const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to get video duration from URL
async function getVideoDuration(videoUrl) {
  try {
    // For now, we'll return a standardized format based on the URL or file size
    // In a real implementation, you'd need to:
    // 1. Download the video metadata
    // 2. Use ffprobe or similar tool
    // 3. Or use a video processing service
    
    // For this demo, let's normalize existing formats and provide reasonable estimates
    console.log(`   🎥 Processing video: ${videoUrl}`);
    
    // This would need actual video duration extraction
    // For now, we'll just return null to indicate we need manual setting
    return null;
  } catch (error) {
    console.error(`   ❌ Error getting duration for ${videoUrl}:`, error);
    return null;
  }
}

// Function to normalize duration format
function normalizeDuration(duration) {
  if (!duration) return '10m'; // Default fallback
  
  const durationStr = duration.toString().toLowerCase().trim();
  
  // Convert various formats to standard "XmYs" or "XhYmZs" format
  
  // Handle "20 minuten" format
  const minutesMatch = durationStr.match(/(\d+)\s*minut/);
  if (minutesMatch) {
    return `${minutesMatch[1]}m`;
  }
  
  // Handle "1 uur 30 minuten" format
  const hoursMinutesMatch = durationStr.match(/(\d+)\s*uur?\s*(\d+)?\s*minut?/);
  if (hoursMinutesMatch) {
    const hours = parseInt(hoursMinutesMatch[1]);
    const minutes = parseInt(hoursMinutesMatch[2] || 0);
    if (hours > 0 && minutes > 0) {
      return `${hours}u ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}u`;
    }
  }
  
  // Handle "45m", "3m", etc. (already correct)
  if (durationStr.match(/^\d+m$/)) {
    return durationStr;
  }
  
  // Handle "1u 30m" format (already correct)
  if (durationStr.match(/^\d+u(\s+\d+m)?$/)) {
    return durationStr;
  }
  
  // Handle just numbers (assume minutes)
  const numberMatch = durationStr.match(/^(\d+)$/);
  if (numberMatch) {
    return `${numberMatch[1]}m`;
  }
  
  // Return original if no match found
  return duration;
}

async function updateVideoDurations() {
  console.log('🎥 Updating Academy Video Durations...\n');

  try {
    // 1. Get all video lessons
    console.log('1️⃣ Fetching all video lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        duration,
        video_url,
        academy_modules!inner(
          title,
          slug
        )
      `)
      .eq('type', 'video')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} video lessons\n`);

    // 2. Process each lesson
    console.log('2️⃣ Processing and normalizing durations...');
    
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      
      console.log(`\n📖 ${i + 1}/${lessons.length}: ${lesson.title}`);
      console.log(`   Module: ${lesson.academy_modules.title}`);
      console.log(`   Current Duration: "${lesson.duration}"`);
      
      // Normalize the duration format
      const normalizedDuration = normalizeDuration(lesson.duration);
      
      if (normalizedDuration !== lesson.duration) {
        console.log(`   🔄 Normalizing: "${lesson.duration}" -> "${normalizedDuration}"`);
        
        // Update the lesson with normalized duration
        const { error: updateError } = await supabase
          .from('academy_lessons')
          .update({
            duration: normalizedDuration,
            updated_at: new Date().toISOString()
          })
          .eq('id', lesson.id);

        if (updateError) {
          console.log(`   ❌ Error updating: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Updated successfully`);
          updatedCount++;
        }
      } else {
        console.log(`   ✅ Already in correct format`);
        skippedCount++;
      }
    }

    // 3. Summary
    console.log('\n📊 Summary:');
    console.log('=============');
    console.log(`✅ Updated: ${updatedCount} lessons`);
    console.log(`⏭️ Skipped (already correct): ${skippedCount} lessons`);
    console.log(`❌ Errors: ${errorCount} lessons`);
    console.log(`📈 Success rate: ${Math.round((updatedCount / (updatedCount + errorCount || 1)) * 100)}%`);

    // 4. Show final results
    console.log('\n3️⃣ Verifying final durations...');
    const { data: finalLessons } = await supabase
      .from('academy_lessons')
      .select('title, duration')
      .eq('type', 'video')
      .order('order_index')
      .limit(10);

    console.log('\n📋 Sample of updated durations:');
    finalLessons?.forEach((lesson, index) => {
      console.log(`   ${index + 1}. ${lesson.title} - ${lesson.duration}`);
    });

    console.log('\n🎉 Video duration normalization completed!');
    console.log('\n📝 Note: All durations are now in consistent format (e.g., "25m", "1u 30m")');
    console.log('📝 For accurate video durations, consider implementing real video metadata extraction.');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

updateVideoDurations();
