const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNutritionProfilesTable() {
  console.log('🔧 Creating nutrition_profiles table...\n');

  try {
    // First, let's check if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('nutrition_profiles')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ nutrition_profiles table already exists');
      return true;
    }

    console.log('❌ Table does not exist, you need to create it manually in Supabase Dashboard');
    console.log('\n📋 Please run this SQL in Supabase Dashboard > SQL Editor:');
    console.log(`
-- Create nutrition profiles table
CREATE TABLE IF NOT EXISTS nutrition_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    age INTEGER NOT NULL,
    height INTEGER NOT NULL, -- in cm
    weight DECIMAL(5,2) NOT NULL, -- in kg
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    activity_level VARCHAR(20) NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal VARCHAR(20) NOT NULL CHECK (goal IN ('droogtrainen', 'onderhoud', 'spiermassa', 'cut', 'maintain', 'bulk')),
    target_calories INTEGER,
    target_protein INTEGER,
    target_carbs INTEGER,
    target_fat INTEGER,
    bmr DECIMAL(8,2), -- Basal Metabolic Rate
    tdee DECIMAL(8,2), -- Total Daily Energy Expenditure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_user_id ON nutrition_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_created_at ON nutrition_profiles(created_at);

-- Enable Row Level Security
ALTER TABLE nutrition_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own nutrition profile" ON nutrition_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition profile" ON nutrition_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition profile" ON nutrition_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition profile" ON nutrition_profiles
    FOR DELETE USING (auth.uid() = user_id);
    `);
    
    return false;

  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
}

async function testNutritionProfileAPI() {
  console.log('\n🧪 Testing nutrition profile API...');

  try {
    // Test with a real user ID (chiel@media2net.nl)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users || users.users.length === 0) {
      console.log('❌ No users found for testing');
      return;
    }

    const testUser = users.users.find(u => u.email === 'chiel@media2net.nl');
    if (!testUser) {
      console.log('❌ chiel@media2net.nl not found');
      return;
    }

    console.log('✅ Found test user:', testUser.email);

    // Test profile creation
    const testProfile = {
      userId: testUser.id,
      age: 30,
      height: 180,
      weight: 90,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'onderhoud'
    };

    const { data: profile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .upsert({
        user_id: testProfile.userId,
        age: testProfile.age,
        height: testProfile.height,
        weight: testProfile.weight,
        gender: testProfile.gender,
        activity_level: testProfile.activityLevel,
        goal: testProfile.goal,
        target_calories: 2574, // 90 * 22 * 1.3
        target_protein: 0,
        target_carbs: 0,
        target_fat: 0,
        bmr: 0,
        tdee: 0
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating test profile:', profileError);
      return;
    }

    console.log('✅ Test profile created successfully:', profile);

  } catch (err) {
    console.error('❌ Error testing API:', err);
  }
}

async function main() {
  console.log('🚀 Setting up nutrition_profiles table...\n');

  const success = await createNutritionProfilesTable();
  
  if (success) {
    await testNutritionProfileAPI();
  }

  console.log('\n✨ Setup complete!');
}

main().catch(console.error);
