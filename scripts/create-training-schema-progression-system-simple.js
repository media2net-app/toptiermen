require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Training progression system for 6 months (24 weeks) with 8-week cycles
const PROGRESSION_SYSTEM = {
  // Month 1-2: Foundation & Muscle Building
  'weeks_1_8': {
    name: 'Foundation & Muscle Building',
    description: 'Bouw een sterke basis op met focus op spiergroei en correcte uitvoering. Perfect voor beginners en herstel na een pauze.',
    focus: 'spiermassa',
    rep_range: '8-12',
    rest_time: 90,
    difficulty: 'Beginner',
    category: 'progression'
  },
  
  // Month 3-4: Strength & Power Development
  'weeks_9_16': {
    name: 'Strength & Power Development',
    description: 'Verhoog je kracht en power met compound oefeningen en zwaardere gewichten. Focus op neurologische adaptatie.',
    focus: 'kracht',
    rep_range: '3-6',
    rest_time: 180,
    difficulty: 'Intermediate',
    category: 'progression'
  },
  
  // Month 5-6: Endurance & Conditioning
  'weeks_17_24': {
    name: 'Endurance & Conditioning',
    description: 'Verbeter je uithoudingsvermogen en conditionering. Hogere herhalingen met kortere rusttijden voor cardiovasculaire fitness.',
    focus: 'uithouding',
    rep_range: '15-20',
    rest_time: 45,
    difficulty: 'Advanced',
    category: 'progression'
  }
};

// Different training styles for variety
const TRAINING_STYLES = {
  'split_training': {
    name: 'Split Training',
    description: 'Focus op specifieke spiergroepen per dag voor maximale isolatie en herstel.',
    days: ['Borst & Triceps', 'Rug & Biceps', 'Benen & Schouders', 'Arms & Core', 'Full Body']
  },
  'push_pull_legs': {
    name: 'Push/Pull/Legs',
    description: 'Efficiënte verdeling van oefeningen gebaseerd op bewegingstype.',
    days: ['Push (Borst, Schouders, Triceps)', 'Pull (Rug, Biceps)', 'Legs (Benen, Core)']
  },
  'full_body': {
    name: 'Full Body',
    description: 'Alle spiergroepen per training voor optimale frequentie en herstel.',
    days: ['Full Body A', 'Full Body B', 'Full Body C']
  },
  'upper_lower': {
    name: 'Upper/Lower Split',
    description: 'Verdeling tussen boven- en onderlichaam voor gebalanceerde ontwikkeling.',
    days: ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body']
  },
  'functional': {
    name: 'Functional Training',
    description: 'Bewegingspatronen die het dagelijks leven verbeteren en sportprestaties ondersteunen.',
    days: ['Movement & Mobility', 'Strength & Stability', 'Power & Explosiveness', 'Endurance & Recovery']
  }
};

