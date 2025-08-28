require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateMentaleKrachtWeerbaarheidPDFUrls() {
  try {
    console.log('📚 UPDATING MENTALE KRACHT/WEERBAARHEID EBOOK PDF URLs');
    console.log('========================================================\n');

    // Find the Mentale Kracht/Weerbaarheid module
    const { data: mentaleModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'mentale-kracht-weerbaarheid')
      .single();

    if (moduleError) {
      console.error('❌ Error finding mentale-kracht-weerbaarheid module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${mentaleModule.title} (ID: ${mentaleModule.id})\n`);

    // Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', mentaleModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons\n`);

    // Map of lesson titles to PDF file URLs
    const pdfMappings = {
      'Wat is mentale kracht': '/books/mentale-kracht-weerbaarheid-wat-is-mentale-kracht-ebook.pdf',
      'Een Onbreekbare Mindset': '/books/mentale-kracht-weerbaarheid-een-onbreekbare-mindset-ebook.pdf',
      'Mentale Weerbaarheid in de Praktijk': '/books/mentale-kracht-weerbaarheid-mentale-weerbaarheid-in-de-praktijk-ebook.pdf',
      'Wordt Een Onbreekbare Man': '/books/mentale-kracht-weerbaarheid-wordt-een-onbreekbare-man-ebook.pdf',
      'Reflectie & Integratie': '/books/mentale-kracht-weerbaarheid-reflectie---integratie-ebook.pdf'
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
      console.log('\n🎉 All Mentale Kracht/Weerbaarheid ebooks updated successfully!');
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
      .eq('academy_lessons.module_id', mentaleModule.id)
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

    console.log('✨ Mentale Kracht/Weerbaarheid module conversion complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the update
updateMentaleKrachtWeerbaarheidPDFUrls();
