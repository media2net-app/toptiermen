#!/usr/bin/env node

/**
 * Script om 50% prelaunch korting te verwijderen en normale prijzen te implementeren
 * Uitvoering: node remove-prelaunch-discount.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Start verwijdering 50% prelaunch korting...');
console.log('⏰ Tijd:', new Date().toLocaleString('nl-NL'));

// Normale prijzen (zonder korting)
const NORMAL_PRICES = {
  basic: {
    monthlyPrice: 49,    // €49 per maand (6 maanden)
    yearlyPrice: 44,     // €44 per maand (12 maanden, 10% korting)
    originalMonthlyPrice: 49,
    originalYearlyPrice: 44
  },
  premium: {
    monthlyPrice: 79,    // €79 per maand (6 maanden)
    yearlyPrice: 71,     // €71 per maand (12 maanden, 10% korting)
    originalMonthlyPrice: 79,
    originalYearlyPrice: 71
  },
  lifetime: {
    monthlyPrice: 1995,  // €1995 eenmalig
    yearlyPrice: 1995,   // €1995 eenmalig
    originalMonthlyPrice: 1995,
    originalYearlyPrice: 1995
  }
};

// Files die aangepast moeten worden
const FILES_TO_UPDATE = [
  'src/app/pakketten/prelaunchkorting/page.tsx',
  'src/app/pakketten/maandelijks/page.tsx', 
  'src/app/pakketten/lifetime-tier/page.tsx',
  'src/app/api/payments/create-payment-prelaunch/route.ts',
  'src/app/api/payments/create-payment-test/route.ts',
  'src/components/CheckoutSection.tsx'
];

function updateFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File niet gevonden: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Update Basic Tier prijzen
    if (content.includes('monthlyPrice: 24.50')) {
      content = content.replace(/monthlyPrice: 24\.50/g, 'monthlyPrice: 49');
      content = content.replace(/yearlyPrice: 22\.00/g, 'yearlyPrice: 44');
      content = content.replace(/originalMonthlyPrice: 49/g, 'originalMonthlyPrice: 49');
      content = content.replace(/originalYearlyPrice: 44/g, 'originalYearlyPrice: 44');
      modified = true;
    }

    // Update Premium Tier prijzen  
    if (content.includes('monthlyPrice: 39.50')) {
      content = content.replace(/monthlyPrice: 39\.50/g, 'monthlyPrice: 79');
      content = content.replace(/yearlyPrice: 35\.50/g, 'yearlyPrice: 71');
      content = content.replace(/originalMonthlyPrice: 79/g, 'originalMonthlyPrice: 79');
      content = content.replace(/originalYearlyPrice: 71/g, 'originalYearlyPrice: 71');
      modified = true;
    }

    // Update Lifetime Tier prijzen
    if (content.includes('monthlyPrice: 997.50')) {
      content = content.replace(/monthlyPrice: 997\.50/g, 'monthlyPrice: 1995');
      content = content.replace(/yearlyPrice: 997\.50/g, 'yearlyPrice: 1995');
      content = content.replace(/originalMonthlyPrice: 1995/g, 'originalMonthlyPrice: 1995');
      content = content.replace(/originalYearlyPrice: 1995/g, 'originalYearlyPrice: 1995');
      modified = true;
    }

    // Verwijder 50% korting teksten
    if (content.includes('50% PRELAUNCH KORTING')) {
      content = content.replace(/🔥 50% PRELAUNCH KORTING/g, '🔥 NORMALE PRIJZEN');
      content = content.replace(/50% PRELAUNCH KORTING/g, 'NORMALE PRIJZEN');
      content = content.replace(/50% korting/g, 'normale prijzen');
      content = content.replace(/50% KORTING/g, 'NORMALE PRIJZEN');
      modified = true;
    }

    // Update discount percentage in API routes
    if (content.includes('discount_percentage: 50')) {
      content = content.replace(/discount_percentage: 50/g, 'discount_percentage: 0');
      modified = true;
    }

    // Update prelaunch pricing comments
    if (content.includes('prelaunch price')) {
      content = content.replace(/prelaunch price \(€\d+ \* 0\.5\)/g, 'normal price');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`➡️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update alle files
console.log('\n📝 Updating files...');
FILES_TO_UPDATE.forEach(updateFile);

console.log('\n🎯 Summary van wijzigingen:');
console.log('• Basic Tier: €24.50 → €49 (6mnd), €22 → €44 (12mnd)');
console.log('• Premium Tier: €39.50 → €79 (6mnd), €35.50 → €71 (12mnd)');
console.log('• Lifetime Tier: €997.50 → €1995');
console.log('• Alle "50% PRELAUNCH KORTING" teksten verwijderd');
console.log('• Discount percentage: 50% → 0%');

console.log('\n✅ Prelaunch korting succesvol verwijderd!');
console.log('🚀 Normale prijzen zijn nu actief');
console.log('⏰ Voltooid om:', new Date().toLocaleString('nl-NL'));