async function createTrainingSchemaProgressionSystemSimple() {
  try {
    console.log('🏋️ Creating simplified training schema progression system...\n');

    // 1. Create progression schemas for each 8-week cycle
    console.log('📅 Creating 8-week progression schemas...');
    
    for (const [cycleKey, cycleData] of Object.entries(PROGRESSION_SYSTEM)) {
      console.log(`\n🔄 Creating ${cycleData.name} schemas...`);
      
      for (const [styleKey, styleData] of Object.entries(TRAINING_STYLES)) {
        const schemaName = `${styleData.name} - ${cycleData.name}`;
        const schemaDescription = `${styleData.description} ${cycleData.description} Rep range: ${cycleData.rep_range}, Rust: ${cycleData.rest_time}s. ⚠️ **BELANGRIJK:** We adviseren ten alle tijden om het aantal herhalingen te doen tot spierfalen moment voor optimale resultaten.`;
        
        // Create schema with only existing columns
        const { data: schema, error: schemaError } = await supabase
          .from('training_schemas')
          .insert({
            name: schemaName,
            description: schemaDescription,
            category: cycleData.category,
            difficulty: cycleData.difficulty,
            status: 'published',
            training_goal: cycleData.focus,
            rep_range: cycleData.rep_range,
            rest_time_seconds: cycleData.rest_time,
            equipment_type: 'gym'
          })
          .select()
          .single();

        if (schemaError) {
          console.log(`⚠️ Could not create schema ${schemaName}:`, schemaError.message);
          continue;
        }

        console.log(`✅ Created schema: ${schemaName}`);

        // Create schema days
        for (let dayIndex = 0; dayIndex < styleData.days.length; dayIndex++) {
          const dayName = styleData.days[dayIndex];
          const dayDescription = `${dayName} training voor ${cycleData.name}. Focus op ${cycleData.focus} met ${cycleData.rep_range} herhalingen. ⚠️ **BELANGRIJK:** Doe alle oefeningen tot spierfalen voor optimale resultaten.`;
          
          const { data: day, error: dayError } = await supabase
            .from('training_schema_days')
            .insert({
              schema_id: schema.id,
              day_number: dayIndex + 1,
              name: dayName,
              description: dayDescription,
              order_index: dayIndex
            })
            .select()
            .single();

          if (dayError) {
            console.log(`⚠️ Could not create day ${dayName}:`, dayError.message);
            continue;
          }

          // Create exercises for this day
          const exercises = generateExercisesForDay(dayName, cycleData, styleKey);
          
          for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex++) {
            const exercise = exercises[exerciseIndex];
            
            const { error: exerciseError } = await supabase
              .from('training_schema_exercises')
              .insert({
                schema_day_id: day.id,
                exercise_name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                rest_time: cycleData.rest_time,
                order_index: exerciseIndex,
                target_reps: cycleData.rep_range,
                target_sets: exercise.sets,
                rest_time_seconds: cycleData.rest_time
              });

            if (exerciseError) {
              console.log(`⚠️ Could not create exercise ${exercise.name}:`, exerciseError.message);
            }
          }

          console.log(`✅ Created day: ${dayName} with ${exercises.length} exercises`);
        }
      }
    }

    // 2. Create specialized programs with existing categories
    console.log('\n🎯 Creating specialized training programs...');
    
    const specializedPrograms = [
      {
        name: 'Athletic Performance',
        description: 'Programma gericht op atletische prestaties, explosiviteit en functionele kracht.',
        focus: 'performance',
        rep_range: '5-8',
        rest_time: 120,
        difficulty: 'Advanced',
        category: 'specialized'
      },
      {
        name: 'Body Recomposition',
        description: 'Gelijktijdige vetverlies en spiergroei door geoptimaliseerde training en voeding.',
        focus: 'recomposition',
        rep_range: '8-15',
        rest_time: 75,
        difficulty: 'Intermediate',
        category: 'specialized'
      },
      {
        name: 'Sport-Specific Training',
        description: 'Training aangepast aan specifieke sporten (voetbal, tennis, zwemmen, etc.).',
        focus: 'sport_specific',
        rep_range: '6-12',
        rest_time: 90,
        difficulty: 'Advanced',
        category: 'specialized'
      }
    ];

    for (const program of specializedPrograms) {
      const schemaName = `Specialized: ${program.name}`;
      const schemaDescription = `${program.description} Rep range: ${program.rep_range}, Rust: ${program.rest_time}s. ⚠️ **BELANGRIJK:** We adviseren ten alle tijden om het aantal herhalingen te doen tot spierfalen moment voor optimale resultaten.`;
      
      const { data: schema, error: schemaError } = await supabase
        .from('training_schemas')
        .insert({
          name: schemaName,
          description: schemaDescription,
          category: program.category,
          difficulty: program.difficulty,
          status: 'published',
          training_goal: program.focus,
          rep_range: program.rep_range,
          rest_time_seconds: program.rest_time,
          equipment_type: 'gym'
        })
        .select()
        .single();

      if (schemaError) {
        console.log(`⚠️ Could not create specialized schema ${schemaName}:`, schemaError.message);
        continue;
      }

      console.log(`✅ Created specialized schema: ${schemaName}`);

      // Create days for specialized program
      const specializedDays = [
        'Power & Speed Training',
        'Strength & Stability',
        'Conditioning & Endurance',
        'Recovery & Mobility'
      ];

      for (let dayIndex = 0; dayIndex < specializedDays.length; dayIndex++) {
        const dayName = specializedDays[dayIndex];
        const dayDescription = `${dayName} training voor ${program.name}. ⚠️ **BELANGRIJK:** Doe alle oefeningen tot spierfalen voor optimale resultaten.`;
        
        const { data: day, error: dayError } = await supabase
          .from('training_schema_days')
          .insert({
            schema_id: schema.id,
            day_number: dayIndex + 1,
            name: dayName,
            description: dayDescription,
            order_index: dayIndex
          })
          .select()
          .single();

        if (dayError) {
          console.log(`⚠️ Could not create specialized day ${dayName}:`, dayError.message);
          continue;
        }

        // Create exercises for specialized day
        const exercises = generateSpecializedExercises(dayName, program);
        
        for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex++) {
          const exercise = exercises[exerciseIndex];
          
          const { error: exerciseError } = await supabase
            .from('training_schema_exercises')
            .insert({
              schema_day_id: day.id,
              exercise_name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_time: program.rest_time,
              order_index: exerciseIndex,
              target_reps: program.rep_range,
              target_sets: exercise.sets,
              rest_time_seconds: program.rest_time
            });

          if (exerciseError) {
            console.log(`⚠️ Could not create specialized exercise ${exercise.name}:`, exerciseError.message);
          }
        }

        console.log(`✅ Created specialized day: ${dayName} with ${exercises.length} exercises`);
      }
    }

    console.log('\n🎉 Training schema progression system created successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ 15 progression schemas (3 cycles × 5 styles)');
    console.log('✅ 3 specialized programs');
    console.log('✅ 8-week cycles for 6-month progression');
    console.log('✅ Varied training styles and difficulties');
    console.log('✅ Muscle failure warnings on all schemas');

  } catch (error) {
    console.error('❌ Error creating progression system:', error);
  }
}

