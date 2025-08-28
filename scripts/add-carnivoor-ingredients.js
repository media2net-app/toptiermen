const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addMissingNutritionIngredients() {
  console.log('🥩 Adding missing nutrition ingredients for carnivoor and other plans...');
  
  const missingIngredients = [
    // Carnivoor-specifieke vleessoorten
    {
      name: 'Rundergehakt (15% vet)',
      category: 'Vlees',
      calories_per_100g: 250,
      protein_per_100g: 26,
      carbs_per_100g: 0,
      fat_per_100g: 15,
      description: 'Gebruikt voor hamburgers en gehaktballen'
    },
    {
      name: 'Rundergehakt (5% vet)',
      category: 'Vlees', 
      calories_per_100g: 180,
      protein_per_100g: 26,
      carbs_per_100g: 0,
      fat_per_100g: 5,
      description: 'Mager gehakt voor gezonde maaltijden'
    },
    {
      name: 'Ribeye Steak',
      category: 'Vlees',
      calories_per_100g: 280,
      protein_per_100g: 25,
      carbs_per_100g: 0,
      fat_per_100g: 20,
      description: 'Malse ribeye steak met marmering'
    },
    {
      name: 'T-Bone Steak',
      category: 'Vlees',
      calories_per_100g: 250,
      protein_per_100g: 26,
      carbs_per_100g: 0,
      fat_per_100g: 15,
      description: 'Klassieke T-bone steak'
    },
    {
      name: 'Lamsvlees',
      category: 'Vlees',
      calories_per_100g: 200,
      protein_per_100g: 25,
      carbs_per_100g: 0,
      fat_per_100g: 10,
      description: 'Mager lamsvlees'
    },
    {
      name: 'Varkenshaas',
      category: 'Vlees',
      calories_per_100g: 140,
      protein_per_100g: 26,
      carbs_per_100g: 0,
      fat_per_100g: 3,
      description: 'Mager varkensvlees'
    },
    {
      name: 'Kippendijen',
      category: 'Vlees',
      calories_per_100g: 180,
      protein_per_100g: 24,
      carbs_per_100g: 0,
      fat_per_100g: 8,
      description: 'Kippendijen met vel'
    },
    {
      name: 'Kalkoenborst',
      category: 'Vlees',
      calories_per_100g: 120,
      protein_per_100g: 28,
      carbs_per_100g: 0,
      fat_per_100g: 1,
      description: 'Mager kalkoenborstvlees'
    },
    {
      name: 'Eendenborst',
      category: 'Vlees',
      calories_per_100g: 200,
      protein_per_100g: 25,
      carbs_per_100g: 0,
      fat_per_100g: 10,
      description: 'Rijke eendenborst'
    },
    {
      name: 'Gans',
      category: 'Vlees',
      calories_per_100g: 250,
      protein_per_100g: 25,
      carbs_per_100g: 0,
      fat_per_100g: 15,
      description: 'Traditionele gans'
    },
    {
      name: 'Orgaanvlees (Lever)',
      category: 'Vlees',
      calories_per_100g: 130,
      protein_per_100g: 20,
      carbs_per_100g: 3,
      fat_per_100g: 4,
      description: 'Voedzame runderlever'
    },
    {
      name: 'Orgaanvlees (Hart)',
      category: 'Vlees',
      calories_per_100g: 110,
      protein_per_100g: 18,
      carbs_per_100g: 0,
      fat_per_100g: 4,
      description: 'Runderhart'
    },
    {
      name: 'Orgaanvlees (Nieren)',
      category: 'Vlees',
      calories_per_100g: 100,
      protein_per_100g: 17,
      carbs_per_100g: 0,
      fat_per_100g: 3,
      description: 'Rundernieren'
    },
    {
      name: 'Spek',
      category: 'Vlees',
      calories_per_100g: 400,
      protein_per_100g: 15,
      carbs_per_100g: 0,
      fat_per_100g: 40,
      description: 'Traditioneel spek'
    },
    {
      name: 'Worst',
      category: 'Vlees',
      calories_per_100g: 300,
      protein_per_100g: 20,
      carbs_per_100g: 0,
      fat_per_100g: 25,
      description: 'Traditionele worst'
    },
    {
      name: 'Salami',
      category: 'Vlees',
      calories_per_100g: 350,
      protein_per_100g: 18,
      carbs_per_100g: 0,
      fat_per_100g: 30,
      description: 'Gedroogde salami'
    },
    {
      name: 'Ham',
      category: 'Vlees',
      calories_per_100g: 120,
      protein_per_100g: 22,
      carbs_per_100g: 0,
      fat_per_100g: 3,
      description: 'Mager ham'
    },
    {
      name: 'Kipfilet (Gegrild)',
      category: 'Vlees',
      calories_per_100g: 165,
      protein_per_100g: 31,
      carbs_per_100g: 0,
      fat_per_100g: 3.6,
      description: 'Gegrilde kipfilet'
    },
    {
      name: 'Kalkoenfilet (Gegrild)',
      category: 'Vlees',
      calories_per_100g: 135,
      protein_per_100g: 30,
      carbs_per_100g: 0,
      fat_per_100g: 1.5,
      description: 'Gegrilde kalkoenfilet'
    },
    {
      name: 'Rundergehakt (20% vet)',
      category: 'Vlees',
      calories_per_100g: 280,
      protein_per_100g: 25,
      carbs_per_100g: 0,
      fat_per_100g: 20,
      description: 'Gebruikt voor hamburgers'
    },
    // Vis voor carnivoor
    {
      name: 'Zalm (Wild)',
      category: 'Vis',
      calories_per_100g: 200,
      protein_per_100g: 25,
      carbs_per_100g: 0,
      fat_per_100g: 12,
      description: 'Wilde zalm rijk aan omega-3'
    },
    {
      name: 'Makreel',
      category: 'Vis',
      calories_per_100g: 220,
      protein_per_100g: 20,
      carbs_per_100g: 0,
      fat_per_100g: 15,
      description: 'Vette vis rijk aan omega-3'
    },
    {
      name: 'Haring',
      category: 'Vis',
      calories_per_100g: 200,
      protein_per_100g: 18,
      carbs_per_100g: 0,
      fat_per_100g: 15,
      description: 'Traditionele haring'
    },
    {
      name: 'Sardines',
      category: 'Vis',
      calories_per_100g: 180,
      protein_per_100g: 20,
      carbs_per_100g: 0,
      fat_per_100g: 10,
      description: 'Kleine vette vis'
    },
    {
      name: 'Ansjovis',
      category: 'Vis',
      calories_per_100g: 160,
      protein_per_100g: 20,
      carbs_per_100g: 0,
      fat_per_100g: 8,
      description: 'Gezouten ansjovis'
    },
    // Eieren voor carnivoor
    {
      name: 'Eigeel',
      category: 'Eiwitten',
      calories_per_100g: 320,
      protein_per_100g: 16,
      carbs_per_100g: 3,
      fat_per_100g: 27,
      description: 'Eigeel rijk aan vetten en vitamines'
    },
    {
      name: 'Eiwit',
      category: 'Eiwitten',
      calories_per_100g: 50,
      protein_per_100g: 11,
      carbs_per_100g: 0.7,
      fat_per_100g: 0.2,
      description: 'Pure eiwitten'
    },
    // Zuivel voor carnivoor
    {
      name: 'Volle Melk',
      category: 'Zuivel',
      calories_per_100g: 60,
      protein_per_100g: 3.2,
      carbs_per_100g: 4.8,
      fat_per_100g: 3.3,
      description: 'Volle melk met natuurlijke vetten'
    },
    {
      name: 'Volle Kwark',
      category: 'Zuivel',
      calories_per_100g: 120,
      protein_per_100g: 12,
      carbs_per_100g: 3.6,
      fat_per_100g: 5,
      description: 'Volle kwark met natuurlijke vetten'
    },
    {
      name: 'Volle Yoghurt',
      category: 'Zuivel',
      calories_per_100g: 80,
      protein_per_100g: 4,
      carbs_per_100g: 4,
      fat_per_100g: 5,
      description: 'Volle yoghurt met natuurlijke vetten'
    },
    {
      name: 'Roomkaas',
      category: 'Zuivel',
      calories_per_100g: 350,
      protein_per_100g: 6,
      carbs_per_100g: 4,
      fat_per_100g: 35,
      description: 'Rijke roomkaas'
    },
    {
      name: 'Boter',
      category: 'Vetten',
      calories_per_100g: 720,
      protein_per_100g: 0.9,
      carbs_per_100g: 0.1,
      fat_per_100g: 81,
      description: 'Echte boter van room'
    },
    {
      name: 'Ghee',
      category: 'Vetten',
      calories_per_100g: 900,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fat_per_100g: 100,
      description: 'Geklaarde boter'
    },
    {
      name: 'Reuzel',
      category: 'Vetten',
      calories_per_100g: 900,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fat_per_100g: 100,
      description: 'Varkensvet voor koken'
    },
    {
      name: 'Talow',
      category: 'Vetten',
      calories_per_100g: 900,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fat_per_100g: 100,
      description: 'Rundervet voor koken'
    },
    // Extra noten voor variatie
    {
      name: 'Pecannoten',
      category: 'Noten',
      calories_per_100g: 690,
      protein_per_100g: 9,
      carbs_per_100g: 14,
      fat_per_100g: 72,
      description: 'Rijke pecannoten'
    },
    {
      name: 'Macadamia Noten',
      category: 'Noten',
      calories_per_100g: 720,
      protein_per_100g: 8,
      carbs_per_100g: 14,
      fat_per_100g: 76,
      description: 'Rijke macadamia noten'
    },
    {
      name: 'Hazelnoten',
      category: 'Noten',
      calories_per_100g: 630,
      protein_per_100g: 15,
      carbs_per_100g: 17,
      fat_per_100g: 61,
      description: 'Gezonde hazelnoten'
    },
    {
      name: 'Pistachenoten',
      category: 'Noten',
      calories_per_100g: 560,
      protein_per_100g: 20,
      carbs_per_100g: 28,
      fat_per_100g: 45,
      description: 'Eiwitrijke pistachenoten'
    }
  ];
  
  try {
    console.log(`📝 Adding ${missingIngredients.length} missing ingredients...`);
    
    for (const ingredient of missingIngredients) {
      const { data, error } = await supabase
        .from('nutrition_ingredients')
        .insert(ingredient)
        .select();
      
      if (error) {
        console.log(`⚠️ Could not add ${ingredient.name}: ${error.message}`);
      } else {
        console.log(`✅ Added: ${ingredient.name} (${ingredient.category})`);
      }
    }
    
    // Check total count
    const { data: totalIngredients, error: countError } = await supabase
      .from('nutrition_ingredients')
      .select('*')
      .eq('is_active', true);
    
    if (!countError) {
      console.log(`\n🎉 Total nutrition ingredients: ${totalIngredients.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error adding ingredients:', error);
  }
}

addMissingNutritionIngredients();






