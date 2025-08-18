const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL of Service Role Key niet gevonden in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixedInsert() {
  try {
    console.log('🚀 Invoegen van voedingsplannen met juiste kolommen...');
    
    // Check if table exists
    console.log('🔍 Controleren van tabel...');
    
    const { data: testData, error: testError } = await supabase
      .from('nutrition_plans')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Tabel nutrition_plans bestaat niet:', testError);
      return;
    }
    
    console.log('✅ Tabel bestaat! Nu plannen invoegen...');
    
    const hardcodedPlans = [
      {
        name: 'Gebalanceerd',
        description: 'Een mix van alle macronutriënten voor duurzame energie en algehele gezondheid',
        target_calories: 2200,
        target_protein: 150,
        target_carbs: 200,
        target_fat: 80,
        duration_weeks: 12,
        difficulty: 'beginner',
        goal: 'maintenance',
        is_featured: true,
        is_public: true
      },
      {
        name: 'Koolhydraatarm / Keto',
        description: 'Minimale koolhydraten, hoog in gezonde vetten voor vetverbranding en stabiele bloedsuikerspiegel',
        target_calories: 1800,
        target_protein: 120,
        target_carbs: 50,
        target_fat: 120,
        duration_weeks: 8,
        difficulty: 'advanced',
        goal: 'weight_loss',
        is_featured: true,
        is_public: true
      },
      {
        name: 'Carnivoor (Rick\'s Aanpak)',
        description: 'Eet zoals de oprichter - voor maximale eenvoud en het elimineren van potentiële triggers',
        target_calories: 2000,
        target_protein: 200,
        target_carbs: 0,
        target_fat: 120,
        duration_weeks: 4,
        difficulty: 'advanced',
        goal: 'performance',
        is_featured: true,
        is_public: true
      },
      {
        name: 'High Protein',
        description: 'Maximale eiwitinname voor spieropbouw en herstel',
        target_calories: 2400,
        target_protein: 200,
        target_carbs: 150,
        target_fat: 80,
        duration_weeks: 12,
        difficulty: 'intermediate',
        goal: 'muscle_gain',
        is_featured: true,
        is_public: true
      }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const plan of hardcodedPlans) {
      console.log(`📝 Invoegen plan: ${plan.name}`);
      
      try {
        const { data: insertedPlan, error: insertError } = await supabase
          .from('nutrition_plans')
          .insert(plan)
          .select()
          .single();
        
        if (insertError) {
          console.error(`❌ Fout bij invoegen plan ${plan.name}:`, insertError);
          errorCount++;
        } else {
          console.log(`✅ Plan ${plan.name} succesvol ingevoegd (ID: ${insertedPlan.id})`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Fout bij invoegen plan ${plan.name}:`, error);
        errorCount++;
      }
    }
    
    console.log('🔍 Verificeren van ingevoegde plannen...');
    
    try {
      const { data: allPlans, error: fetchError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('❌ Fout bij ophalen plannen:', fetchError);
      } else {
        console.log(`📊 Totaal aantal plannen in database: ${allPlans.length}`);
        allPlans.forEach((plan, index) => {
          console.log(`${index + 1}. ${plan.name} (${plan.goal}) - ${plan.target_calories} kcal`);
        });
      }
    } catch (error) {
      console.error('❌ Fout bij verificatie:', error);
    }
    
    console.log('🎉 Voedingsplannen migratie voltooid!');
    console.log(`📊 Resultaat: ${successCount} succesvol, ${errorCount} fouten`);
    console.log('📋 Je kunt nu testen:');
    console.log('   1. Admin: http://localhost:3000/dashboard-admin/voedingsplannen');
    console.log('   2. Frontend: http://localhost:3000/dashboard/voedingsplannen');
    
  } catch (error) {
    console.error('❌ Fout tijdens migratie:', error);
  }
}

fixedInsert();
