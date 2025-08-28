const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function fixFysiekeDominantieMissingEbook() {
  try {
    console.log('🔧 FIXING MISSING FYSIEKE DOMINANTIE EBOOK');
    console.log('==========================================\n');

    // The missing ebook that needs conversion
    const missingEbook = {
      htmlFile: 'fysieke-dominantie--status--zelfrespect-en-aantrekkingskracht-ebook.html',
      pdfFile: 'fysieke-dominantie--status--zelfrespect-en-aantrekkingskracht-ebook.pdf',
      title: 'Status, Zelfrespect en Aantrekkingskracht',
      subtitle: 'Module 3 - Les 3: Top Tier Men Academy'
    };

    console.log(`📄 Converting: ${missingEbook.title}`);
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const booksDir = path.join(__dirname, '../public/books');
    const htmlPath = path.join(booksDir, missingEbook.htmlFile);
    const pdfPath = path.join(booksDir, missingEbook.pdfFile);
    
    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
      console.log(`   ❌ HTML file not found: ${missingEbook.htmlFile}`);
      return;
    }
    
    const page = await browser.newPage();
    
    // Read the HTML file
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Set content and wait for fonts to load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate PDF with proper styling
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true
    });
    
    // Get file size
    const stats = fs.statSync(pdfPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`   ✅ Generated: ${missingEbook.pdfFile} (${fileSizeInMB} MB)`);
    
    await page.close();
    await browser.close();
    
    console.log('\n🎉 Missing Fysieke Dominantie ebook converted successfully!');
    console.log('✨ Now updating database record...');
    
    // Update database record
    require('dotenv').config({ path: '.env.local' });
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find the Fysieke Dominantie module
    const { data: fysiekeModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'fysieke-dominantie')
      .single();
    
    if (moduleError) {
      console.error('❌ Error finding fysieke-dominantie module:', moduleError);
      return;
    }
    
    // Find the specific lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('academy_lessons')
      .select('id, title')
      .eq('module_id', fysiekeModule.id)
      .eq('title', ' Status, Zelfrespect en Aantrekkingskracht')
      .single();
    
    if (lessonError) {
      console.error('❌ Error finding lesson:', lessonError);
      return;
    }
    
    // Update the ebook record
    const { error: updateError } = await supabase
      .from('academy_ebooks')
      .update({
        file_url: `/books/${missingEbook.pdfFile}`,
        updated_at: new Date().toISOString()
      })
      .eq('lesson_id', lesson.id)
      .eq('status', 'published');
    
    if (updateError) {
      console.error('❌ Error updating ebook:', updateError);
    } else {
      console.log('✅ Database record updated successfully!');
      console.log(`   New URL: /books/${missingEbook.pdfFile}`);
    }
    
    console.log('\n✨ Fysieke Dominantie module is now 100% complete!');
    
  } catch (error) {
    console.error('❌ Error in conversion process:', error);
  }
}

// Run the fix
fixFysiekeDominantieMissingEbook();
