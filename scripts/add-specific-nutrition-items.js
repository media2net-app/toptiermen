require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const specificItems = [
  {
    name: "1 Ei",
    category: "eieren",
    calories_per_100g: 155,
    protein_per_100g: 12.5,
    carbs_per_100g: 1.1,
    fat_per_100g: 11.2,
    description: "1 gekookt ei (50g) - Perfecte bron van eiwitten en gezonde vetten",
    is_active: true
  },
  {
    name: "1 Appel",
    category: "fruit",
    calories_per_100g: 52,
    protein_per_100g: 0.3,
    carbs_per_100g: 14,
    fat_per_100g: 0.2,
    description: "1 middelgrote appel (182g) - Rijk aan vezels en vitamine C",
    is_active: true
  },
  {
    name: "1 Banaan",
    category: "fruit",
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
    description: "1 middelgrote banaan (118g) - Goede bron van kalium en natuurlijke suikers",
    is_active: true
  },
  {
    name: "1 Handje Amandelen",
    category: "noten",
    calories_per_100g: 579,
    protein_per_100g: 21.2,
    carbs_per_100g: 21.7,
    fat_per_100g: 49.9,
    description: "1 handje amandelen (28g) - Rijk aan gezonde vetten en vitamine E",
    is_active: true
  },
  {
    name: "1 Handje Walnoten",
    category: "noten",
    calories_per_100g: 654,
    protein_per_100g: 15.2,
    carbs_per_100g: 13.7,
    fat_per_100g: 65.2,
    description: "1 handje walnoten (28g) - Rijk aan omega-3 vetzuren",
    is_active: true
  },
  {
    name: "1 Handje Cashewnoten",
    category: "noten",
    calories_per_100g: 553,
    protein_per_100g: 18.2,
    carbs_per_100g: 30.2,
    fat_per_100g: 43.8,
    description: "1 handje cashewnoten (28g) - Goede bron van magnesium en zink",
    is_active: true
  },
  {
    name: "1 Handje Pistachenoten",
    category: "noten",
    calories_per_100g: 560,
    protein_per_100g: 20.2,
    carbs_per_100g: 27.2,
    fat_per_100g: 45.3,
    description: "1 handje pistachenoten (28g) - Rijk aan eiwitten en vezels",
    is_active: true
  },
  {
    name: "1 Handje Hazelnoten",
    category: "noten",
    calories_per_100g: 628,
    protein_per_100g: 15,
    carbs_per_100g: 16.7,
    fat_per_100g: 60.8,
    description: "1 handje hazelnoten (28g) - Rijk aan vitamine E en foliumzuur",
    is_active: true
  },
  {
    name: "1 Handje Pecannoten",
    category: "noten",
    calories_per_100g: 691,
    protein_per_100g: 9.2,
    carbs_per_100g: 13.9,
    fat_per_100g: 72,
    description: "1 handje pecannoten (28g) - Rijk aan gezonde vetten en antioxidanten",
    is_active: true
  },
  {
    name: "1 Handje Macadamia Noten",
    category: "noten",
    calories_per_100g: 718,
    protein_per_100g: 7.9,
    carbs_per_100g: 13.8,
    fat_per_100g: 75.8,
    description: "1 handje macadamia noten (28g) - Rijkste noten in gezonde vetten",
    is_active: true
  }
];

async function addSpecificNutritionItems() {
  try {
    console.log('🥗 Adding specific nutrition items to database...\n');

    // Check existing items first
    console.log('📋 Checking existing items...');
    const { data: existingItems, error: fetchError } = await supabase
      .from('nutrition_ingredients')
      .select('name')
      .in('name', specificItems.map(item => item.name));

    if (fetchError) {
      console.error('❌ Error fetching existing items:', fetchError);
      return;
    }

    const existingNames = existingItems.map(item => item.name);
    console.log(`📊 Found ${existingNames.length} existing items:`, existingNames);

    // Filter out items that already exist
    const itemsToAdd = specificItems.filter(item => !existingNames.includes(item.name));
    
    if (itemsToAdd.length === 0) {
      console.log('✅ All items already exist in database');
      return;
    }

    console.log(`📝 Adding ${itemsToAdd.length} new items...`);

    // Add items in batches
    const batchSize = 5;
    for (let i = 0; i < itemsToAdd.length; i += batchSize) {
      const batch = itemsToAdd.slice(i, i + batchSize);
      
      console.log(`\n📦 Adding batch ${Math.floor(i / batchSize) + 1}:`);
      batch.forEach(item => console.log(`   - ${item.name}`));

      const { data: insertedItems, error: insertError } = await supabase
        .from('nutrition_ingredients')
        .insert(batch)
        .select();

      if (insertError) {
        console.error('❌ Error inserting batch:', insertError);
        continue;
      }

      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} added successfully`);
    }

    // Verify all items were added
    console.log('\n🔍 Verifying all items...');
    const { data: allItems, error: verifyError } = await supabase
      .from('nutrition_ingredients')
      .select('name, category')
      .in('name', specificItems.map(item => item.name))
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying items:', verifyError);
      return;
    }

    console.log('\n✅ Successfully added nutrition items:');
    console.log('=====================================');
    
    allItems.forEach(item => {
      console.log(`📦 ${item.name} (${item.category})`);
    });

    console.log(`\n🎯 Summary:`);
    console.log(`- Total items: ${allItems.length}`);
    console.log(`- Categories: ${[...new Set(allItems.map(item => item.category))].join(', ')}`);
    console.log(`- Items per category:`);
    
    const categoryCount = {};
    allItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  • ${category}: ${count} items`);
    });

    console.log('\n💡 These items are now available in the nutrition plans admin!');

  } catch (error) {
    console.error('❌ Error adding nutrition items:', error);
  }
}

addSpecificNutritionItems();
