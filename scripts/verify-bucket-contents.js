require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyBucketContents() {
  console.log('🔍 Verifying actual bucket contents...\n');
  
  try {
    // List all files in the advertenties bucket
    const { data: files, error } = await supabase.storage
      .from('advertenties')
      .list('', {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('❌ Error listing bucket files:', error);
      return;
    }

    console.log(`📋 Total files in bucket: ${files?.length || 0}\n`);

    if (files && files.length > 0) {
      console.log('📁 Files in bucket:');
      console.log('==================\n');
      
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Size: ${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Created: ${file.created_at}`);
        console.log(`   Updated: ${file.updated_at}`);
        console.log('');
      });

      // Check for specific files
      console.log('🔍 Checking for specific files:');
      console.log('==============================\n');

      const expectedFiles = [
        'algemeen_01.mp4',
        'algemeen_02.mp4', 
        'algemeen_03.mp4',
        'algemeen_04.mp4',
        'algemeen_05.mp4',
        'jongeren_01.mp4',
        'jongeren_02.mp4',
        'vaders_01.mp4',
        'vaders_02.mp4',
        'zakelijk_01.mp4',
        'zakelijk_02.mp4'
      ];

      const actualFiles = files.map(f => f.name);
      
      console.log('Expected files:');
      expectedFiles.forEach(expected => {
        const found = actualFiles.includes(expected);
        console.log(`   ${found ? '✅' : '❌'} ${expected}`);
      });

      console.log('\nMissing files:');
      const missingFiles = expectedFiles.filter(expected => !actualFiles.includes(expected));
      if (missingFiles.length > 0) {
        missingFiles.forEach(missing => {
          console.log(`   ❌ ${missing}`);
        });
      } else {
        console.log('   ✅ All expected files present');
      }

      console.log('\nUnexpected files:');
      const unexpectedFiles = actualFiles.filter(actual => !expectedFiles.includes(actual));
      if (unexpectedFiles.length > 0) {
        unexpectedFiles.forEach(unexpected => {
          console.log(`   ⚠️  ${unexpected}`);
        });
      } else {
        console.log('   ✅ No unexpected files');
      }

      // Verify the 3 "Updated" videos are the correct ones
      console.log('\n🎯 Verifying "Updated" videos are correct:');
      console.log('==========================================\n');

      // The 3 "Updated" videos should be the newer versions with these original names:
      const updatedVideoMapping = {
        'algemeen_01.mp4': 'algemeen_01 (Updated)',
        'jongeren_01.mp4': 'jongeren_01 (Updated)', 
        'vaders_01.mp4': 'vaders_01 (Updated)'
      };

      for (const [fileName, expectedDisplayName] of Object.entries(updatedVideoMapping)) {
        const fileExists = actualFiles.includes(fileName);
        console.log(`${fileExists ? '✅' : '❌'} ${fileName} → ${expectedDisplayName}`);
        
        if (fileExists) {
          const file = files.find(f => f.name === fileName);
          console.log(`   Size: ${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB`);
          console.log(`   Created: ${file.created_at}`);
        }
        console.log('');
      }

      // Summary
      console.log('📊 Summary:');
      console.log('===========');
      console.log(`✅ Files in bucket: ${actualFiles.length}`);
      console.log(`✅ Expected files: ${expectedFiles.length}`);
      console.log(`✅ Missing files: ${missingFiles.length}`);
      console.log(`⚠️  Unexpected files: ${unexpectedFiles.length}`);
      
      const allExpectedPresent = missingFiles.length === 0;
      const noUnexpected = unexpectedFiles.length === 0;
      
      if (allExpectedPresent && noUnexpected) {
        console.log('\n🎯 BUCKET CONTENTS ARE PERFECT! ✅');
      } else {
        console.log('\n⚠️  BUCKET CONTENTS NEED ATTENTION! ❌');
      }

    } else {
      console.log('❌ No files found in bucket');
    }

  } catch (error) {
    console.error('❌ Error during bucket verification:', error);
  }
}

verifyBucketContents().catch(console.error);
