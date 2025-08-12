const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAcademyVideoUrls() {
  try {
    console.log('🎓 Updating academy video URLs to full CDN URLs...\n');

    // 1. Get all academy lessons with bucket paths
    console.log('1️⃣ Fetching academy lessons with bucket paths...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, video_url')
      .like('video_url', 'academy-videos/%');

    if (lessonsError) {
      console.log('❌ Error fetching lessons:', lessonsError.message);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons with bucket paths`);

    if (!lessons || lessons.length === 0) {
      console.log('✅ No lessons need updating - all URLs are already CDN URLs');
      return;
    }

    // 2. Update video URLs to full CDN URLs
    console.log('\n2️⃣ Updating video URLs...');
    let updatedCount = 0;
    let errorCount = 0;

    for (const lesson of lessons) {
      const fullCdnUrl = `https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/${lesson.video_url}`;
      
      console.log(`\n📖 Updating: ${lesson.title}`);
      console.log(`   From: ${lesson.video_url}`);
      console.log(`   To: ${fullCdnUrl}`);

      const { error: updateError } = await supabase
        .from('academy_lessons')
        .update({ 
          video_url: fullCdnUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', lesson.id);

      if (updateError) {
        console.log(`❌ Error updating ${lesson.title}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ Successfully updated: ${lesson.title}`);
        updatedCount++;
      }
    }

    // 3. Verify the updates
    console.log('\n3️⃣ Verifying updates...');
    const { data: updatedLessons, error: verifyError } = await supabase
      .from('academy_lessons')
      .select('title, video_url')
      .like('video_url', 'https://wkjvstuttbeyqzyjayxj.supabase.co%')
      .limit(5);

    if (verifyError) {
      console.log('❌ Error verifying updates:', verifyError.message);
    } else {
      console.log(`✅ Found ${updatedLessons?.length || 0} lessons with CDN URLs:`);
      updatedLessons?.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.title} -> ${lesson.video_url.substring(0, 80)}...`);
      });
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} lessons`);
    console.log(`   ❌ Errors: ${errorCount} lessons`);
    console.log(`   🎯 Success rate: ${Math.round((updatedCount / (updatedCount + errorCount)) * 100)}%`);

    console.log('\n🎉 Academy video URL update completed!');
    console.log('\n📝 Note: The video player should now work correctly with full CDN URLs.');

  } catch (error) {
    console.error('❌ Error updating academy video URLs:', error);
  }
}

updateAcademyVideoUrls();
