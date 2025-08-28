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

async function verifyEbookSystem() {
  try {
    console.log('🔍 VERIFYING EBOOK SYSTEM');
    console.log('==========================\n');

    // 1. Check Testosteron module
    console.log('📋 STEP 1: Checking Testosteron module...');
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

    // 2. Check lessons
    console.log('📋 STEP 2: Checking lessons...');
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

    // 3. Check ebooks for each lesson
    console.log('📋 STEP 3: Checking ebooks...');
    let totalEbooks = 0;
    let missingEbooks = 0;

    for (const lesson of lessons || []) {
      console.log(`📖 Lesson: ${lesson.title}`);
      
      const { data: ebook, error: ebookError } = await supabase
        .from('academy_ebooks')
        .select(`
          id,
          title,
          file_url,
          file_size,
          page_count,
          status
        `)
        .eq('lesson_id', lesson.id)
        .eq('status', 'published')
        .single();

      if (ebookError && ebookError.code === 'PGRST116') {
        console.log(`   ❌ No ebook found`);
        missingEbooks++;
      } else if (ebookError) {
        console.error(`   ❌ Error checking ebook:`, ebookError);
        missingEbooks++;
      } else {
        console.log(`   ✅ Ebook: ${ebook.title}`);
        console.log(`      URL: ${ebook.file_url}`);
        console.log(`      Size: ${ebook.file_size ? (ebook.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}`);
        console.log(`      Pages: ${ebook.page_count || 'Unknown'}`);
        totalEbooks++;
      }
      console.log('');
    }

    // 4. Check PDF files on disk
    console.log('📋 STEP 4: Checking PDF files on disk...');
    const booksDir = path.join(__dirname, '../public/books');
    const expectedPDFs = [
      'testosteron-basis-ebook.pdf',
      'testosteron-kracht-ebook.pdf',
      'testosteron-killers-ebook.pdf',
      'testosteron-trt-ebook.pdf',
      'testosteron-doping-ebook.pdf'
    ];

    let pdfsExist = 0;
    let totalSize = 0;

    for (const pdfFile of expectedPDFs) {
      const pdfPath = path.join(booksDir, pdfFile);
      
      if (fs.existsSync(pdfPath)) {
        const stats = fs.statSync(pdfPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        totalSize += stats.size;
        pdfsExist++;
        
        console.log(`   ✅ ${pdfFile} (${fileSizeInMB} MB)`);
      } else {
        console.log(`   ❌ ${pdfFile} - MISSING`);
      }
    }

    // 5. Summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`📚 Module: ${testosteronModule.title}`);
    console.log(`📖 Lessons: ${lessons?.length || 0}`);
    console.log(`📄 Ebooks in database: ${totalEbooks}`);
    console.log(`❌ Missing ebooks: ${missingEbooks}`);
    console.log(`📁 PDF files on disk: ${pdfsExist}/${expectedPDFs.length}`);
    console.log(`📊 Total PDF size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // 6. Status assessment
    console.log('\n🎯 STATUS ASSESSMENT:');
    console.log('====================');
    
    if (totalEbooks === lessons?.length && pdfsExist === expectedPDFs.length) {
      console.log('✅ PERFECT: All ebooks and PDFs are present!');
      console.log('✨ The ebook system is fully functional.');
    } else if (totalEbooks === lessons?.length) {
      console.log('⚠️  GOOD: All ebooks in database, but some PDFs missing.');
      console.log('💡 Regenerate missing PDF files.');
    } else if (pdfsExist === expectedPDFs.length) {
      console.log('⚠️  GOOD: All PDFs present, but some ebooks missing from database.');
      console.log('💡 Add missing ebook records to database.');
    } else {
      console.log('❌ ISSUES: Both ebooks and PDFs are missing.');
      console.log('💡 Complete the ebook system setup.');
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('==================');
    if (missingEbooks > 0) {
      console.log(`• Add ${missingEbooks} missing ebook records to database`);
    }
    if (pdfsExist < expectedPDFs.length) {
      console.log(`• Regenerate ${expectedPDFs.length - pdfsExist} missing PDF files`);
    }
    console.log('• Test PDF downloads in the academy interface');
    console.log('• Verify styling matches HTML versions');
    console.log('• Check that users can access ebooks properly');

  } catch (error) {
    console.error('❌ Error verifying ebook system:', error);
  }
}

// Run the verification
verifyEbookSystem();