function generateExercisesForDay(dayName, cycleData, styleKey) {
  const exercises = [];
  const focus = cycleData.focus;
  
  // Base exercises based on day focus
  if (dayName.includes('Borst') || dayName.includes('Push')) {
    exercises.push(
      { name: 'Bench Press', sets: 4, reps: cycleData.rep_range },
      { name: 'Incline Dumbbell Press', sets: 3, reps: cycleData.rep_range },
      { name: 'Cable Flyes', sets: 3, reps: cycleData.rep_range },
      { name: 'Push-ups', sets: 3, reps: cycleData.rep_range }
    );
  }
  
  if (dayName.includes('Rug') || dayName.includes('Pull')) {
    exercises.push(
      { name: 'Barbell Rows', sets: 4, reps: cycleData.rep_range },
      { name: 'Pull-ups', sets: 3, reps: cycleData.rep_range },
      { name: 'Cable Rows', sets: 3, reps: cycleData.rep_range },
      { name: 'Face Pulls', sets: 3, reps: cycleData.rep_range }
    );
  }
  
  if (dayName.includes('Benen') || dayName.includes('Legs') || dayName.includes('Lower')) {
    exercises.push(
      { name: 'Squats', sets: 4, reps: cycleData.rep_range },
      { name: 'Romanian Deadlifts', sets: 3, reps: cycleData.rep_range },
      { name: 'Leg Press', sets: 3, reps: cycleData.rep_range },
      { name: 'Lunges', sets: 3, reps: cycleData.rep_range }
    );
  }
  
  if (dayName.includes('Full Body')) {
    exercises.push(
      { name: 'Deadlifts', sets: 3, reps: cycleData.rep_range },
      { name: 'Bench Press', sets: 3, reps: cycleData.rep_range },
      { name: 'Squats', sets: 3, reps: cycleData.rep_range },
      { name: 'Overhead Press', sets: 3, reps: cycleData.rep_range },
      { name: 'Barbell Rows', sets: 3, reps: cycleData.rep_range }
    );
  }
  
  // Add focus-specific exercises
  if (focus === 'kracht') {
    exercises.push(
      { name: 'Power Cleans', sets: 3, reps: '3-5' },
      { name: 'Box Jumps', sets: 3, reps: '5-8' }
    );
  } else if (focus === 'uithouding') {
    exercises.push(
      { name: 'Burpees', sets: 3, reps: '15-20' },
      { name: 'Mountain Climbers', sets: 3, reps: '30-45 seconds' }
    );
  }
  
  return exercises;
}

function generateSpecializedExercises(dayName, program) {
  const exercises = [];
  
  if (dayName.includes('Power') || dayName.includes('Speed')) {
    exercises.push(
      { name: 'Power Cleans', sets: 4, reps: '3-5' },
      { name: 'Box Jumps', sets: 3, reps: '5-8' },
      { name: 'Medicine Ball Throws', sets: 3, reps: '8-10' },
      { name: 'Plyometric Push-ups', sets: 3, reps: '5-8' }
    );
  } else if (dayName.includes('Strength') || dayName.includes('Stability')) {
    exercises.push(
      { name: 'Deadlifts', sets: 4, reps: program.rep_range },
      { name: 'Squats', sets: 4, reps: program.rep_range },
      { name: 'Overhead Press', sets: 3, reps: program.rep_range },
      { name: 'Planks', sets: 3, reps: '30-60 seconds' }
    );
  } else if (dayName.includes('Conditioning') || dayName.includes('Endurance')) {
    exercises.push(
      { name: 'Circuit Training', sets: 4, reps: '30 seconds each' },
      { name: 'Tabata Intervals', sets: 8, reps: '20s work / 10s rest' },
      { name: 'AMRAP Sets', sets: 3, reps: 'As Many Reps As Possible' }
    );
  } else {
    // Recovery & Mobility
    exercises.push(
      { name: 'Dynamic Stretching', sets: 1, reps: '10-15 minutes' },
      { name: 'Foam Rolling', sets: 1, reps: '15-20 minutes' },
      { name: 'Mobility Drills', sets: 3, reps: '10-12 reps each' },
      { name: 'Light Cardio', sets: 1, reps: '20-30 minutes' }
    );
  }
  
  return exercises;
}

createTrainingSchemaProgressionSystemSimple();
