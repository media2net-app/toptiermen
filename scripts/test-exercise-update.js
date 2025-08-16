require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testExerciseUpdate() {
  console.log('🧪 Testen van oefening update functionaliteit...');
  
  // Haal een oefening op om te testen
  const { data: exercise, error: fetchError } = await supabase
    .from('exercises')
    .select('*')
    .limit(1)
    .single();
    
  if (fetchError) {
    console.error('❌ Fout bij ophalen oefening:', fetchError);
    return;
  }
  
  console.log('📋 ORIGINELE OEFENING:');
  console.log('=====================');
  console.log(`ID: ${exercise.id}`);
  console.log(`Naam: ${exercise.name}`);
  console.log(`Instructies: ${exercise.instructions}`);
  console.log(`Laatste update: ${exercise.updated_at}`);
  
  // Test update
  const testInstructions = `Test instructies - ${new Date().toISOString()}`;
  const updateData = {
    instructions: testInstructions,
    updated_at: new Date().toISOString()
  };
  
  console.log('\n🔄 UPDATING OEFENING...');
  console.log('========================');
  console.log('Update data:', updateData);
  
  const { data: updatedExercise, error: updateError } = await supabase
    .from('exercises')
    .update(updateData)
    .eq('id', exercise.id)
    .select()
    .single();
    
  if (updateError) {
    console.error('❌ Fout bij updaten:', updateError);
    return;
  }
  
  console.log('\n✅ OEFENING GEÜPDATET:');
  console.log('======================');
  console.log(`ID: ${updatedExercise.id}`);
  console.log(`Naam: ${updatedExercise.name}`);
  console.log(`Instructies: ${updatedExercise.instructions}`);
  console.log(`Laatste update: ${updatedExercise.updated_at}`);
  
  // Verifieer dat de update is opgeslagen
  console.log('\n🔍 VERIFICATIE - OPHALEN VAN DATABASE:');
  console.log('=====================================');
  
  const { data: verifyExercise, error: verifyError } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exercise.id)
    .single();
    
  if (verifyError) {
    console.error('❌ Fout bij verificatie:', verifyError);
    return;
  }
  
  console.log(`ID: ${verifyExercise.id}`);
  console.log(`Naam: ${verifyExercise.name}`);
  console.log(`Instructies: ${verifyExercise.instructions}`);
  console.log(`Laatste update: ${verifyExercise.updated_at}`);
  
  // Check of de update succesvol was
  if (verifyExercise.instructions === testInstructions) {
    console.log('\n✅ VERIFICATIE GESLAAGD - Update is correct opgeslagen!');
  } else {
    console.log('\n❌ VERIFICATIE MISLUKT - Update is niet correct opgeslagen!');
    console.log(`Verwacht: ${testInstructions}`);
    console.log(`Gevonden: ${verifyExercise.instructions}`);
  }
  
  // Herstel originele instructies
  console.log('\n🔄 HERSTELLEN VAN ORIGINELE INSTRUCTIES...');
  const { error: restoreError } = await supabase
    .from('exercises')
    .update({ 
      instructions: exercise.instructions,
      updated_at: exercise.updated_at
    })
    .eq('id', exercise.id);
    
  if (restoreError) {
    console.error('❌ Fout bij herstellen:', restoreError);
  } else {
    console.log('✅ Originele instructies hersteld');
  }
  
  // Test meerdere velden update
  console.log('\n🧪 TESTEN VAN MEERDERE VELDEN UPDATE...');
  const multiUpdateData = {
    name: `${exercise.name} (TEST)`,
    instructions: `Test instructies voor meerdere velden - ${new Date().toISOString()}`,
    difficulty: 'Advanced',
    updated_at: new Date().toISOString()
  };
  
  const { data: multiUpdated, error: multiError } = await supabase
    .from('exercises')
    .update(multiUpdateData)
    .eq('id', exercise.id)
    .select()
    .single();
    
  if (multiError) {
    console.error('❌ Fout bij meerdere velden update:', multiError);
  } else {
    console.log('✅ Meerdere velden update succesvol:');
    console.log(`   Naam: ${multiUpdated.name}`);
    console.log(`   Instructies: ${multiUpdated.instructions}`);
    console.log(`   Moeilijkheid: ${multiUpdated.difficulty}`);
  }
  
  // Herstel alles
  const { error: finalRestoreError } = await supabase
    .from('exercises')
    .update({
      name: exercise.name,
      instructions: exercise.instructions,
      difficulty: exercise.difficulty,
      updated_at: exercise.updated_at
    })
    .eq('id', exercise.id);
    
  if (finalRestoreError) {
    console.error('❌ Fout bij final herstel:', finalRestoreError);
  } else {
    console.log('✅ Alles hersteld naar originele staat');
  }
}

testExerciseUpdate().catch(console.error);
