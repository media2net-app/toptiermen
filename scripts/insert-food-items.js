const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI1MDI1NSwiZXhwIjoyMDY1ODI2MjU1fQ.LOo6OJaQunCtZvY8oODK3DcrvYte45h2DC7Qf6ERJFo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertFoodItems() {
  console.log('🥗 Inserting food items with correct nutritional values...');
  
  try {
    // First, let's check if the table exists and is empty
    console.log('📋 Checking table status...');
    const { data: existingData, error: existingError } = await supabase
      .from('food_items')
      .select('count')
      .limit(1);
    
    if (existingError) {
      console.error('❌ Error checking table:', existingError);
      console.log('⚠️ Please make sure the food_items table exists first');
      return;
    }
    
    if (existingData && existingData.length > 0) {
      console.log('⚠️ Table already has data. Clearing existing data...');
      const { error: deleteError } = await supabase
        .from('food_items')
        .delete()
        .gte('id', 1);
      
      if (deleteError) {
        console.error('❌ Error clearing existing data:', deleteError);
        return;
      }
      console.log('✅ Existing data cleared');
    }
    
    // Insert food items with correct nutritional values
    console.log('📋 Inserting food items...');
    const foodItems = [
      { name: 'Havermout', category: 'Granen', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 1.0, sodium: 2.0, description: 'Volkoren havermout, rijk aan vezels en eiwitten' },
      { name: 'Whey eiwit Shakes', category: 'Eiwitten', calories: 120, protein: 25, carbs: 3, fat: 1.5, fiber: 0, sugar: 2.0, sodium: 50.0, description: 'Whey proteïne shake, snel opneembare eiwitten' },
      { name: 'Volkoren crackers', category: 'Granen', calories: 350, protein: 12, carbs: 65, fat: 8, fiber: 8.0, sugar: 2.0, sodium: 400.0, description: 'Volkoren crackers, rijk aan vezels' },
      { name: 'Rijstwafels', category: 'Granen', calories: 35, protein: 0.8, carbs: 7.5, fat: 0.2, fiber: 0.3, sugar: 0.1, sodium: 5.0, description: 'Lichte rijstwafels, weinig calorieën' },
      { name: 'Pindakaas', category: 'Vetten', calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 8.0, sugar: 9.0, sodium: 17.0, description: 'Natuurlijke pindakaas, rijk aan gezonde vetten' },
      { name: 'Volkoren en groenten wraps', category: 'Granen', calories: 280, protein: 10, carbs: 50, fat: 4, fiber: 6.0, sugar: 3.0, sodium: 450.0, description: 'Volkoren wraps met groenten' },
      { name: 'Blauwe bessen', category: 'Fruit', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10.0, sodium: 1.0, description: 'Antioxidantrijke blauwe bessen' },
      { name: 'Bananen', category: 'Fruit', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12.0, sodium: 1.0, description: 'Rijke bron van kalium en koolhydraten' },
      { name: 'Appels', category: 'Fruit', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10.0, sodium: 1.0, description: 'Vezelrijke appels' },
      { name: 'Melk', category: 'Zuivel', calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5.0, sodium: 44.0, description: 'Halfvolle melk, bron van calcium' },
      { name: 'Kipfilet plakjes', category: 'Vlees', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74.0, description: 'Mager kipfilet, hoog in eiwit' },
      { name: 'Kipfilet', category: 'Vlees', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74.0, description: 'Mager kipfilet, hoog in eiwit' },
      { name: 'Carpaccio', category: 'Vlees', calories: 250, protein: 25, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 60.0, description: 'Dungesneden rauw rundvlees' },
      { name: 'Blikjes tonijn olijfolie', category: 'Vis', calories: 200, protein: 30, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 400.0, description: 'Tonijn in olijfolie, rijk aan omega-3' },
      { name: 'Salades', category: 'Groente', calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2.0, sugar: 2.0, sodium: 20.0, description: 'Verse groentesalade' },
      { name: 'Eieren', category: 'Zuivel', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124.0, description: 'Gekookte eieren, complete eiwitbron' },
      { name: 'Kaas', category: 'Zuivel', calories: 400, protein: 25, carbs: 1, fat: 33, fiber: 0, sugar: 1.0, sodium: 621.0, description: 'Geraspte kaas, rijk aan calcium' },
      { name: 'Krentenbol', category: 'Granen', calories: 280, protein: 8, carbs: 55, fat: 3, fiber: 3.0, sugar: 15.0, sodium: 300.0, description: 'Traditionele krentenbol' },
      { name: 'Koolhydraten arm brood', category: 'Granen', calories: 200, protein: 12, carbs: 25, fat: 8, fiber: 8.0, sugar: 2.0, sodium: 400.0, description: 'Koolhydraatarm brood' },
      { name: 'Basmati Rijst', category: 'Granen', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1.0, description: 'Aromatische basmati rijst' },
      { name: 'Volkoren pasta', category: 'Granen', calories: 124, protein: 5, carbs: 25, fat: 1.1, fiber: 3.2, sugar: 0.5, sodium: 1.0, description: 'Volkoren pasta, rijk aan vezels' },
      { name: 'Noodles', category: 'Granen', calories: 110, protein: 4, carbs: 22, fat: 0.5, fiber: 1.0, sugar: 0.5, sodium: 200.0, description: 'Aziatische noodles' },
      { name: 'Spaghetti', category: 'Granen', calories: 124, protein: 5, carbs: 25, fat: 1.1, fiber: 2.5, sugar: 0.5, sodium: 1.0, description: 'Klassieke spaghetti' },
      { name: 'Macaroni', category: 'Granen', calories: 124, protein: 5, carbs: 25, fat: 1.1, fiber: 2.5, sugar: 0.5, sodium: 1.0, description: 'Korte pasta macaroni' },
      { name: 'Zoete aardappel', category: 'Groente', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3.0, sugar: 4.2, sodium: 55.0, description: 'Zoete aardappel, rijk aan vitamine A' },
      { name: 'Witte aardappel', category: 'Groente', calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6.0, description: 'Gekookte witte aardappel' },
      { name: 'Witvis', category: 'Vis', calories: 100, protein: 20, carbs: 0, fat: 2, fiber: 0, sugar: 0, sodium: 78.0, description: 'Mager witvis, hoog in eiwit' },
      { name: 'Mager rundergehakt', category: 'Vlees', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 72.0, description: 'Mager rundergehakt, 5% vet' },
      { name: 'Biefstuk', category: 'Vlees', calories: 271, protein: 26, carbs: 0, fat: 18, fiber: 0, sugar: 0, sodium: 54.0, description: 'Gegrilde biefstuk' },
      { name: 'Kip', category: 'Vlees', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74.0, description: 'Gegrilde kipfilet' },
      { name: 'Kalkoenfilet', category: 'Vlees', calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 70.0, description: 'Mager kalkoenfilet' },
      { name: 'Tartaar', category: 'Vlees', calories: 250, protein: 25, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 60.0, description: 'Rauw gehakt rundvlees' },
      { name: 'Duitse biefstuk', category: 'Vlees', calories: 271, protein: 26, carbs: 0, fat: 18, fiber: 0, sugar: 0, sodium: 54.0, description: 'Duitse biefstuk' },
      { name: 'Magere kwark', category: 'Zuivel', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 364.0, description: 'Magere kwark, hoog in eiwit' },
      { name: 'Skyr', category: 'Zuivel', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 364.0, description: 'IJslandse skyr, dikke yoghurt' },
      { name: 'Walnoten', category: 'Noten', calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, sugar: 2.6, sodium: 2.0, description: 'Walnoten, rijk aan omega-3' },
      { name: 'Amandelen', category: 'Noten', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, sugar: 4.8, sodium: 1.0, description: 'Amandelen, rijk aan vitamine E' },
      { name: 'Halfvolle kwark', category: 'Zuivel', calories: 80, protein: 12, carbs: 4, fat: 2, fiber: 0, sugar: 4.0, sodium: 364.0, description: 'Halfvolle kwark' }
    ];
    
    const { data: insertData, error: insertError } = await supabase
      .from('food_items')
      .insert(foodItems)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting food items:', insertError);
      console.log('⚠️ Please make sure the table exists and RLS is disabled');
    } else {
      console.log('✅ Food items inserted successfully:', insertData?.length || 0, 'items');
      console.log('📋 Sample items:');
      insertData?.slice(0, 3).forEach(item => {
        console.log(`  - ${item.name}: ${item.calories} cal, ${item.protein}g protein, ${item.carbs}g carbs, ${item.fat}g fat`);
      });
    }
    
  } catch (err) {
    console.error('❌ Exception during food items insertion:', err);
  }
}

insertFoodItems();
