require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to create a URL-friendly slug
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
}

async function addLessonSlugs() {
  try {
    console.log('🔧 Adding slugs to academy lessons...\n');

    // First, check if lessons table has slug column
    console.log('1️⃣ Checking database structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'academy_lessons' 
          AND column_name = 'slug'
        `
      });

    if (tableError) {
      console.error('❌ Error checking table structure:', tableError);
      return;
    }

    // Add slug column if it doesn't exist
    if (!tableInfo || tableInfo.length === 0) {
      console.log('📝 Adding slug column to academy_lessons table...');
      const { error: alterError } = await supabase
        .rpc('exec_sql', {
          sql_query: `
            ALTER TABLE academy_lessons 
            ADD COLUMN IF NOT EXISTS slug VARCHAR(255)
          `
        });

      if (alterError) {
        console.error('❌ Error adding slug column:', alterError);
        return;
      }
      console.log('✅ Slug column added successfully');
    } else {
      console.log('✅ Slug column already exists');
    }

    // Get all lessons with their module information
    console.log('\n2️⃣ Fetching all lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        module_id,
        slug,
        academy_modules!inner(
          id,
          title,
          slug
        )
      `)
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons\n`);

    // Process each lesson
    let updatedCount = 0;
    let skippedCount = 0;

    for (const lesson of lessons || []) {
      // Create slug from lesson title
      const newSlug = createSlug(lesson.title);
      
      // Check if slug already exists and is correct
      if (lesson.slug === newSlug) {
        console.log(`⏭️  Lesson "${lesson.title}" already has correct slug: ${lesson.slug}`);
        skippedCount++;
        continue;
      }

      // Update lesson with new slug
      console.log(`📝 Updating lesson "${lesson.title}"`);
      console.log(`   Old slug: ${lesson.slug || 'NONE'}`);
      console.log(`   New slug: ${newSlug}`);

      const { error: updateError } = await supabase
        .from('academy_lessons')
        .update({ 
          slug: newSlug,
          updated_at: new Date().toISOString()
        })
        .eq('id', lesson.id);

      if (updateError) {
        console.error(`   ❌ Error updating lesson:`, updateError.message);
      } else {
        console.log(`   ✅ Updated successfully`);
        updatedCount++;
      }
      console.log('');
    }

    // Summary
    console.log('📊 UPDATE SUMMARY');
    console.log('=================');
    console.log(`Total lessons: ${lessons?.length || 0}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (already correct): ${skippedCount}`);

    // Show example URLs
    console.log('\n🔗 EXAMPLE NEW URLS:');
    console.log('=====================');
    const sampleLessons = lessons?.slice(0, 5) || [];
    sampleLessons.forEach(lesson => {
      const moduleSlug = lesson.academy_modules.slug;
      const lessonSlug = createSlug(lesson.title);
      console.log(`📚 ${lesson.title}`);
      console.log(`   Old: /dashboard/academy/${lesson.module_id}/${lesson.id}`);
      console.log(`   New: /dashboard/academy/${moduleSlug}/${lessonSlug}`);
      console.log('');
    });

    console.log('🎯 Next steps:');
    console.log('1. Update the routing logic to support both UUID and slug-based URLs');
    console.log('2. Test that old URLs still work (backward compatibility)');
    console.log('3. Update all internal links to use the new slug-based URLs');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
addLessonSlugs();
