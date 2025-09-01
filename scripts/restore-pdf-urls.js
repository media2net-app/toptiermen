require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PDF URL mappings based on the original check
const pdfUrlMappings = {
  // Module 1: Testosteron
  'wat-is-testosteron-ebook.html': '/books/testosteron-basis-ebook.pdf',
  'de-kracht-van-hoog-testosteron-ebook.html': '/books/testosteron-kracht-ebook.pdf',
  'testosteron-killers-wat-moet-je-elimineren-ebook.html': '/books/testosteron-killers-ebook.pdf',
  'trt-en-mijn-visie-ebook.html': '/books/testosteron-trt-ebook.pdf',
  'de-waarheid-over-testosteron-doping-ebook.html': '/books/testosteron-doping-ebook.pdf',
  
  // Module 2: Discipline & Identiteit
  'wat-is-discipline-en-waarom-is-dit-essentieel-ebook.html': '/books/discipline-basis-ebook.pdf',
  'je-identiteit-definiren-ebook.html': '/books/identiteit-definieren-ebook.pdf',
  'discipline-van-korte-termijn-naar-een-levensstijl-ebook.html': '/books/discipline-levensstijl-ebook.pdf',
  'wat-is-identiteit-en-waarom-zijn-kernwaarden-essentieel-ebook.html': '/books/identiteit-kernwaarden-ebook.pdf',
  'ontdek-je-kernwaarden-en-bouw-je-top-tier-identiteit-ebook.html': '/books/kernwaarden-top-tier-ebook.pdf',
  
  // Module 3: Fysieke Dominantie
  'waarom-is-fysieke-dominantie-zo-belangrijk-ebook.html': '/books/fysieke-dominantie-waarom-is-fysieke-dominantie-zo-belangrijk--ebook.pdf',
  'het-belang-van-kracht-spiermassa-en-conditie-ebook.html': '/books/fysieke-dominantie-het-belang-van-kracht--spiermassa-en-conditie-ebook.pdf',
  '-status-zelfrespect-en-aantrekkingskracht-ebook.html': '/books/fysieke-dominantie--status--zelfrespect-en-aantrekkingskracht-ebook.pdf',
  'vitaliteit-en-levensduur-ebook.html': '/books/fysieke-dominantie-vitaliteit-en-levensduur-ebook.pdf',
  'embrace-the-suck-ebook.html': '/books/fysieke-dominantie-embrace-the-suck-ebook.pdf',
  
  // Module 4: Mentale Kracht/Weerbaarheid
  'wat-is-mentale-kracht-ebook.html': '/books/mentale-kracht-weerbaarheid-wat-is-mentale-kracht-ebook.pdf',
  'een-onbreekbare-mindset-ebook.html': '/books/mentale-kracht-weerbaarheid-een-onbreekbare-mindset-ebook.pdf',
  'mentale-weerbaarheid-in-de-praktijk-ebook.html': '/books/mentale-kracht-weerbaarheid-mentale-weerbaarheid-in-de-praktijk-ebook.pdf',
  'wordt-een-onbreekbare-man-ebook.html': '/books/mentale-kracht-weerbaarheid-wordt-een-onbreekbare-man-ebook.pdf',
  'reflectie-integratie-ebook.html': '/books/mentale-kracht-weerbaarheid-reflectie---integratie-ebook.pdf',
  
  // Module 5: Business and Finance
  'de-financile-mindset--ebook.html': '/books/business-and-finance--de-financi-le-mindset--ebook.pdf',
  'grip-op-je-geld-ebook.html': '/books/business-and-finance--grip-op-je-geld-ebook.pdf',
  'van-werknemer-naar-eigen-verdienmodellen-ebook.html': '/books/business-and-finance--van-werknemer-naar-eigen-verdienmodellen-ebook.pdf',
  'vermogen-opbouwen-begin-met-investeren-ebook.html': '/books/business-and-finance--vermogen-opbouwen-begin-met-investeren-ebook.pdf',
  'financile-vrijheid-en-legacy--ebook.html': '/books/business-and-finance--financi-le-vrijheid-en-legacy--ebook.pdf',
  
  // Module 6: Brotherhood
  'waarom-een-brotherhood-ebook.html': '/books/brotherhood-waarom-een-brotherhood-ebook.pdf',
  'eer-en-loyaliteit-ebook.html': '/books/brotherhood-eer-en-loyaliteit-ebook.pdf',
  'bouw-de-juiste-kring--ebook.html': '/books/brotherhood-bouw-de-juiste-kring--ebook.pdf',
  'cut-the-weak-ebook.html': '/books/brotherhood-cut-the-weak-ebook.pdf',
  'hoe-je-je-broeders-versterkt-en-samen-groeit-ebook.html': '/books/brotherhood-hoe-je-je-broeders-versterkt-en-samen-groeit-ebook.pdf',
  
  // Module 7: Voeding & Gezondheid
  'de-basisprincipes-van-voeding-ebook.html': '/books/voeding-gezondheid-de-basisprincipes-van-voeding-ebook.pdf',
  'hydratatie-en-water-inname-ebook.html': '/books/voeding-gezondheid-hydratatie-en-water-inname-ebook.pdf',
  'slaap-de-vergeten-superkracht-ebook.html': '/books/voeding-gezondheid-slaap-de-vergeten-superkracht-ebook.pdf',
  'energie-en-focus-ebook.html': '/books/voeding-gezondheid-energie-en-focus-ebook.pdf',
  'gezondheid-als-fundament-ebook.html': '/books/voeding-gezondheid-gezondheid-als-fundament-ebook.pdf',
  'praktische-opdracht-stel-je-eigen-voedingsplan-op-ebook.html': '/books/voeding-gezondheid-praktische-opdracht--stel-je-eigen-voedingsplan-op-ebook.pdf'
};

