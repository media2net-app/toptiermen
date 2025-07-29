#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Deployment Script voor Top Tier Men');
console.log('==============================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json niet gevonden. Zorg dat je in de project root bent.');
  process.exit(1);
}

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.error('❌ Error: .env.local niet gevonden. Maak eerst je environment variables aan.');
  process.exit(1);
}

async function runCommand(command, description) {
  try {
    console.log(`🔧 ${description}...`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Succesvol`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} - Fout:`);
    console.error(error.message);
    return null;
  }
}

async function deployToVercel() {
  console.log('📋 Deployment Checklist:\n');

  // 1. Check Prisma schema
  const schemaCheck = await runCommand('npx prisma validate', 'Prisma schema valideren');
  if (!schemaCheck) {
    console.error('❌ Prisma schema is niet geldig. Fix de errors en probeer opnieuw.');
    return;
  }

  // 2. Generate Prisma client
  const generateResult = await runCommand('npx prisma generate', 'Prisma client genereren');
  if (!generateResult) {
    console.error('❌ Kon Prisma client niet genereren.');
    return;
  }

  // 3. Test database connection
  console.log('🔍 Database connectie testen...');
  try {
    const testResult = execSync('curl -s http://localhost:3000/api/test-live-db', { encoding: 'utf8' });
    const testData = JSON.parse(testResult);
    if (testData.success) {
      console.log('✅ Database connectie werkt');
      console.log(`   📊 Emails: ${testData.counts.emails}`);
      console.log(`   👥 Users: ${testData.counts.users}`);
      console.log(`   📚 Categories: ${testData.counts.categories}`);
      console.log(`   📖 Books: ${testData.counts.books}`);
    } else {
      console.error('❌ Database connectie faalt');
      return;
    }
  } catch (error) {
    console.error('❌ Kon database niet testen. Zorg dat de server draait.');
    return;
  }

  // 4. Build test
  console.log('🔨 Build testen...');
  const buildResult = await runCommand('npm run build', 'Project builden');
  if (!buildResult) {
    console.error('❌ Build gefaald. Fix de errors en probeer opnieuw.');
    return;
  }

  // 5. Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('📦 Vercel CLI installeren...');
    await runCommand('npm install -g vercel', 'Vercel CLI installeren');
  }

  // 6. Deploy to Vercel
  console.log('🚀 Deployen naar Vercel...');
  console.log('⚠️  Zorg dat je bent ingelogd bij Vercel CLI');
  console.log('⚠️  Zorg dat je environment variables zijn ingesteld in Vercel Dashboard\n');

  const deployResult = await runCommand('vercel --prod', 'Deployen naar Vercel');
  if (!deployResult) {
    console.error('❌ Deployment gefaald.');
    return;
  }

  // 7. Extract deployment URL
  const urlMatch = deployResult.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deploymentUrl = urlMatch[0];
    console.log(`\n🎉 Deployment succesvol!`);
    console.log(`🌐 URL: ${deploymentUrl}`);
    
    // 8. Test deployment
    console.log('\n🔍 Deployment testen...');
    setTimeout(async () => {
      try {
        const testResult = execSync(`curl -s ${deploymentUrl}/api/test-live-db`, { encoding: 'utf8' });
        const testData = JSON.parse(testResult);
        if (testData.success) {
          console.log('✅ Deployment werkt correct!');
          console.log(`🔗 Login URL: ${deploymentUrl}/login`);
          console.log(`🔗 Admin URL: ${deploymentUrl}/dashboard-admin`);
        } else {
          console.error('❌ Deployment test gefaald');
        }
      } catch (error) {
        console.error('❌ Kon deployment niet testen');
      }
    }, 10000); // Wait 10 seconds for deployment to be ready
  }
}

// Run deployment
deployToVercel().catch(console.error); 