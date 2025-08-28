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

async function analyzeEbookFormats() {
  try {
    console.log('📚 EBOOK FORMAT ANALYSIS');
    console.log('========================\n');

    // Get all modules
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id,
        title,
        slug,
        order_index,
        status
      `)
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    let totalEbooks = 0;
    let htmlEbooks = 0;
    let pdfEbooks = 0;
    let missingFiles = 0;

    const conversionPlan = [];

    for (const module of modules || []) {
      console.log(`📖 MODULE: ${module.title} (${module.slug})`);
      console.log('='.repeat(50));

      // Get lessons and ebooks for this module
      const { data: lessons, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select(`
          id,
          title,
          order_index,
          status,
          academy_ebooks (
            id,
            title,
            file_url,
            status
          )
        `)
        .eq('module_id', module.id)
        .eq('status', 'published')
        .order('order_index');

      if (lessonsError) {
        console.error(`❌ Error fetching lessons for ${module.title}:`, lessonsError);
        continue;
      }

      const moduleData = {
        module: module,
        lessons: [],
        htmlToConvert: [],
        pdfsToGenerate: [],
        missingFiles: []
      };

      for (const lesson of lessons || []) {
        const hasEbook = lesson.academy_ebooks && lesson.academy_ebooks.length > 0;
        
        if (hasEbook) {
          const ebook = lesson.academy_ebooks[0];
          const fileUrl = ebook.file_url;
          const isPDF = fileUrl && fileUrl.toLowerCase().endsWith('.pdf');
          const isHTML = fileUrl && fileUrl.toLowerCase().endsWith('.html');
          
          totalEbooks++;
          
          if (isPDF) {
            pdfEbooks++;
            console.log(`   ✅ Lesson ${lesson.order_index}: ${lesson.title}`);
            console.log(`      📄 PDF: ${fileUrl}`);
          } else if (isHTML) {
            htmlEbooks++;
            console.log(`   🔄 Lesson ${lesson.order_index}: ${lesson.title}`);
            console.log(`      📄 HTML: ${fileUrl} → NEEDS PDF CONVERSION`);
            
            moduleData.htmlToConvert.push({
              lesson: lesson,
              ebook: ebook,
              htmlFile: fileUrl
            });
          } else {
            console.log(`   ❓ Lesson ${lesson.order_index}: ${lesson.title}`);
            console.log(`      📄 Unknown format: ${fileUrl}`);
          }

          // Check if file exists on disk
          const booksDir = path.join(__dirname, '../public/books');
          const fileName = fileUrl ? fileUrl.split('/').pop() : null;
          const filePath = fileName ? path.join(booksDir, fileName) : null;
          
          if (fileName && filePath && !fs.existsSync(filePath)) {
            missingFiles++;
            moduleData.missingFiles.push({
              lesson: lesson,
              ebook: ebook,
              expectedFile: fileName
            });
            console.log(`      ⚠️  File missing on disk: ${fileName}`);
          }

          moduleData.lessons.push({
            lesson: lesson,
            ebook: ebook,
            format: isPDF ? 'PDF' : isHTML ? 'HTML' : 'UNKNOWN',
            fileExists: fileName && filePath && fs.existsSync(filePath)
          });
        }
      }

      if (moduleData.htmlToConvert.length > 0 || moduleData.missingFiles.length > 0) {
        conversionPlan.push(moduleData);
      }

      console.log('');
    }

    // Summary
    console.log('📊 EBOOK FORMAT SUMMARY');
    console.log('========================');
    console.log(`📚 Total Ebooks: ${totalEbooks}`);
    console.log(`✅ PDF Ebooks: ${pdfEbooks}`);
    console.log(`🔄 HTML Ebooks: ${htmlEbooks}`);
    console.log(`❌ Missing Files: ${missingFiles}`);
    console.log(`📈 PDF Completion Rate: ${((pdfEbooks / totalEbooks) * 100).toFixed(1)}%`);

    // Conversion plan
    console.log('\n📋 CONVERSION PLAN');
    console.log('==================');
    
    if (conversionPlan.length === 0) {
      console.log('🎉 All ebooks are already in PDF format!');
    } else {
      conversionPlan.forEach((moduleData, index) => {
        console.log(`\n${index + 1}. ${moduleData.module.title}`);
        
        if (moduleData.htmlToConvert.length > 0) {
          console.log(`   📄 HTML to PDF Conversion (${moduleData.htmlToConvert.length} ebooks):`);
          moduleData.htmlToConvert.forEach(item => {
            console.log(`      - ${item.lesson.title}`);
            console.log(`        HTML: ${item.htmlFile}`);
            console.log(`        PDF: ${item.htmlFile.replace('.html', '.pdf')}`);
          });
        }
        
        if (moduleData.missingFiles.length > 0) {
          console.log(`   ⚠️  Missing Files (${moduleData.missingFiles.length} files):`);
          moduleData.missingFiles.forEach(item => {
            console.log(`      - ${item.lesson.title}: ${item.expectedFile}`);
          });
        }
      });
    }

    // Generate conversion script
    console.log('\n🔧 GENERATING CONVERSION SCRIPTS');
    console.log('================================');
    
    const conversionScripts = [];
    
    conversionPlan.forEach(moduleData => {
      if (moduleData.htmlToConvert.length > 0) {
        const scriptName = `convert-${moduleData.module.slug}-to-pdf.js`;
        conversionScripts.push({
          module: moduleData.module.title,
          script: scriptName,
          ebooks: moduleData.htmlToConvert.length
        });
        
        console.log(`📝 ${scriptName} - ${moduleData.htmlToConvert.length} ebooks`);
      }
    });

    // Save detailed analysis
    const analysisData = {
      generated_at: new Date().toISOString(),
      summary: {
        total_ebooks: totalEbooks,
        pdf_ebooks: pdfEbooks,
        html_ebooks: htmlEbooks,
        missing_files: missingFiles,
        pdf_completion_rate: ((pdfEbooks / totalEbooks) * 100).toFixed(1)
      },
      conversion_plan: conversionPlan.map(m => ({
        module: m.module,
        html_to_convert: m.htmlToConvert.map(item => ({
          lesson_title: item.lesson.title,
          html_file: item.htmlFile,
          pdf_file: item.htmlFile.replace('.html', '.pdf')
        })),
        missing_files: m.missingFiles.map(item => ({
          lesson_title: item.lesson.title,
          expected_file: item.expectedFile
        }))
      })),
      conversion_scripts: conversionScripts
    };

    fs.writeFileSync('ebook-format-analysis.json', JSON.stringify(analysisData, null, 2));
    console.log('\n💾 Analysis saved to: ebook-format-analysis.json');

    console.log('\n🎯 RECOMMENDED WORKFLOW:');
    console.log('========================');
    console.log('1. Start with modules that have the most HTML ebooks');
    console.log('2. Convert HTML to PDF using Puppeteer');
    console.log('3. Update database records to point to PDF files');
    console.log('4. Test PDF downloads and styling');
    console.log('5. Remove old HTML files after verification');

    console.log('\n📋 PRIORITY ORDER:');
    console.log('==================');
    conversionPlan
      .sort((a, b) => b.htmlToConvert.length - a.htmlToConvert.length)
      .forEach((moduleData, index) => {
        console.log(`${index + 1}. ${moduleData.module.title} (${moduleData.htmlToConvert.length} HTML ebooks)`);
      });

  } catch (error) {
    console.error('❌ Error analyzing ebook formats:', error);
  }
}

// Run the analysis
analyzeEbookFormats();