async function restorePdfUrls() {
  try {
    console.log('📚 RESTORING PDF URLS FOR EBOOKS');
    console.log('================================\n');

    // Get all ebooks
    const { data: ebooks, error } = await supabase
      .from('academy_ebooks')
      .select('*')
      .eq('status', 'published');

    if (error) {
      console.error('❌ Error fetching ebooks:', error);
      return;
    }

    if (!ebooks || ebooks.length === 0) {
      console.log('⚠️ No ebooks found');
      return;
    }

    console.log(`📖 Found ${ebooks.length} ebooks to process\n`);

    let updatedCount = 0;
    let errorCount = 0;

    // Process each ebook
    for (const ebook of ebooks) {
      const currentUrl = ebook.file_url;
      
      // Check if this is a web version (HTML)
      if (currentUrl && currentUrl.includes('.html')) {
        const filename = currentUrl.split('/').pop(); // Get filename from URL
        const pdfUrl = pdfUrlMappings[filename];
        
        if (pdfUrl) {
          console.log(`📖 ${ebook.title}`);
          console.log(`   Current: ${currentUrl}`);
          console.log(`   PDF URL: ${pdfUrl}`);
          
          // Update the ebook to include both web and PDF URLs
          // We'll store the PDF URL in a custom field or update the record
          const { error: updateError } = await supabase
            .from('academy_ebooks')
            .update({
              file_url: currentUrl, // Keep the web version as primary
              pdf_url: pdfUrl, // Add PDF URL as secondary
              updated_at: new Date().toISOString()
            })
            .eq('id', ebook.id);
          
          if (updateError) {
            console.error(`   ❌ Error updating:`, updateError);
            errorCount++;
          } else {
            console.log(`   ✅ Updated successfully`);
            updatedCount++;
          }
        } else {
          console.log(`📖 ${ebook.title}`);
          console.log(`   ⚠️ No PDF mapping found for: ${filename}`);
        }
      }
      
      console.log('');
    }

    // Summary
    console.log('📊 RESTORATION SUMMARY');
    console.log('======================');
    console.log(`Total ebooks processed: ${ebooks.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log(`Success rate: ${ebooks.length > 0 ? Math.round(((ebooks.length - errorCount) / ebooks.length) * 100) : 0}%`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the restoration
restorePdfUrls().then(() => {
  console.log('\n✅ PDF URL restoration completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
