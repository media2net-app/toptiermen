const fs = require('fs');
const path = require('path');

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
    let priority = 4;
    
    if (hasInterFont && hasEbookContainer) {
      styleType = 'modern';
      description = 'Moderne Inter styling (zoals Module 1 Les 1)';
      priority = 1;
    } else if (hasEnhancedStyling && hasModuleBadge) {
      styleType = 'enhanced';
      description = 'Enhanced styling met module badge';
      priority = 2;
    } else if (hasModuleBadge) {
      styleType = 'badge';
      description = 'Basis styling met module badge';
      priority = 3;
    }
    
    // Analyseer inhoud structuur
    const hasTableOfContents = content.includes('Inhoudsopgave') || content.includes('toc');
    const hasReflectionSection = content.includes('Reflectie') || content.includes('reflection');
    const hasActionItems = content.includes('action-item') || content.includes('Direct Toepasbaar');
    
    // Extract title
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(' - Top Tier Men Academy', '').replace(' - Testosteron | Top Tier Men Academy', '').replace(' - Fysieke Dominantie | Top Tier Men Academy', '').replace(' - Brotherhood | Top Tier Men Academy', '').replace(' - Voeding & Gezondheid | Top Tier Men Academy', '').replace(' - Business & Finance | Top Tier Men Academy', '') : path.basename(filePath, '.html');
    
    // Clean up title
    title = title.replace(/\s-\s.*$/, ''); // Remove everything after " - "
    
    // Extract module info from filename or title
    let module = 'Onbekend';
    
    if (filePath.includes('discipline') || title.toLowerCase().includes('discipline')) {
      module = 'Discipline & Identiteit';
    } else if (filePath.includes('brotherhood') || title.toLowerCase().includes('brotherhood')) {
      module = 'Brotherhood';
    } else if (filePath.includes('fysieke-dominantie') || filePath.includes('embrace-the-suck') || filePath.includes('status-zelfrespect') || filePath.includes('het-belang-van-kracht') || filePath.includes('vitaliteit')) {
      module = 'Fysieke Dominantie';
    } else if (filePath.includes('business-and-finance') || filePath.includes('financi') || filePath.includes('geld') || filePath.includes('vermogen') || filePath.includes('werknemer')) {
      module = 'Business & Finance';
    } else if (filePath.includes('mentale-kracht') || title.toLowerCase().includes('mentale')) {
      module = 'Mentale Kracht & Weerbaarheid';
    } else if (filePath.includes('testosteron') || filePath.includes('test-')) {
      module = 'Testosteron';
    } else if (filePath.includes('voeding') || filePath.includes('gezondheid') || filePath.includes('slaap') || filePath.includes('hydratatie') || filePath.includes('energie')) {
      module = 'Voeding & Gezondheid';
    }
    
    return {
      filename: path.basename(filePath),
      path: `/books/${path.basename(filePath)}`,
      title,
      module,
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
      needsUpdate: styleType !== 'modern',
      priority,
      fileSize: fs.statSync(filePath).size,
      lastModified: fs.statSync(filePath).mtime
    };
  } catch (error) {
    console.error(`❌ Fout bij analyseren van ${filePath}:`, error.message);
    return null;
  }
}

// Functie om alle ebooks te scannen
function scanAllEbooks() {
  console.log('🔍 Scanning alle Academy ebooks...');
  
  try {
    const files = fs.readdirSync(BOOKS_DIR).filter(file => file.endsWith('.html'));
    console.log(`📚 Gevonden: ${files.length} HTML bestanden`);
    
    const ebooks = [];
    
    for (const file of files) {
      const filePath = path.join(BOOKS_DIR, file);
      const analysis = analyzeEbookStyling(filePath);
      
      if (analysis) {
        ebooks.push(analysis);
        console.log(`✅ ${file} -> ${analysis.styleType} (${analysis.module})`);
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
    
    // Groepeer per module
    const moduleGroups = ebooks.reduce((groups, ebook) => {
      const module = ebook.module;
      if (!groups[module]) groups[module] = [];
      groups[module].push(ebook);
      return groups;
    }, {});
    
    console.log('\n📁 Module Overzicht:');
    Object.entries(moduleGroups).forEach(([module, books]) => {
      console.log(`  ${module}: ${books.length} bestanden`);
    });
    
    // Genereer SQL INSERT statements
    console.log('\n📝 Genereren SQL INSERT statements...');
    
    const sqlStatements = ebooks.map(ebook => {
      return `('${ebook.filename.replace(/'/g, "''")}', '${ebook.path}', '${ebook.title.replace(/'/g, "''")}', '${ebook.module}', '${ebook.styleType}', '${ebook.description.replace(/'/g, "''")}', ${ebook.hasInterFont}, ${ebook.hasSegoeUI}, ${ebook.hasEbookContainer}, ${ebook.hasModuleBadge}, ${ebook.hasEnhancedStyling}, ${ebook.hasTableOfContents}, ${ebook.hasReflectionSection}, ${ebook.hasActionItems}, ${ebook.needsUpdate}, ${ebook.priority})`;
    });
    
    const fullSQL = `
-- 🚀 AUTOMATISCH GEGENEREERDE EBOOK DATA
-- Totaal: ${ebooks.length} ebooks gescand

DELETE FROM academy_ebook_files;

INSERT INTO academy_ebook_files (
  filename, path, title, module, style_type, style_description,
  has_inter_font, has_segoe_ui, has_ebook_container, has_module_badge,
  has_enhanced_styling, has_table_of_contents, has_reflection_section, 
  has_action_items, needs_update, priority
) VALUES 
${sqlStatements.join(',\n')};

-- 📊 OVERZICHT:
${Object.entries(styleGroups).map(([type, books]) => `-- ${type}: ${books.length} bestanden`).join('\n')}

-- 📁 MODULES:
${Object.entries(moduleGroups).map(([module, books]) => `-- ${module}: ${books.length} bestanden`).join('\n')}
`;
    
    // Schrijf SQL naar bestand
    const sqlFile = path.join(__dirname, '..', 'COMPLETE_EBOOK_INSERT.sql');
    fs.writeFileSync(sqlFile, fullSQL);
    
    console.log(`\n✅ SQL geschreven naar: ${sqlFile}`);
    console.log(`📚 Totaal: ${ebooks.length} ebooks gescand en klaar voor import!`);
    
    return ebooks;
  } catch (error) {
    console.error('❌ Fout bij scannen:', error);
    return [];
  }
}

// Run het script
if (require.main === module) {
  scanAllEbooks();
}

module.exports = { scanAllEbooks, analyzeEbookStyling };
