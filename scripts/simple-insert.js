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

async function simpleInsert() {
  try {
    console.log('🚀 Eenvoudige invoeging van voedingsplannen...');
    
    // Check if table exists by trying to select from it
    console.log('🔍 Controleren of tabel bestaat...');
    
    const { data: testData, error: testError } = await supabase
      .from('nutrition_plans')
      .select('id')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('relation "nutrition_plans" does not exist')) {
        console.log('❌ Tabel nutrition_plans bestaat nog niet!');
        console.log('📋 Je moet eerst de tabel handmatig aanmaken:');
        console.log('📋 Ga naar: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql');
        console.log('📋 Voer dit uit:');
        console.log(`
          CREATE TABLE nutrition_plans (
            id SERIAL PRIMARY KEY,
            plan_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            subtitle TEXT,
            description TEXT,
            icon VARCHAR(10),
            color VARCHAR(100),
            meals JSONB,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX idx_nutrition_plans_plan_id ON nutrition_plans(plan_id);
          CREATE INDEX idx_nutrition_plans_active ON nutrition_plans(is_active);
          
          ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Allow authenticated users to read active nutrition plans" ON nutrition_plans
            FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
          
          CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
            FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
        `);
        console.log('📋 Klik "Run" en voer daarna dit script opnieuw uit.');
        return;
      } else {
        console.error('❌ Andere fout bij tabel check:', testError);
        return;
      }
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
        difficulty: 'Beginner',
        goal: 'Algehele gezondheid',
        is_featured: true,
        is_public: true,
        meals: [
          {
            id: 'breakfast-1',
            name: 'Havermout met Blauwe Bessen & Walnoten',
            image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Havermout', amount: 60, unit: 'gram' },
              { name: 'Melk', amount: 250, unit: 'ml' },
              { name: 'Blauwe bessen', amount: 50, unit: 'gram' },
              { name: 'Walnoten', amount: 15, unit: 'gram' }
            ],
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: 'lunch-1',
            name: 'Volkoren Wrap met Kip, Groenten & Hummus',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Volkoren wrap', amount: 1, unit: 'stuk' },
              { name: 'Kipfilet', amount: 100, unit: 'gram' },
              { name: 'Paprika', amount: 50, unit: 'gram' },
              { name: 'Komkommer', amount: 50, unit: 'gram' },
              { name: 'Hummus', amount: 30, unit: 'gram' }
            ],
            time: '13:00',
            type: 'lunch'
          },
          {
            id: 'dinner-1',
            name: 'Zalmfilet met Zoete Aardappel & Broccoli',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Zalmfilet', amount: 150, unit: 'gram' },
              { name: 'Zoete aardappel', amount: 200, unit: 'gram' },
              { name: 'Broccoli', amount: 150, unit: 'gram' }
            ],
            time: '19:00',
            type: 'dinner'
          }
        ],
        is_active: true
      },
      {
        plan_id: 'low_carb',
        name: 'Koolhydraatarm / Keto',
        subtitle: 'Focus op vetverbranding en een stabiele bloedsuikerspiegel',
        description: 'Minimale koolhydraten, hoog in gezonde vetten',
        icon: '🥑',
        color: 'from-purple-500 to-indigo-600',
        meals: [
          {
            id: 'breakfast-1',
            name: 'Griekse Yoghurt met Noten & Lijnzaad',
            image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Griekse yoghurt', amount: 200, unit: 'gram' },
              { name: 'Gemengde noten', amount: 20, unit: 'gram' },
              { name: 'Lijnzaad', amount: 10, unit: 'gram' }
            ],
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: 'lunch-1',
            name: 'Omelet met Spinazie, Tomaat & Feta',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Eieren', amount: 3, unit: 'stuks' },
              { name: 'Spinazie', amount: 50, unit: 'gram' },
              { name: 'Tomaat', amount: 50, unit: 'gram' },
              { name: 'Feta', amount: 30, unit: 'gram' }
            ],
            time: '13:00',
            type: 'lunch'
          },
          {
            id: 'dinner-1',
            name: 'Kipfilet met Courgette & Avocado',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Kipfilet', amount: 150, unit: 'gram' },
              { name: 'Courgette', amount: 100, unit: 'gram' },
              { name: 'Avocado', amount: 50, unit: 'gram' }
            ],
            time: '19:00',
            type: 'dinner'
          }
        ],
        is_active: true
      },
      {
        plan_id: 'carnivore',
        name: 'Carnivoor (Rick\'s Aanpak)',
        subtitle: 'Voor maximale eenvoud en het elimineren van potentiële triggers',
        description: 'Eet zoals de oprichter',
        icon: '🥩',
        color: 'from-red-500 to-orange-600',
        meals: [
          {
            id: 'breakfast-1',
            name: 'Ribeye Steak',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Ribeye steak', amount: 250, unit: 'gram' },
              { name: 'Roomboter', amount: 20, unit: 'gram' },
              { name: 'Zout', amount: 5, unit: 'gram' }
            ],
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: 'lunch-1',
            name: 'Kipfilet met Roomboter',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Kipfilet', amount: 200, unit: 'gram' },
              { name: 'Roomboter', amount: 30, unit: 'gram' },
              { name: 'Zout', amount: 5, unit: 'gram' }
            ],
            time: '13:00',
            type: 'lunch'
          },
          {
            id: 'dinner-1',
            name: 'Lamskotelet',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Lamskotelet', amount: 250, unit: 'gram' },
              { name: 'Roomboter', amount: 25, unit: 'gram' },
              { name: 'Zout', amount: 5, unit: 'gram' }
            ],
            time: '19:00',
            type: 'dinner'
          }
        ],
        is_active: true
      },
      {
        plan_id: 'high_protein',
        name: 'High Protein',
        subtitle: 'Geoptimaliseerd voor maximale spieropbouw en herstel',
        description: 'Maximale eiwitinname voor spiergroei',
        icon: '💪',
        color: 'from-blue-500 to-cyan-600',
        meals: [
          {
            id: 'breakfast-1',
            name: 'Proteïne Pannenkoeken met Kwark',
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Proteïne poeder', amount: 30, unit: 'gram' },
              { name: 'Havermout', amount: 40, unit: 'gram' },
              { name: 'Ei', amount: 1, unit: 'stuks' },
              { name: 'Magere kwark', amount: 100, unit: 'gram' }
            ],
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: 'lunch-1',
            name: 'Kipfilet met Quinoa & Groenten',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Kipfilet', amount: 200, unit: 'gram' },
              { name: 'Quinoa', amount: 100, unit: 'gram' },
              { name: 'Broccoli', amount: 100, unit: 'gram' },
              { name: 'Amandelen', amount: 20, unit: 'gram' }
            ],
            time: '13:00',
            type: 'lunch'
          },
          {
            id: 'dinner-1',
            name: 'Zalm met Zoete Aardappel & Spinazie',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Zalmfilet', amount: 200, unit: 'gram' },
              { name: 'Zoete aardappel', amount: 150, unit: 'gram' },
              { name: 'Spinazie', amount: 100, unit: 'gram' },
              { name: 'Griekse yoghurt', amount: 50, unit: 'gram' }
            ],
            time: '19:00',
            type: 'dinner'
          }
        ],
        is_active: true
      }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const plan of hardcodedPlans) {
      console.log(`📝 Invoegen plan: ${plan.name}`);
      
      const { data: insertData, error: insertError } = await supabase
        .from('nutrition_plans')
        .upsert(plan, { onConflict: 'plan_id' })
        .select();
      
      if (insertError) {
        console.error(`❌ Fout bij invoegen plan ${plan.name}:`, insertError);
        errorCount++;
      } else {
        console.log(`✅ Plan ${plan.name} succesvol ingevoegd/bijgewerkt`);
        successCount++;
      }
    }
    
    // Verify the plans were inserted
    console.log('🔍 Verificeren van ingevoegde plannen...');
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('is_active', true);
    
    if (plansError) {
      console.error('❌ Fout bij ophalen plannen:', plansError);
    } else {
      console.log(`✅ ${plans.length} plannen succesvol ingevoegd in database`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.plan_id})`);
      });
    }
    
    console.log('🎉 Voedingsplannen migratie voltooid!');
    console.log(`📊 Resultaat: ${successCount} succesvol, ${errorCount} fouten`);
    console.log('📋 Je kunt nu testen:');
    console.log('   1. Admin: http://localhost:3000/dashboard-admin/voedingsplannen → Frontend Plannen');
    console.log('   2. Frontend: http://localhost:3000/dashboard/voedingsplannen');
    
  } catch (error) {
    console.error('❌ Fout tijdens migratie:', error);
  }
}

simpleInsert();
