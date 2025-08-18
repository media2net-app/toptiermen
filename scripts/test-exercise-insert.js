const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Load environment variables manually if needed
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key] = valueParts.join('=');
    }
  });
}

// Hardcode the values for testing (these are public anyway)
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTAyNTUsImV4cCI6MjA2NTgyNjI1NX0.x3F0xVyufYUEk3PPTgNuonOrgI70OQan2mFd3wkIlKQ';

console.log('🔧 Using hardcoded Supabase credentials for testing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExerciseInsert() {
  console.log('🧪 Testing exercise insertion...');
  
  const testExercise = {
    name: 'Test Exercise',
    primary_muscle: 'Borst',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    video_url: null,
    instructions: 'Test instructies',
    worksheet_url: null,
    secondary_muscles: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('📋 Test exercise data:', testExercise);
  
  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert([testExercise])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error inserting test exercise:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Test exercise inserted successfully:', data);
      
      // Clean up - delete the test exercise
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) {
        console.error('⚠️ Warning: Could not delete test exercise:', deleteError);
      } else {
        console.log('🧹 Test exercise cleaned up');
      }
    }
  } catch (err) {
    console.error('❌ Exception during test:', err);
  }
}

testExerciseInsert();
