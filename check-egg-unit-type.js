require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEggUnitType() {
  console.log('🥚 Checking egg unit_type in database...');
  console.log('');

  try {
    // Find all ingredients with "ei" in the name
    const { data: eggIngredients, error: fetchError } = await supabase
      .from('nutrition_ingredients')
      .select('id, name, category, unit_type')
      .ilike('name', '%ei%');

    if (fetchError) {
      console.error('❌ Error fetching egg ingredients:', fetchError);
      return;
    }

    console.log('🔍 Found ingredients with "ei" in name:');
    eggIngredients?.forEach((ingredient, index) => {
      console.log(`${index + 1}. "${ingredient.name}"`);
      console.log(`   Category: ${ingredient.category}`);
      console.log(`   Unit Type: ${ingredient.unit_type || 'NULL'}`);
      console.log('');
    });

    // Specifically check for exact "Ei" match
    const { data: exactEgg, error: exactError } = await supabase
      .from('nutrition_ingredients')
      .select('id, name, category, unit_type')
      .eq('name', 'Ei');

    if (exactError) {
      console.error('❌ Error fetching exact "Ei":', exactError);
      return;
    }

    if (exactEgg && exactEgg.length > 0) {
      console.log('🎯 Exact match for "Ei":');
      exactEgg.forEach((egg) => {
        console.log(`   Name: "${egg.name}"`);
        console.log(`   Category: ${egg.category}`);
        console.log(`   Unit Type: ${egg.unit_type || 'NULL'}`);
      });
    } else {
      console.log('❌ No exact match for "Ei" found');
    }

    console.log('');
    console.log('💡 Expected: unit_type should be "per_piece" for eggs');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkEggUnitType();
