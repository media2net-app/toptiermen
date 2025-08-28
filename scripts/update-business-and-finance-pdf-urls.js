require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateBusinessFinancePDFUrls() {
  try {
    console.log('📚 UPDATING BUSINESS AND FINANCE EBOOK PDF URLs');
    console.log('================================================\n');

    // Find the Business and Finance module
    const { data: businessModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'business-and-finance-')
      .single();

    if (moduleError) {
      console.error('❌ Error finding business-and-finance- module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${businessModule.title} (ID: ${businessModule.id})\n`);

    // Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', businessModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons\n`);

    // Map of lesson titles to PDF file URLs
    const pdfMappings = {
      'De Financiële Mindset ': '/books/business-and-finance--de-financi-le-mindset--ebook.pdf',
      'Grip op je geld': '/books/business-and-finance--grip-op-je-geld-ebook.pdf',
      'Van Werknemer naar eigen Verdienmodellen': '/books/business-and-finance--van-werknemer-naar-eigen-verdienmodellen-ebook.pdf',
      'Vermogen Opbouwen Begin met Investeren': '/books/business-and-finance--vermogen-opbouwen-begin-met-investeren-ebook.pdf',
      'Financiële Vrijheid en Legacy ': '/books/business-and-finance--financi-le-vrijheid-en-legacy--ebook.pdf'
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
      console.log('\n🎉 All Business and Finance ebooks updated successfully!');
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
      .eq('academy_lessons.module_id', businessModule.id)
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

    console.log('✨ Business and Finance module conversion complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the update
updateBusinessFinancePDFUrls();
