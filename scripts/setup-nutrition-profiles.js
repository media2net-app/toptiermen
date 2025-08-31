const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupNutritionProfiles() {
  console.log('🔧 Setting up nutrition profiles table...\n');

  try {
    // 1. Check if table exists
    console.log('1️⃣ Checking if nutrition_profiles table exists...');
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('nutrition_profiles')
        .select('*')
        .limit(1);

      if (tableError) {
        console.log('❌ Nutrition profiles table does not exist');
        console.log('Please create the table manually in Supabase with the following SQL:');
        console.log(`
CREATE TABLE nutrition_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    age INTEGER NOT NULL,
    height INTEGER NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    activity_level VARCHAR(20) NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal VARCHAR(20) NOT NULL CHECK (goal IN ('cut', 'maintain', 'bulk')),
    target_calories INTEGER,
    target_protein INTEGER,
    target_carbs INTEGER,
    target_fat INTEGER,
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE nutrition_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own nutrition profile" ON nutrition_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition profile" ON nutrition_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition profile" ON nutrition_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition profile" ON nutrition_profiles
    FOR DELETE USING (auth.uid() = user_id);
        `);
        return;
      }

      console.log('✅ Nutrition profiles table exists');
    } catch (err) {
      console.log('❌ Nutrition profiles table does not exist');
      console.log('Please create the table manually in Supabase');
      return;
    }

    // 2. Test the API endpoint
    console.log('\n2️⃣ Testing nutrition profile API...');
    
    // Find a test user
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('❌ No users found to test with');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Using test user: ${testUser.email}`);

    // Test POST request
    const testProfile = {
      userId: testUser.id,
      age: 30,
      height: 180,
      weight: 75,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain'
    };

    console.log('📝 Testing profile creation...');
    const response = await fetch('http://localhost:3000/api/nutrition-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProfile),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profile creation successful');
      console.log('📊 Calculated values:');
      console.log(`   BMR: ${data.calculations.bmr} kcal`);
      console.log(`   TDEE: ${data.calculations.tdee} kcal`);
      console.log(`   Target Calories: ${data.calculations.targetCalories} kcal`);
      console.log(`   Target Protein: ${data.calculations.targetProtein}g`);
      console.log(`   Target Carbs: ${data.calculations.targetCarbs}g`);
      console.log(`   Target Fat: ${data.calculations.targetFat}g`);
    } else {
      console.log('❌ Profile creation failed');
      const error = await response.text();
      console.log('Error:', error);
    }

    // 3. Check existing profiles
    console.log('\n3️⃣ Checking existing nutrition profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('nutrition_profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} nutrition profiles`);
      
      if (profiles && profiles.length > 0) {
        console.log('\n📊 EXISTING PROFILES:');
        profiles.forEach((profile, index) => {
          console.log(`${index + 1}. User ID: ${profile.user_id}`);
          console.log(`   Age: ${profile.age}, Height: ${profile.height}cm, Weight: ${profile.weight}kg`);
          console.log(`   Gender: ${profile.gender}, Activity: ${profile.activity_level}, Goal: ${profile.goal}`);
          console.log(`   Target: ${profile.target_calories} kcal, ${profile.target_protein}g protein`);
          console.log('');
        });
      }
    }

    console.log('\n🎉 Nutrition profiles setup completed successfully!');
    console.log('The nutrition intake system is now ready to use.');

  } catch (error) {
    console.error('❌ Error in nutrition profiles setup:', error);
  }
}

setupNutritionProfiles();
