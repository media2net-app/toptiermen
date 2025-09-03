const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuratie
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials niet gevonden');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BOOKS_DIR = path.join(__dirname, '..', 'public', 'books');

// Functie om ebook styling te analyseren
function analyzeEbookStyling(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check voor verschillende styling kenmerken
    const hasInterFont = content.includes("'Inter'") && content.includes('fonts.googleapis.com');
    const hasSegoeUI = content.includes("'Segoe UI'");
    const hasEbookContainer = content.includes('.ebook-container');
    const hasModuleBadge = content.includes('module-badge');
    const hasEnhancedStyling = content.includes('rgba(255, 255, 255, 0.98)') && content.includes('border-radius: 20px');
    
    // Bepaal styling type
    let styleType = 'basic';
    let description = 'Basis styling';
    
    if (hasInterFont && hasEbookContainer) {
      styleType = 'modern';
      description = 'Moderne Inter styling (zoals Module 1 Les 1)';
    } else if (hasEnhancedStyling && hasModuleBadge) {
      styleType = 'enhanced';
      description = 'Enhanced styling met module badge';
    } else if (hasModuleBadge) {
      styleType = 'badge';
      description = 'Basis styling met module badge';
    }
    
    // Analyseer inhoud structuur
    const hasTableOfContents = content.includes('Inhoudsopgave') || content.includes('toc');
    const hasReflectionSection = content.includes('Reflectie') || content.includes('reflection');
    const hasActionItems = content.includes('action-item') || content.includes('Direct Toepasbaar');
    
    // Extract title
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - Top Tier Men Academy', '') : path.basename(filePath, '.html');
    
    // Extract module info from title or content
    const moduleMatch = title.match(/(Brotherhood|Discipline|Fysieke Dominantie|Business|Mentale|Testosteron|Voeding)/i);
    const module = moduleMatch ? moduleMatch[1] : 'Onbekend';
    
    return {
      styleType,
      description,
      hasInterFont,
      hasSegoeUI,
      hasEbookContainer,
      hasModuleBadge,
      hasEnhancedStyling,
      hasTableOfContents,
      hasReflectionSection,
      hasActionItems,
      title,
      module,
      fileSize: fs.statSync(filePath).size,
      lastModified: fs.statSync(filePath).mtime
    };
  } catch (error) {
    console.error(`❌ Fout bij analyseren van ${filePath}:`, error.message);
    return null;
  }
}

// Functie om alle ebooks te scannen
async function scanAllEbooks() {
  console.log('🔍 Scanning alle Academy ebooks...');
  
  try {
    const files = fs.readdirSync(BOOKS_DIR).filter(file => file.endsWith('.html'));
    console.log(`📚 Gevonden: ${files.length} HTML bestanden`);
    
    const ebooks = [];
    
    for (const file of files) {
      const filePath = path.join(BOOKS_DIR, file);
      const analysis = analyzeEbookStyling(filePath);
      
      if (analysis) {
        ebooks.push({
          filename: file,
          path: `/books/${file}`,
          ...analysis
        });
      }
    }
    
    // Groepeer per styling type
    const styleGroups = ebooks.reduce((groups, ebook) => {
      const type = ebook.styleType;
      if (!groups[type]) groups[type] = [];
      groups[type].push(ebook);
      return groups;
    }, {});
    
    console.log('\n📊 Styling Overzicht:');
    Object.entries(styleGroups).forEach(([type, books]) => {
      console.log(`  ${type}: ${books.length} bestanden`);
    });
    
    return ebooks;
  } catch (error) {
    console.error('❌ Fout bij scannen:', error);
    return [];
  }
}

