const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTrainingSchemaDescriptions() {
  console.log('🔄 Updating training schema descriptions...\n');

  try {
    // Get current training schemas
    const { data: schemas, error: fetchError } = await supabase
      .from('training_schemas')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching schemas:', fetchError);
      return;
    }

    console.log(`✅ Found ${schemas?.length || 0} training schemas`);

    // Define new simplified descriptions
    const updatedDescriptions = {
      'Split Training - Foundation & Muscle Building': 'Focus op specifieke spiergroepen per dag voor maximale isolatie en herstel.',
      'Full Body - Foundation & Muscle Building': 'Alle spiergroepen per training voor optimale frequentie en herstel.',
      'Push Pull Legs - Advanced Muscle Building': 'Geavanceerde splitsing voor maximale spiergroei en krachttoename.',
      'Upper Lower Split - Balanced Development': 'Gebalanceerde ontwikkeling van boven- en onderlichaam.',
      'Bodyweight Foundation - Home Training': 'Effectieve training zonder apparatuur, perfect voor thuis.',
      'Bodyweight Advanced - Calisthenics': 'Geavanceerde calisthenics voor kracht en controle.'
    };

    // Update each schema
    for (const schema of schemas || []) {
      const newDescription = updatedDescriptions[schema.name];
      
      if (newDescription) {
        console.log(`📝 Updating "${schema.name}"...`);
        
        const { error: updateError } = await supabase
          .from('training_schemas')
          .update({ description: newDescription })
          .eq('id', schema.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${schema.name}:`, updateError);
        } else {
          console.log(`   ✅ Updated: "${newDescription}"`);
        }
      } else {
        console.log(`⚠️  No new description found for "${schema.name}"`);
      }
    }

    console.log('\n🎉 Training schema descriptions updated successfully!');
    console.log('📋 Summary of changes:');
    console.log('   - Removed duplicate information about rep ranges and rest periods');
    console.log('   - Simplified descriptions to focus on training style and benefits');
    console.log('   - Kept essential information while removing redundancy');

  } catch (error) {
    console.error('❌ Error in update:', error);
  }
}

updateTrainingSchemaDescriptions();
