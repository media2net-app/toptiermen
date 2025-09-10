#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🕛 Midnight Discount Removal Script');
console.log('⏰ Will remove 50% discount and restore original prices at 00:00');

// Function to remove discount and restore original prices
function removeDiscountAndRestoreOriginalPrices() {
  console.log('🔄 Removing 50% discount and restoring original prices...');
  
  try {
    // 1. Update prelaunchkorting page
    const prelaunchPath = 'src/app/pakketten/prelaunchkorting/page.tsx';
    let prelaunchContent = fs.readFileSync(prelaunchPath, 'utf8');
    
    // Restore original prices
    prelaunchContent = prelaunchContent.replace(
      /monthlyPrice: 24\.50, \/\/ Prijs na 50% korting \(€49 \* 0\.5\)/g,
      'monthlyPrice: 49, // Original price'
    );
    prelaunchContent = prelaunchContent.replace(
      /yearlyPrice: 22, \/\/ Prijs na 50% korting \(€44 \* 0\.5\)/g,
      'yearlyPrice: 44, // Original price'
    );
    prelaunchContent = prelaunchContent.replace(
      /monthlyPrice: 39\.50, \/\/ Prijs na 50% korting \(€79 \* 0\.5\)/g,
      'monthlyPrice: 79, // Original price'
    );
    prelaunchContent = prelaunchContent.replace(
      /yearlyPrice: 35\.50, \/\/ Prijs na 50% korting \(€71 \* 0\.5\)/g,
      'yearlyPrice: 71, // Original price'
    );
    prelaunchContent = prelaunchContent.replace(
      /monthlyPrice: 997\.50, \/\/ Prijs na 50% korting \(€1995 \* 0\.5\)/g,
      'monthlyPrice: 1995, // Original price'
    );
    prelaunchContent = prelaunchContent.replace(
      /yearlyPrice: 997\.50, \/\/ Prijs na 50% korting \(€1995 \* 0\.5\)/g,
      'yearlyPrice: 1995, // Original price'
    );
    
    // Update UI text
    prelaunchContent = prelaunchContent.replace(/50% KORTING/g, 'NORMALE PRIJZEN');
    
    fs.writeFileSync(prelaunchPath, prelaunchContent);
    console.log('✅ Updated prelaunchkorting page');
    
    // 2. Update maandelijks page
    const maandelijksPath = 'src/app/pakketten/maandelijks/page.tsx';
    let maandelijksContent = fs.readFileSync(maandelijksPath, 'utf8');
    
    maandelijksContent = maandelijksContent.replace(
      /monthlyPrice: 24\.50, \/\/ Prijs na 50% korting \(€49 \* 0\.5\)/g,
      'monthlyPrice: 49, // Original price'
    );
    maandelijksContent = maandelijksContent.replace(
      /yearlyPrice: 22, \/\/ Prijs na 50% korting \(€44 \* 0\.5\)/g,
      'yearlyPrice: 44, // Original price'
    );
    maandelijksContent = maandelijksContent.replace(
      /monthlyPrice: 39\.50, \/\/ Prijs na 50% korting \(€79 \* 0\.5\)/g,
      'monthlyPrice: 79, // Original price'
    );
    maandelijksContent = maandelijksContent.replace(
      /yearlyPrice: 35\.50, \/\/ Prijs na 50% korting \(€71 \* 0\.5\)/g,
      'yearlyPrice: 71, // Original price'
    );
    maandelijksContent = maandelijksContent.replace(/50% KORTING/g, 'NORMALE PRIJZEN');
    
    fs.writeFileSync(maandelijksPath, maandelijksContent);
    console.log('✅ Updated maandelijks page');
    
    // 3. Update lifetime-tier page
    const lifetimePath = 'src/app/pakketten/lifetime-tier/page.tsx';
    let lifetimeContent = fs.readFileSync(lifetimePath, 'utf8');
    
    lifetimeContent = lifetimeContent.replace(
      /monthlyPrice: 997\.50, \/\/ Prijs na 50% korting \(€1995 \* 0\.5\)/g,
      'monthlyPrice: 1995, // Original price'
    );
    lifetimeContent = lifetimeContent.replace(
      /yearlyPrice: 997\.50, \/\/ Prijs na 50% korting \(€1995 \* 0\.5\)/g,
      'yearlyPrice: 1995, // Original price'
    );
    lifetimeContent = lifetimeContent.replace(/50% KORTING/g, 'NORMALE PRIJZEN');
    
    fs.writeFileSync(lifetimePath, lifetimeContent);
    console.log('✅ Updated lifetime-tier page');
    
    // 4. Update API pricing
    const apiPath = 'src/app/api/payments/create-payment-prelaunch/route.ts';
    let apiContent = fs.readFileSync(apiPath, 'utf8');
    
    // Restore original API prices
    apiContent = apiContent.replace(
      /monthlyPrice: 24\.50, \/\/ 6 months - 50% discount \(€49 \* 0\.5\)/g,
      'monthlyPrice: 49, // 6 months - original price'
    );
    apiContent = apiContent.replace(
      /yearlyPrice: 22, \/\/ 12 months - 50% discount \(€44 \* 0\.5\)/g,
      'yearlyPrice: 44, // 12 months - original price'
    );
    apiContent = apiContent.replace(
      /monthlyPrice: 39\.50, \/\/ 6 months - 50% discount \(€79 \* 0\.5\)/g,
      'monthlyPrice: 79, // 6 months - original price'
    );
    apiContent = apiContent.replace(
      /yearlyPrice: 35\.50, \/\/ 12 months - 50% discount \(€71 \* 0\.5\)/g,
      'yearlyPrice: 71, // 12 months - original price'
    );
    apiContent = apiContent.replace(
      /monthlyPrice: 997\.50, \/\/ One-time payment - 50% discount \(€1995 \* 0\.5\)/g,
      'monthlyPrice: 1995, // One-time payment - original price'
    );
    apiContent = apiContent.replace(
      /yearlyPrice: 997\.50, \/\/ One-time payment - 50% discount \(€1995 \* 0\.5\)/g,
      'yearlyPrice: 1995, // One-time payment - original price'
    );
    apiContent = apiContent.replace(
      /lifetimePrice: 997\.50 \/\/ One-time payment - 50% discount \(€1995 \* 0\.5\)/g,
      'lifetimePrice: 1995 // One-time payment - original price'
    );
    
    // Update discount percentage
    apiContent = apiContent.replace(
      /original_price: finalPrice \* 2, \/\/ Original price before 50% discount/g,
      'original_price: finalPrice, // Original price'
    );
    apiContent = apiContent.replace(
      /discounted_price: finalPrice, \/\/ Final price after 50% discount/g,
      'discounted_price: finalPrice, // Final price (same as original)'
    );
    apiContent = apiContent.replace(
      /discount_percentage: 50,/g,
      'discount_percentage: 0,'
    );
    
    fs.writeFileSync(apiPath, apiContent);
    console.log('✅ Updated API pricing');
    
    // 5. Update CheckoutSection component
    const checkoutPath = 'src/components/CheckoutSection.tsx';
    let checkoutContent = fs.readFileSync(checkoutPath, 'utf8');
    
    checkoutContent = checkoutContent.replace(/50% KORTING/g, 'NORMALE PRIJZEN');
    checkoutContent = checkoutContent.replace(
      /Prelaunch prijs \(50% korting toegepast\)/g,
      'Prelaunch prijs (normale prijzen al toegepast)'
    );
    checkoutContent = checkoutContent.replace(
      /Start je transformatie - 50% korting!/g,
      'Start je transformatie - normale prijzen!'
    );
    
    fs.writeFileSync(checkoutPath, checkoutContent);
    console.log('✅ Updated CheckoutSection component');
    
    console.log('🎉 All prices restored to original values!');
    console.log('📝 Ready to commit and push changes...');
    
  } catch (error) {
    console.error('❌ Error updating prices:', error);
  }
}

