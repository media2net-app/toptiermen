require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateVoedingGezondheidPDFUrls() {
  try {
    console.log('📚 UPDATING VOEDING & GEZONDHEID EBOOK PDF URLs');
    console.log('================================================\n');

    // Find the Voeding & Gezondheid module
    const { data: voedingModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'voeding-gezondheid')
      .single();

    if (moduleError) {
      console.error('❌ Error finding voeding-gezondheid module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${voedingModule.title} (ID: ${voedingModule.id})\n`);

    // Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', voedingModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons\n`);

    // Map of lesson titles to PDF file URLs
    const pdfMappings = {
      'De Basisprincipes van Voeding': '/books/voeding-gezondheid-de-basisprincipes-van-voeding-ebook.pdf',
      'Hydratatie en Water inname': '/books/voeding-gezondheid-hydratatie-en-water-inname-ebook.pdf',
      'Slaap de vergeten superkracht': '/books/voeding-gezondheid-slaap-de-vergeten-superkracht-ebook.pdf',
      'Energie en Focus': '/books/voeding-gezondheid-energie-en-focus-ebook.pdf',
      'Gezondheid als Fundament': '/books/voeding-gezondheid-gezondheid-als-fundament-ebook.pdf',
      'Praktische opdracht: stel je eigen voedingsplan op': '/books/voeding-gezondheid-praktische-opdracht--stel-je-eigen-voedingsplan-op-ebook.pdf'
    };

    let updatedCount = 0;
    let errorCount = 0;

    // Update each ebook record
    for (const lesson of lessons || []) {
      console.log(`📖 Processing lesson: ${lesson.title}`);

      const pdfUrl = pdfMappings[lesson.title];
      if (!pdfUrl) {
        console.log(`   ⚠️  No PDF mapping found for: ${lesson.title}`);
        continue;
      }

      // Check if ebook exists
      const { data: existingEbook, error: checkError } = await supabase
        .from('academy_ebooks')
        .select('id, title, file_url')
        .eq('lesson_id', lesson.id)
        .eq('status', 'published')
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        console.log(`   ❌ No ebook found for: ${lesson.title}`);
        errorCount++;
        continue;
      } else if (checkError) {
        console.error(`   ❌ Error checking ebook for ${lesson.title}:`, checkError);
        errorCount++;
        continue;
      }

      // Update the ebook with new PDF URL
      const { error: updateError } = await supabase
        .from('academy_ebooks')
        .update({
          file_url: pdfUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEbook.id);

      if (updateError) {
        console.error(`   ❌ Error updating ebook for ${lesson.title}:`, updateError);
        errorCount++;
      } else {
        console.log(`   ✅ Updated ebook: ${existingEbook.title}`);
        console.log(`      Old URL: ${existingEbook.file_url}`);
        console.log(`      New URL: ${pdfUrl}`);
        updatedCount++;
      }
    }

    console.log('\n📊 UPDATE SUMMARY');
    console.log('==================');
    console.log(`📚 Total lessons: ${lessons?.length || 0}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Success rate: ${((updatedCount / (lessons?.length || 1)) * 100).toFixed(1)}%`);

    if (updatedCount === lessons?.length) {
      console.log('\n🎉 All Voeding & Gezondheid ebooks updated successfully!');
      console.log('✨ Database now points to PDF files');
    } else {
      console.log('\n⚠️  Some updates failed. Please check the errors above.');
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const { data: updatedEbooks, error: verifyError } = await supabase
      .from('academy_ebooks')
      .select(`
        id,
        title,
        file_url,
        academy_lessons (
          title
        )
      `)
      .eq('academy_lessons.module_id', voedingModule.id)
      .eq('status', 'published');

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('\n📋 Updated ebooks:');
      updatedEbooks?.forEach(ebook => {
        const isPDF = ebook.file_url && ebook.file_url.toLowerCase().endsWith('.pdf');
        const status = isPDF ? '✅' : '❌';
        console.log(`   ${status} ${ebook.title}`);
        console.log(`      URL: ${ebook.file_url}`);
        console.log(`      Lesson: ${ebook.academy_lessons?.title}`);
        console.log('');
      });
    }

    console.log('✨ Voeding & Gezondheid module conversion complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the update
updateVoedingGezondheidPDFUrls();
