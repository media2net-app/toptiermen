require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAmandelenName() {
  try {
    console.log('🔍 Looking for "Amandelen test" in nutrition_ingredients...\n');

    // Find the item with name "Amandelen test"
    const { data: items, error: searchError } = await supabase
      .from('nutrition_ingredients')
      .select('*')
      .eq('name', 'Amandelen test');

    if (searchError) {
      console.error('❌ Error searching for item:', searchError);
      return;
    }

    if (!items || items.length === 0) {
      console.log('❌ No item found with name "Amandelen test"');
      return;
    }

    const item = items[0];
    console.log(`✅ Found item: ${item.name} (ID: ${item.id})`);
    console.log(`   Category: ${item.category}`);
    console.log(`   Calories: ${item.calories_per_100g}`);
    console.log(`   Protein: ${item.protein_per_100g}g`);
    console.log(`   Carbs: ${item.carbs_per_100g}g`);
    console.log(`   Fat: ${item.fat_per_100g}g\n`);

    // Update the name to "Amandelen"
    const { data: updatedItem, error: updateError } = await supabase
      .from('nutrition_ingredients')
      .update({
        name: 'Amandelen',
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating item:', updateError);
      return;
    }

    console.log('✅ Successfully updated item:');
    console.log(`   Old name: ${item.name}`);
    console.log(`   New name: ${updatedItem.name}`);
    console.log(`   Updated at: ${updatedItem.updated_at}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAmandelenName();
