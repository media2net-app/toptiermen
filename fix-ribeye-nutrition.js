const { createClient } = require('@supabase/supabase-js');

// We'll use local curl to fix this
console.log('🔧 Fixing Ribeye Steak nutritional values...');

// Ribeye Steak nutritional values per 100g
const ribeye = {
  name: "Ribeye Steak",
  category: "Vlees",
  calories_per_100g: 291,
  protein_per_100g: 25,
  carbs_per_100g: 0,
  fat_per_100g: 20.8,
  description: "Premium rundvlees ribeye steak",
  is_active: true
};

console.log('📊 Ribeye nutrition data:', ribeye);
console.log('✅ Use this data to update the food item in the admin interface');
