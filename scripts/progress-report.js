require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateProgressReport() {
  try {
    console.log('📊 EBOOK CONVERSION PROGRESS REPORT');
    console.log('====================================\n');

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
    let pdfEbooks = 0;
    let htmlEbooks = 0;

    const moduleProgress = [];

    for (const module of modules || []) {
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

      let modulePdfCount = 0;
      let moduleHtmlCount = 0;

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
            modulePdfCount++;
          } else if (isHTML) {
            htmlEbooks++;
            moduleHtmlCount++;
          }
        }
      }

      const completionRate = ((modulePdfCount / (modulePdfCount + moduleHtmlCount)) * 100).toFixed(1);
      const status = moduleHtmlCount === 0 ? '✅ COMPLETE' : '🔄 IN PROGRESS';

      moduleProgress.push({
        module: module,
        pdfCount: modulePdfCount,
        htmlCount: moduleHtmlCount,
        totalCount: modulePdfCount + moduleHtmlCount,
        completionRate: completionRate,
        status: status
      });
    }

    // Overall progress
    const overallCompletionRate = ((pdfEbooks / totalEbooks) * 100).toFixed(1);

    console.log('📊 OVERALL PROGRESS');
    console.log('===================');
    console.log(`📚 Total Ebooks: ${totalEbooks}`);
    console.log(`✅ PDF Ebooks: ${pdfEbooks}`);
    console.log(`🔄 HTML Ebooks: ${htmlEbooks}`);
    console.log(`📈 Overall Completion: ${overallCompletionRate}%`);

    console.log('\n📋 MODULE BREAKDOWN:');
    console.log('===================');
    
    moduleProgress.forEach((moduleData, index) => {
      console.log(`${index + 1}. ${moduleData.module.title}`);
      console.log(`   📖 Total: ${moduleData.totalCount} ebooks`);
      console.log(`   ✅ PDF: ${moduleData.pdfCount}`);
      console.log(`   🔄 HTML: ${moduleData.htmlCount}`);
      console.log(`   📈 Completion: ${moduleData.completionRate}% - ${moduleData.status}`);
      console.log('');
    });

    // Next steps
    const incompleteModules = moduleProgress.filter(m => m.htmlCount > 0);
    
    if (incompleteModules.length === 0) {
      console.log('🎉 ALL MODULES COMPLETE!');
      console.log('=======================');
      console.log('✅ All ebooks have been converted to PDF format');
      console.log('✨ The academy is fully ready with professional PDFs');
    } else {
      console.log('📋 REMAINING WORK:');
      console.log('==================');
      console.log(`🔄 ${incompleteModules.length} modules still need conversion`);
      
      incompleteModules.forEach((moduleData, index) => {
        console.log(`${index + 1}. ${moduleData.module.title} (${moduleData.htmlCount} HTML ebooks)`);
      });

      console.log('\n🎯 NEXT PRIORITY:');
      console.log('=================');
      const nextModule = incompleteModules.sort((a, b) => b.htmlCount - a.htmlCount)[0];
      console.log(`📚 Module: ${nextModule.module.title}`);
      console.log(`📄 Ebooks to convert: ${nextModule.htmlCount}`);
      console.log(`📈 Current completion: ${nextModule.completionRate}%`);
    }

    // Save progress report
    const fs = require('fs');
    const progressData = {
      generated_at: new Date().toISOString(),
      overall: {
        total_ebooks: totalEbooks,
        pdf_ebooks: pdfEbooks,
        html_ebooks: htmlEbooks,
        completion_rate: overallCompletionRate
      },
      modules: moduleProgress.map(m => ({
        module: m.module,
        pdf_count: m.pdfCount,
        html_count: m.htmlCount,
        total_count: m.totalCount,
        completion_rate: m.completionRate,
        status: m.status
      }))
    };

    fs.writeFileSync('ebook-conversion-progress.json', JSON.stringify(progressData, null, 2));
    console.log('\n💾 Progress report saved to: ebook-conversion-progress.json');

  } catch (error) {
    console.error('❌ Error generating progress report:', error);
  }
}

// Run the progress report
generateProgressReport();
