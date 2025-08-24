require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixThuisSchemas() {
  try {
    console.log('🔧 Fixing thuis schemas with correct categories...\n');

    // Create thuis schemas with correct category values
    const thuisSchemas = [
      {
        name: 'Bodyweight Kracht',
        description: 'Kracht training met lichaamsgewicht oefeningen. Focus op maximale herhalingen tot spier falen. Perfect voor thuis training zonder apparatuur.',
        category: 'Gym', // Use existing category
        difficulty: 'Beginner',
        status: 'published',
        estimated_duration: '3x per week',
        target_audience: 'Thuis trainende mannen'
      },
      {
        name: 'Home Gym Minimal',
        description: 'Training met minimale apparatuur thuis. Dumbbells en resistance bands. Tot spier falen voor optimale resultaten.',
        category: 'Gym', // Use existing category
        difficulty: 'Beginner',
        status: 'published',
        estimated_duration: '2x per week',
        target_audience: 'Thuis trainende mannen met basis apparatuur'
      }
    ];

    for (const thuisSchema of thuisSchemas) {
      const { data: insertedThuisSchema, error: thuisError } = await supabase
        .from('training_schemas')
        .insert(thuisSchema)
        .select()
        .single();

      if (thuisError) {
        console.log(`❌ Error inserting thuis schema ${thuisSchema.name}:`, thuisError.message);
        continue;
      }

      console.log(`✅ Created thuis schema: ${thuisSchema.name}`);

      // Add basic training days for thuis schemas
      const daysPerWeek = thuisSchema.name.includes('2x') ? 2 : 3;
      
      for (let i = 1; i <= daysPerWeek; i++) {
        const { data: insertedDay, error: dayError } = await supabase
          .from('training_schema_days')
          .insert({
            schema_id: insertedThuisSchema.id,
            day_number: i,
            name: `Dag ${i}`,
            description: `Training dag ${i} - ${thuisSchema.name}`,
            order_index: i
          })
          .select()
          .single();

        if (dayError) {
          console.log(`❌ Error inserting thuis day:`, dayError.message);
        }
      }
    }

    console.log('\n🎉 Thuis schemas fixed and created!');

  } catch (error) {
    console.error('❌ Error fixing thuis schemas:', error);
  }
}

fixThuisSchemas();