// Function to commit and push changes
function commitAndPushChanges() {
  console.log('📝 Committing and pushing changes...');
  
  const { execSync } = require('child_process');
  
  try {
    // Add all changes
    execSync('git add .', { stdio: 'inherit' });
    
    // Commit changes
    execSync('git commit -m "Remove 50% discount - restore original prices at midnight\n\n- Restored all package prices to original values (Basic: €49/€44, Premium: €79/€71, Lifetime: €1995)\n- Updated API pricing configuration to original prices\n- Changed UI text from \'50% KORTING\' back to \'NORMALE PRIJZEN\'\n- Updated database logging to show 0% discount\n- Applied changes to all package pages and checkout component\n- Automatic midnight price restoration"', { stdio: 'inherit' });
    
    // Push changes
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✅ Changes committed and pushed successfully!');
    console.log('🚀 Original prices are now live!');
    
  } catch (error) {
    console.error('❌ Error committing/pushing changes:', error);
  }
}

// Main execution
function main() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  console.log(`🕐 Current time: ${now.toLocaleString()}`);
  
  if (currentHour === 0 && currentMinute === 0) {
    console.log('🎯 It\'s midnight! Removing discount and restoring original prices...');
    
    removeDiscountAndRestoreOriginalPrices();
    
    // Wait a moment then commit and push
    setTimeout(() => {
      commitAndPushChanges();
    }, 2000);
    
  } else {
    const timeUntilMidnight = (24 - currentHour) * 60 - currentMinute;
    const hoursUntil = Math.floor(timeUntilMidnight / 60);
    const minutesUntil = timeUntilMidnight % 60;
    
    console.log(`⏰ Next execution in ${hoursUntil}h ${minutesUntil}m`);
    console.log('💤 Waiting for midnight...');
  }
}

// Run the script
main();
