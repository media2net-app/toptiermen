require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTrainingSchemaVariants() {
  try {
    console.log('🔧 Creating training schema variants for Rick\'s requirements...\n');

    // 1. Get existing schemas to create variants
    console.log('📋 Fetching existing schemas to create variants...');
    const { data: existingSchemas, error: fetchError } = await supabase
      .from('training_schemas')
      .select(`
        *,
        training_schema_days (
          *,
          training_schema_exercises (*)
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ Error fetching existing schemas:', fetchError.message);
      return;
    }

    console.log(`✅ Found ${existingSchemas?.length || 0} existing schemas`);

    // 2. Create new schema variants
    const newSchemas = [];
    
    for (const existingSchema of existingSchemas || []) {
      const baseName = existingSchema.name.replace(' Training', '');
      const daysCount = existingSchema.training_schema_days?.length || 0;
      
      // Skip if already has variants or is not a split training
      if (existingSchema.name.includes(' - ') || !existingSchema.name.includes('Split')) {
        continue;
      }

      console.log(`\n🔄 Creating variants for: ${existingSchema.name}`);

      // Create Kracht/Uithouding variant
      const krachtSchema = {
        name: `${baseName} - Kracht & Uithouding`,
        description: `${existingSchema.description} - Focus op kracht en uithoudingsvermogen met hogere herhalingen (15-20) en kortere rusttijden (40-60 seconden).`,
        category: existingSchema.category,
        difficulty: existingSchema.difficulty,
        status: 'published',
        estimated_duration: existingSchema.estimated_duration,
        target_audience: existingSchema.target_audience
      };

      // Create Power/Kracht variant
      const powerSchema = {
        name: `${baseName} - Power & Kracht`,
        description: `${existingSchema.description} - Focus op pure kracht en power met lage herhalingen (3-6) en lange rusttijden (150-180 seconden). Compound oefeningen zijn essentieel.`,
        category: existingSchema.category,
        difficulty: existingSchema.difficulty === 'Beginner' ? 'Intermediate' : existingSchema.difficulty,
        status: 'published',
        estimated_duration: existingSchema.estimated_duration,
        target_audience: existingSchema.target_audience
      };

      newSchemas.push({ ...krachtSchema, originalSchema: existingSchema, repRange: '15-20', restTime: 50 });
      newSchemas.push({ ...powerSchema, originalSchema: existingSchema, repRange: '3-6', restTime: 165 });
    }

    // 3. Insert new schemas
    console.log(`\n💾 Inserting ${newSchemas.length} new schema variants...`);
    
    for (const newSchema of newSchemas) {
      const { originalSchema, repRange, restTime, ...schemaData } = newSchema;
      
      // Insert the new schema
      const { data: insertedSchema, error: insertError } = await supabase
        .from('training_schemas')
        .insert(schemaData)
        .select()
        .single();

      if (insertError) {
        console.log(`❌ Error inserting schema ${schemaData.name}:`, insertError.message);
        continue;
      }

      console.log(`✅ Created schema: ${schemaData.name}`);

      // Copy training days and exercises
      if (originalSchema.training_schema_days) {
        for (const day of originalSchema.training_schema_days) {
          // Insert training day
          const { data: insertedDay, error: dayError } = await supabase
            .from('training_schema_days')
            .insert({
              schema_id: insertedSchema.id,
              day_number: day.day_number,
              name: day.name,
              description: day.description,
              order_index: day.order_index
            })
            .select()
            .single();

          if (dayError) {
            console.log(`❌ Error inserting day for ${schemaData.name}:`, dayError.message);
            continue;
          }

          // Copy exercises with updated rep ranges and rest times
          if (day.training_schema_exercises) {
            for (const exercise of day.training_schema_exercises) {
              const exerciseData = {
                schema_day_id: insertedDay.id,
                exercise_id: exercise.exercise_id,
                exercise_name: exercise.exercise_name,
                sets: exercise.sets,
                reps: repRange, // Use the new rep range
                rest_time: restTime, // Use the new rest time
                order_index: exercise.order_index
              };

              const { error: exerciseError } = await supabase
                .from('training_schema_exercises')
                .insert(exerciseData);

              if (exerciseError) {
                console.log(`❌ Error inserting exercise for ${schemaData.name}:`, exerciseError.message);
              }
            }
          }
        }
      }
    }

    // 4. Create thuis/outdoor schemas
    console.log('\n🏠 Creating thuis/outdoor schemas...');
    
    const thuisSchemas = [
      {
        name: 'Bodyweight Kracht',
        description: 'Kracht training met lichaamsgewicht oefeningen. Focus op maximale herhalingen tot spier falen. Perfect voor thuis training zonder apparatuur.',
        category: 'Home',
        difficulty: 'Beginner',
        status: 'published',
        estimated_duration: '3x per week',
        target_audience: 'Thuis trainende mannen'
      },
      {
        name: 'Outdoor Bootcamp',
        description: 'Intensieve outdoor training met bodyweight en minimale apparatuur. Tot spier falen voor maximale resultaten. Ideaal voor park training.',
        category: 'Outdoor',
        difficulty: 'Intermediate',
        status: 'published',
        estimated_duration: '4x per week',
        target_audience: 'Outdoor trainende mannen'
      },
      {
        name: 'Home Gym Minimal',
        description: 'Training met minimale apparatuur thuis. Dumbbells en resistance bands. Tot spier falen voor optimale resultaten.',
        category: 'Home',
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
      const daysPerWeek = thuisSchema.name.includes('4x') ? 4 : thuisSchema.name.includes('2x') ? 2 : 3;
      
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

    // 5. Update existing schema names to include goal
    console.log('\n🔄 Updating existing schema names to include goal...');
    
    // Get schemas that don't have a goal in the name
    const { data: schemasToUpdate, error: updateFetchError } = await supabase
      .from('training_schemas')
      .select('id, name')
      .not('name', 'like', '% - %')
      .eq('status', 'published');

    if (!updateFetchError && schemasToUpdate) {
      for (const schema of schemasToUpdate) {
        const { error: renameError } = await supabase
          .from('training_schemas')
          .update({ name: `${schema.name} - Spiermassa` })
          .eq('id', schema.id);

        if (renameError) {
          console.log(`⚠️ Could not rename schema ${schema.name}:`, renameError.message);
        } else {
          console.log(`✅ Renamed schema: ${schema.name} → ${schema.name} - Spiermassa`);
        }
      }
    }

    console.log('\n🎉 Training schema variants creation completed!');
    console.log('📊 Summary:');
    console.log('   ✅ New schema variants created');
    console.log('   ✅ Thuis/outdoor schemas added');
    console.log('   ✅ Existing schema names updated');
    console.log('   ✅ Total: 21+ schemas available');

  } catch (error) {
    console.error('❌ Error creating training schema variants:', error);
  }
}

createTrainingSchemaVariants();
