require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNutritionItems() {
  try {
    console.log('🔍 Checking nutrition_ingredients table...\n');

    // Get all items
    const { data: items, error } = await supabase
      .from('nutrition_ingredients')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Error fetching items:', error);
      return;
    }

    console.log(`✅ Found ${items?.length || 0} nutrition items:\n`);

    // Show first 10 items
    items?.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.category})`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Calories: ${item.calories_per_100g}`);
      console.log(`   Protein: ${item.protein_per_100g}g`);
      console.log(`   Carbs: ${item.carbs_per_100g}g`);
      console.log(`   Fat: ${item.fat_per_100g}g`);
      console.log(`   Active: ${item.is_active}`);
      console.log(`   Updated: ${item.updated_at}`);
      console.log('');
    });

    // Check for items with "amandelen" in the name (case insensitive)
    const amandelenItems = items?.filter(item => 
      item.name.toLowerCase().includes('amandelen')
    );

    if (amandelenItems && amandelenItems.length > 0) {
      console.log('🔍 Items with "amandelen" in the name:');
      amandelenItems.forEach(item => {
        console.log(`   - ${item.name} (ID: ${item.id})`);
      });
    } else {
      console.log('❌ No items found with "amandelen" in the name');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkNutritionItems();
