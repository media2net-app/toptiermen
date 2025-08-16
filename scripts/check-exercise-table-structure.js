require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExerciseTableStructure() {
  console.log('🔍 EXERCISE TABLE STRUCTURE CHECK');
  console.log('==================================');
  
  try {
    // Probeer een oefening op te halen om de structuur te zien
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Fout bij ophalen oefeningen:', error);
      return;
    }

    if (exercises && exercises.length > 0) {
      console.log('\n📋 HUIDIGE TABEL STRUCTUUR:');
      console.log('============================');
      const exercise = exercises[0];
      Object.keys(exercise).forEach(key => {
        console.log(`- ${key}: ${typeof exercise[key]} (${exercise[key]})`);
      });
    } else {
      console.log('\n📋 TABEL IS LEEG');
      console.log('================');
      console.log('De exercises tabel bestaat maar is leeg.');
    }

    // Probeer een insert om te zien welke kolommen beschikbaar zijn
    console.log('\n🧪 TEST INSERT OM KOLOMMEN TE CONTROLEREN...');
    
    const testData = {
      name: 'Test Exercise',
      muscle_group: 'Test',
      equipment: 'Test',
      difficulty: 'Beginner',
      instructions: 'Test instructions',
      video_url: 'test.mp4',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: testInsert, error: insertError } = await supabase
      .from('exercises')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.log('\n❌ INSERT ERROR (dit is normaal voor test):');
      console.log('==========================================');
      console.log(insertError.message);
      
      // Probeer zonder description
      console.log('\n🧪 TEST INSERT ZONDER DESCRIPTION...');
      const testData2 = {
        name: 'Test Exercise 2',
        muscle_group: 'Test',
        equipment: 'Test',
        difficulty: 'Beginner',
        instructions: 'Test instructions',
        video_url: 'test2.mp4'
      };

      const { data: testInsert2, error: insertError2 } = await supabase
        .from('exercises')
        .insert(testData2)
        .select()
        .single();

      if (insertError2) {
        console.log('\n❌ INSERT ERROR 2:');
        console.log('==================');
        console.log(insertError2.message);
      } else {
        console.log('\n✅ SUCCESSFUL INSERT:');
        console.log('====================');
        console.log(testInsert2);
        
        // Verwijder test data
        await supabase
          .from('exercises')
          .delete()
          .eq('name', 'Test Exercise 2');
      }
    } else {
      console.log('\n✅ SUCCESSFUL INSERT:');
      console.log('====================');
      console.log(testInsert);
      
      // Verwijder test data
      await supabase
        .from('exercises')
        .delete()
        .eq('name', 'Test Exercise');
    }

  } catch (error) {
    console.error('❌ Fout bij checken tabel structuur:', error);
  }
}

checkExerciseTableStructure().catch(console.error);
