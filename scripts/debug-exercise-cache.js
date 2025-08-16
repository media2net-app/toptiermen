require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugExerciseCache() {
  console.log('🔍 Debuggen van oefening cache problemen...');
  
  // Haal alle oefeningen op
  const { data: exercises, error: fetchError } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
    
  if (fetchError) {
    console.error('❌ Fout bij ophalen oefeningen:', fetchError);
    return;
  }
  
  console.log(`📋 ${exercises.length} oefeningen gevonden`);
  
  // Zoek oefeningen met recente updates
  const recentExercises = exercises.filter(ex => {
    const updateTime = new Date(ex.updated_at);
    const hoursDiff = (Date.now() - updateTime.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24; // Laatste 24 uur
  });
  
  console.log(`🆕 ${recentExercises.length} oefeningen met recente updates (laatste 24u)`);
  
  if (recentExercises.length > 0) {
    console.log('\n📋 RECENT GEÜPDATETE OEFENINGEN:');
    console.log('================================');
    recentExercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name}`);
      console.log(`   ID: ${exercise.id}`);
      console.log(`   Instructies: ${exercise.instructions.substring(0, 100)}...`);
      console.log(`   Laatste update: ${exercise.updated_at}`);
      console.log('');
    });
  }
  
  // Test specifieke oefening update en direct ophalen
  console.log('🧪 TESTEN VAN UPDATE + DIRECT OPHALEN...');
  console.log('========================================');
  
  const testExercise = exercises[0];
  const originalInstructions = testExercise.instructions;
  const testInstructions = `DEBUG TEST - ${new Date().toISOString()}`;
  
  console.log(`Test oefening: ${testExercise.name} (ID: ${testExercise.id})`);
  console.log(`Originele instructies: ${originalInstructions}`);
  
  // Update
  const { data: updatedExercise, error: updateError } = await supabase
    .from('exercises')
    .update({ 
      instructions: testInstructions,
      updated_at: new Date().toISOString()
    })
    .eq('id', testExercise.id)
    .select()
    .single();
    
  if (updateError) {
    console.error('❌ Update fout:', updateError);
    return;
  }
  
  console.log(`✅ Update succesvol: ${updatedExercise.instructions}`);
  
  // Direct ophalen
  const { data: fetchedExercise, error: fetchError2 } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', testExercise.id)
    .single();
    
  if (fetchError2) {
    console.error('❌ Fetch fout:', fetchError2);
    return;
  }
  
  console.log(`📥 Direct opgehaald: ${fetchedExercise.instructions}`);
  
  // Check of ze overeenkomen
  if (fetchedExercise.instructions === testInstructions) {
    console.log('✅ Direct ophalen werkt correct!');
  } else {
    console.log('❌ Direct ophalen werkt NIET correct!');
    console.log(`Verwacht: ${testInstructions}`);
    console.log(`Gevonden: ${fetchedExercise.instructions}`);
  }
  
  // Test met verschillende select queries
  console.log('\n🧪 TESTEN VAN VERSCHILLENDE QUERIES...');
  console.log('======================================');
  
  // Query 1: Alle velden
  const { data: query1, error: error1 } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', testExercise.id)
    .single();
    
  console.log(`Query 1 (alle velden): ${query1?.instructions}`);
  
  // Query 2: Specifieke velden
  const { data: query2, error: error2 } = await supabase
    .from('exercises')
    .select('id, name, instructions, updated_at')
    .eq('id', testExercise.id)
    .single();
    
  console.log(`Query 2 (specifieke velden): ${query2?.instructions}`);
  
  // Query 3: Met order
  const { data: query3, error: error3 } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', testExercise.id)
    .order('updated_at', { ascending: false })
    .single();
    
  console.log(`Query 3 (met order): ${query3?.instructions}`);
  
  // Herstel originele instructies
  const { error: restoreError } = await supabase
    .from('exercises')
    .update({ 
      instructions: originalInstructions,
      updated_at: testExercise.updated_at
    })
    .eq('id', testExercise.id);
    
  if (restoreError) {
    console.error('❌ Fout bij herstellen:', restoreError);
  } else {
    console.log('✅ Originele instructies hersteld');
  }
  
  // Controleer of er RLS (Row Level Security) problemen zijn
  console.log('\n🔒 CONTROLEEREN VAN RLS...');
  console.log('==========================');
  
  const { data: rlsTest, error: rlsError } = await supabase
    .from('exercises')
    .select('count')
    .limit(1);
    
  if (rlsError) {
    console.log('❌ RLS probleem gedetecteerd:', rlsError.message);
  } else {
    console.log('✅ RLS werkt correct');
  }
  
  console.log('\n💡 MOGELIJKE OORZAKEN VAN CACHE PROBLEMEN:');
  console.log('===========================================');
  console.log('1. Browser cache - probeer hard refresh (Ctrl+F5)');
  console.log('2. React state niet geüpdatet - check component re-render');
  console.log('3. Supabase client cache - check cache configuratie');
  console.log('4. Network latency - check internet verbinding');
  console.log('5. Database triggers - check of er triggers zijn die data wijzigen');
}

debugExerciseCache().catch(console.error);
