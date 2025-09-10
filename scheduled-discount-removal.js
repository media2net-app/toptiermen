#!/usr/bin/env node

/**
 * Timer Script voor automatische verwijdering van 50% prelaunch korting om 00:00
 * Uitvoering: node scheduled-discount-removal.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⏰ Timer Script voor Prelaunch Korting Verwijdering');
console.log('🎯 Doel: Automatisch verwijderen van 50% korting om 00:00');
console.log('📅 Start tijd:', new Date().toLocaleString('nl-NL'));

// Bereken tijd tot middernacht
function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Volgende middernacht
  
  const timeDiff = midnight.getTime() - now.getTime();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds, totalMs: timeDiff };
}

// Toon countdown
function showCountdown() {
  const timeLeft = getTimeUntilMidnight();
  
  if (timeLeft.totalMs <= 0) {
    console.log('🚨 MIDDERNACHT BEREIKT! Start verwijdering korting...');
    return true;
  }
  
  const timeString = `${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
  process.stdout.write(`\r⏰ Tijd tot 00:00: ${timeString} - Wachtend...`);
  
  return false;
}

// Functie om korting te verwijderen
function removeDiscount() {
  console.log('\n🚀 Start automatische verwijdering 50% prelaunch korting...');
  
  try {
    // Voer het discount removal script uit
    execSync('node remove-prelaunch-discount.js', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    console.log('\n✅ Korting succesvol verwijderd!');
    
    // Commit en push wijzigingen
    console.log('\n📝 Committing wijzigingen...');
    execSync('git add .', { stdio: 'inherit', cwd: __dirname });
    
    execSync('git commit -m "AUTOMATIC: Remove 50% prelaunch discount at midnight - implement normal pricing"', { 
      stdio: 'inherit', 
      cwd: __dirname 
    });
    
    console.log('\n🚀 Pushing naar git...');
    execSync('git push origin main', { stdio: 'inherit', cwd: __dirname });
    
    console.log('\n🎉 SUCCES! Prelaunch korting automatisch verwijderd om 00:00');
    console.log('📊 Normale prijzen zijn nu actief op de live website');
    console.log('⏰ Voltooid om:', new Date().toLocaleString('nl-NL'));
    
    return true;
    
  } catch (error) {
    console.error('\n❌ FOUT bij verwijdering korting:', error.message);
    return false;
  }
}

// Main timer loop
function startTimer() {
  console.log('\n🔄 Timer gestart - Wachtend tot 00:00...');
  
  const timer = setInterval(() => {
    const isMidnight = showCountdown();
    
    if (isMidnight) {
      clearInterval(timer);
      removeDiscount();
    }
  }, 1000);
  
  // Stop timer na 24 uur (veiligheid)
  setTimeout(() => {
    clearInterval(timer);
    console.log('\n⏰ Timer timeout na 24 uur');
  }, 24 * 60 * 60 * 1000);
}

// Start de timer
startTimer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Timer gestopt door gebruiker');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Timer gestopt door systeem');
  process.exit(0);
});
