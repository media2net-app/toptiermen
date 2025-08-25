require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAllAcademyEbooksToDatabase() {
  try {
    console.log('📚 Adding all Academy ebooks to database...\n');

    // 1. Get all published modules with lessons
    console.log('1️⃣ Fetching all published modules and lessons...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id,
        title,
        slug,
        order_index,
        status,
        academy_lessons(
          id,
          title,
          order_index,
          status
        )
      `)
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules\n`);

    // 2. Get existing ebooks from database
    console.log('2️⃣ Fetching existing ebooks from database...');
    const { data: existingEbooks, error: ebooksError } = await supabase
      .from('academy_ebooks')
      .select('lesson_id, title, file_url');

    if (ebooksError) {
      console.error('❌ Error fetching existing ebooks:', ebooksError);
      return;
    }

    console.log(`✅ Found ${existingEbooks?.length || 0} existing ebooks in database\n`);

    // 3. Process each module and lesson
    let totalEbooksAdded = 0;
    let totalEbooksSkipped = 0;

    for (const module of modules || []) {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      
      console.log(`📚 Processing module: ${module.title} (${publishedLessons.length} lessons)`);
      
      for (const lesson of publishedLessons) {
        // Check if ebook already exists in database
        const existingEbook = existingEbooks?.find(ebook => ebook.lesson_id === lesson.id);
        
        if (existingEbook) {
          console.log(`   ⏭️  Skipped: ${lesson.title} (already exists in database)`);
          totalEbooksSkipped++;
          continue;
        }

        // Create filename
        const moduleSlug = module.slug.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const lessonSlug = lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const filename = `${moduleSlug}-${lessonSlug}-ebook.html`;
        const fileUrl = `/books/${filename}`;

        // Check if HTML file exists
        const booksDir = path.join(__dirname, '../public/books');
        const filepath = path.join(booksDir, filename);
        
        if (!fs.existsSync(filepath)) {
          console.log(`   ⚠️  Warning: ${filename} not found in filesystem`);
          continue;
        }

        // Add ebook to database
        const { data: newEbook, error: insertError } = await supabase
          .from('academy_ebooks')
          .insert({
            lesson_id: lesson.id,
            title: lesson.title,
            file_url: fileUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error(`   ❌ Error adding ebook for ${lesson.title}:`, insertError.message);
          continue;
        }

        console.log(`   ✅ Added: ${lesson.title} (${filename})`);
        totalEbooksAdded++;
      }
      
      console.log('');
    }

    // 4. Summary
    console.log('📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total Modules Processed: ${modules?.length || 0}`);
    console.log(`Ebooks Added to Database: ${totalEbooksAdded}`);
    console.log(`Ebooks Skipped: ${totalEbooksSkipped}`);
    console.log(`Total Ebooks in Database: ${(existingEbooks?.length || 0) + totalEbooksAdded}`);
    
    if (totalEbooksAdded > 0) {
      console.log('\n🎉 Successfully added ebooks to database!');
      console.log('📁 Database records created for all HTML ebooks');
    } else {
      console.log('\nℹ️  All ebooks already exist in database!');
    }

    // 5. Verify final count
    console.log('\n🔍 Verifying final ebook count...');
    const { data: finalEbooks, error: finalError } = await supabase
      .from('academy_ebooks')
      .select('id, title, lesson_id');

    if (!finalError) {
      console.log(`✅ Total ebooks in database: ${finalEbooks?.length || 0}`);
      
      // Count by module
      const moduleCounts = {};
      for (const module of modules || []) {
        const moduleLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
        const moduleEbooks = finalEbooks?.filter(ebook => 
          moduleLessons.some(lesson => lesson.id === ebook.lesson_id)
        ) || [];
        moduleCounts[module.title] = moduleEbooks.length;
      }
      
      console.log('\n📚 Ebooks per module:');
      Object.entries(moduleCounts).forEach(([moduleTitle, count]) => {
        console.log(`   ${moduleTitle}: ${count} ebooks`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAllAcademyEbooksToDatabase();
