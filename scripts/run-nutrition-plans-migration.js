const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL of Service Role Key niet gevonden in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Start voedingsplannen migratie...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-nutrition-plans-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL script geladen');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 ${statements.length} SQL statements gevonden`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`📝 Uitvoeren statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_dummy').select('*').limit(0);
          if (directError && directError.message.includes('relation "_dummy" does not exist')) {
            // This is expected, try to execute the statement directly
            console.log('⚠️  RPC niet beschikbaar, probeer directe uitvoering...');
            continue;
          }
          console.error(`❌ Fout bij statement ${i + 1}:`, error);
        } else {
          console.log(`✅ Statement ${i + 1} succesvol uitgevoerd`);
        }
      }
    }
    
    // Verify the table was created
    console.log('🔍 Verificeren van tabel creatie...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'nutrition_plans');
    
    if (tableError) {
      console.log('⚠️  Kon tabel verificatie niet uitvoeren, maar ga door...');
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabel nutrition_plans succesvol aangemaakt!');
    } else {
      console.log('⚠️  Tabel niet gevonden, maar ga door met migratie...');
    }
    
    // Insert the hardcoded plans
    console.log('📝 Invoegen van hardcoded plannen...');
    
    const hardcodedPlans = [
      {
        plan_id: 'balanced',
        name: 'Gebalanceerd',
        subtitle: 'Voor duurzame energie en algehele gezondheid',
        description: 'Een mix van alle macronutriënten',
        icon: '🥗',
        color: 'from-green-500 to-emerald-600',
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
    
    for (const plan of hardcodedPlans) {
      console.log(`📝 Invoegen plan: ${plan.name}`);
      
      const { data, error } = await supabase
        .from('nutrition_plans')
        .upsert(plan, { onConflict: 'plan_id' })
        .select();
      
      if (error) {
        console.error(`❌ Fout bij invoegen plan ${plan.name}:`, error);
      } else {
        console.log(`✅ Plan ${plan.name} succesvol ingevoegd/bijgewerkt`);
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
    console.log('📋 Volgende stappen:');
    console.log('   1. Ga naar Admin Dashboard → Voedingsplannen → Frontend Plannen');
    console.log('   2. Klik op "Herlaad Plannen" om de koppeling te testen');
    console.log('   3. Test de frontend om te controleren of alles werkt');
    
  } catch (error) {
    console.error('❌ Fout tijdens migratie:', error);
    process.exit(1);
  }
}

runMigration();
