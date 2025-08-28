require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTestosteronPDFUrls() {
  try {
    console.log('📚 Updating Testosteron ebook PDF URLs...\n');

    // Find the Testosteron module
    const { data: testosteronModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'test')
      .single();

    if (moduleError) {
      console.error('❌ Error finding testosteron module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${testosteronModule.title} (ID: ${testosteronModule.id})\n`);

    // Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', testosteronModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons\n`);

    // Map of lesson titles to PDF file URLs
    const pdfMappings = {
      'Wat is Testosteron': '/books/testosteron-basis-ebook.pdf',
      'De Kracht van Hoog Testosteron': '/books/testosteron-kracht-ebook.pdf',
      'Testosteron Killers: Wat moet je Elimineren': '/books/testosteron-killers-ebook.pdf',
      'TRT en mijn Visie': '/books/testosteron-trt-ebook.pdf',
      'De Waarheid over Testosteron Doping': '/books/testosteron-doping-ebook.pdf'
    };

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
        continue;
      } else if (checkError) {
        console.error(`   ❌ Error checking ebook for ${lesson.title}:`, checkError);
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
      } else {
        console.log(`   ✅ Updated ebook: ${existingEbook.title}`);
        console.log(`      Old URL: ${existingEbook.file_url}`);
        console.log(`      New URL: ${pdfUrl}`);
      }
    }

    console.log('\n🎉 Finished updating Testosteron ebook PDF URLs!');

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
      .eq('academy_lessons.module_id', testosteronModule.id)
      .eq('status', 'published');

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('\n📋 Updated ebooks:');
      updatedEbooks?.forEach(ebook => {
        console.log(`   - ${ebook.title}`);
        console.log(`     URL: ${ebook.file_url}`);
        console.log(`     Lesson: ${ebook.academy_lessons?.title}`);
        console.log('');
      });
    }

    console.log('✨ All Testosteron ebooks now point to properly styled PDFs!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the update
updateTestosteronPDFUrls();