// Functie om database tabel te maken
async function createEbooksTable() {
  console.log('🗃️ Creëren van ebooks tabel...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS academy_ebooks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        path TEXT NOT NULL,
        title TEXT NOT NULL,
        module TEXT,
        style_type TEXT NOT NULL,
        style_description TEXT,
        has_inter_font BOOLEAN DEFAULT FALSE,
        has_segoe_ui BOOLEAN DEFAULT FALSE,
        has_ebook_container BOOLEAN DEFAULT FALSE,
        has_module_badge BOOLEAN DEFAULT FALSE,
        has_enhanced_styling BOOLEAN DEFAULT FALSE,
        has_table_of_contents BOOLEAN DEFAULT FALSE,
        has_reflection_section BOOLEAN DEFAULT FALSE,
        has_action_items BOOLEAN DEFAULT FALSE,
        file_size INTEGER,
        last_modified TIMESTAMP,
        status TEXT DEFAULT 'active',
        needs_update BOOLEAN DEFAULT FALSE,
        priority INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Index voor betere performance
      CREATE INDEX IF NOT EXISTS idx_academy_ebooks_style_type ON academy_ebooks(style_type);
      CREATE INDEX IF NOT EXISTS idx_academy_ebooks_module ON academy_ebooks(module);
      CREATE INDEX IF NOT EXISTS idx_academy_ebooks_status ON academy_ebooks(status);
    `
  });
  
  if (error) {
    console.error('❌ Fout bij maken tabel:', error);
    return false;
  }
  
  console.log('✅ Tabel succesvol gemaakt');
  return true;
}

// Functie om ebooks data in database op te slaan
async function saveEbooksToDatabase(ebooks) {
  console.log('💾 Opslaan van ebook data in database...');
  
  try {
    // Eerst alle bestaande data verwijderen
    await supabase.from('academy_ebooks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert nieuwe data in batches
    const batchSize = 50;
    for (let i = 0; i < ebooks.length; i += batchSize) {
      const batch = ebooks.slice(i, i + batchSize);
      
      const { error } = await supabase.from('academy_ebooks').insert(
        batch.map(ebook => ({
          filename: ebook.filename,
          path: ebook.path,
          title: ebook.title,
          module: ebook.module,
          style_type: ebook.styleType,
          style_description: ebook.description,
          has_inter_font: ebook.hasInterFont,
          has_segoe_ui: ebook.hasSegoeUI,
          has_ebook_container: ebook.hasEbookContainer,
          has_module_badge: ebook.hasModuleBadge,
          has_enhanced_styling: ebook.hasEnhancedStyling,
          has_table_of_contents: ebook.hasTableOfContents,
          has_reflection_section: ebook.hasReflectionSection,
          has_action_items: ebook.hasActionItems,
          file_size: ebook.fileSize,
          last_modified: ebook.lastModified.toISOString(),
          needs_update: ebook.styleType !== 'modern', // Modern style is het doel
          priority: ebook.styleType === 'basic' ? 3 : ebook.styleType === 'badge' ? 2 : 1
        }))
      );
      
      if (error) {
        console.error(`❌ Fout bij opslaan batch ${i}:`, error);
      } else {
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} opgeslagen`);
      }
    }
    
    console.log('✅ Alle ebook data opgeslagen');
    return true;
  } catch (error) {
    console.error('❌ Fout bij opslaan:', error);
    return false;
  }
}

// Main functie
async function main() {
  console.log('🚀 Start Academy Ebooks Scan\n');
  
  // 1. Maak database tabel
  const tableCreated = await createEbooksTable();
  if (!tableCreated) {
    console.error('❌ Kan geen tabel maken, stoppen...');
    return;
  }
  
  // 2. Scan alle ebooks
  const ebooks = await scanAllEbooks();
  if (ebooks.length === 0) {
    console.error('❌ Geen ebooks gevonden, stoppen...');
    return;
  }
  
  // 3. Sla op in database
  const saved = await saveEbooksToDatabase(ebooks);
  if (!saved) {
    console.error('❌ Kan data niet opslaan, stoppen...');
    return;
  }
  
  console.log('\n🎉 Academy Ebooks Scan Voltooid!');
  console.log(`📚 ${ebooks.length} ebooks gescand en opgeslagen`);
  
  // Toon samenvatting
  const styleGroups = ebooks.reduce((groups, ebook) => {
    const type = ebook.styleType;
    if (!groups[type]) groups[type] = [];
    groups[type].push(ebook);
    return groups;
  }, {});
  
  console.log('\n📊 Final Samenvatting:');
  Object.entries(styleGroups).forEach(([type, books]) => {
    console.log(`  ✅ ${type}: ${books.length} bestanden`);
  });
}

// Run het script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scanAllEbooks, analyzeEbookStyling };
