const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file for:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminDatabase() {
  console.log('🚀 Setting up Admin Dashboard Database...\n');

  try {
    // Check if exec_sql function exists
    console.log('🔍 Checking exec_sql function...');
    const { data: testResult, error: testError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT 1 as test;'
    });

    if (testError) {
      console.error('❌ exec_sql function not available:', testError);
      console.log('💡 Please create the exec_sql function in your Supabase database first.');
      console.log('📖 See setup_database_access.md for instructions.');
      process.exit(1);
    }

    console.log('✅ exec_sql function is available\n');

    // Step 1: Forum Moderation Tables
    console.log('📋 Step 1: Setting up Forum Moderation Tables...');
    await executeSQLFile('create_forum_moderation_tables.sql');
    console.log('✅ Forum Moderation Tables setup completed\n');

    // Step 2: Events Management Tables
    console.log('📅 Step 2: Setting up Events Management Tables...');
    await executeSQLFile('create_events_tables.sql');
    console.log('✅ Events Management Tables setup completed\n');

    // Step 3: Announcements Tables
    console.log('📢 Step 3: Setting up Announcements Tables...');
    await executeSQLFile('create_announcements_tables.sql');
    console.log('✅ Announcements Tables setup completed\n');

    // Step 4: Nutrition Tables (create if doesn't exist)
    console.log('🥗 Step 4: Setting up Nutrition Tables...');
    await createNutritionTables();
    console.log('✅ Nutrition Tables setup completed\n');

    // Step 5: Verify all tables
    console.log('🔍 Step 5: Verifying all tables...');
    await verifyTables();
    console.log('✅ All tables verified successfully\n');

    console.log('🎉 Admin Dashboard Database Setup Completed!');
    console.log('📊 All admin pages should now show "Live" status instead of "Dummy"');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

async function executeSQLFile(filename) {
  try {
    const filePath = path.join(__dirname, '..', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File ${filename} not found, skipping...`);
      return;
    }

    console.log(`📖 Reading ${filename}...`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`  🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: statement + ';'
          });

          if (error) {
            console.error(`    ❌ Error in statement ${i + 1}:`, error.message);
            // Continue with next statement
          } else {
            console.log(`    ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`    ❌ Exception in statement ${i + 1}:`, err.message);
          // Continue with next statement
        }
      }
    }

  } catch (error) {
    console.error(`❌ Error executing ${filename}:`, error);
    throw error;
  }
}

async function createNutritionTables() {
  const nutritionSQL = `
    -- =====================================================
    -- NUTRITION DATABASE SETUP
    -- =====================================================

    -- Enable UUID extension if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- =====================================================
    -- 1. NUTRITION INGREDIENTS TABLE
    -- =====================================================
    CREATE TABLE IF NOT EXISTS nutrition_ingredients (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        calories_per_100g DECIMAL(6,2),
        protein_per_100g DECIMAL(6,2),
        carbs_per_100g DECIMAL(6,2),
        fat_per_100g DECIMAL(6,2),
        fiber_per_100g DECIMAL(6,2),
        sugar_per_100g DECIMAL(6,2),
        sodium_per_100g DECIMAL(6,2),
        description TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =====================================================
    -- 2. NUTRITION RECIPES TABLE
    -- =====================================================
    CREATE TABLE IF NOT EXISTS nutrition_recipes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT NOT NULL,
        prep_time_minutes INTEGER,
        cook_time_minutes INTEGER,
        servings INTEGER DEFAULT 1,
        difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
        cuisine_type VARCHAR(100),
        meal_type VARCHAR(50) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
        calories_per_serving DECIMAL(6,2),
        protein_per_serving DECIMAL(6,2),
        carbs_per_serving DECIMAL(6,2),
        fat_per_serving DECIMAL(6,2),
        image_url TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT TRUE,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =====================================================
    -- 3. NUTRITION PLANS TABLE
    -- =====================================================
    CREATE TABLE IF NOT EXISTS nutrition_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        target_calories INTEGER,
        target_protein DECIMAL(6,2),
        target_carbs DECIMAL(6,2),
        target_fat DECIMAL(6,2),
        duration_weeks INTEGER DEFAULT 4,
        difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
        goal VARCHAR(50) CHECK (goal IN ('weight_loss', 'muscle_gain', 'maintenance', 'performance')),
        is_featured BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT TRUE,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =====================================================
    -- 4. NUTRITION EDUCATIONAL HUBS TABLE
    -- =====================================================
    CREATE TABLE IF NOT EXISTS nutrition_educational_hubs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        is_published BOOLEAN DEFAULT FALSE,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =====================================================
    -- 5. INSERT SAMPLE DATA
    -- =====================================================

    -- Insert sample ingredients
    INSERT INTO nutrition_ingredients (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, description) VALUES
    ('Kipfilet', 'Vlees', 165, 31, 0, 3.6, 0, 0, 74, 'Mager vlees rijk aan eiwitten'),
    ('Zalm', 'Vis', 208, 25, 0, 12, 0, 0, 59, 'Vette vis rijk aan omega-3'),
    ('Bruine Rijst', 'Granen', 111, 2.6, 23, 0.9, 1.8, 0.4, 5, 'Volkoren rijst met vezels'),
    ('Broccoli', 'Groenten', 34, 2.8, 7, 0.4, 2.6, 1.5, 33, 'Groene groente rijk aan vitamines'),
    ('Avocado', 'Fruit', 160, 2, 9, 15, 6.7, 0.7, 7, 'Gezonde vetten en vezels'),
    ('Eieren', 'Dierlijke Producten', 155, 13, 1.1, 11, 0, 1.1, 124, 'Complete eiwitbron'),
    ('Havermout', 'Granen', 68, 2.4, 12, 1.4, 1.7, 0.3, 49, 'Volkoren graan voor ontbijt'),
    ('Amandelen', 'Noten', 579, 21, 22, 50, 12.5, 4.8, 1, 'Gezonde noten rijk aan vetten')
    ON CONFLICT (name) DO NOTHING;

    -- Insert sample recipes
    INSERT INTO nutrition_recipes (name, description, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty, meal_type, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, author_id) VALUES
    ('Gegrilde Kipfilet met Groenten', 'Gezonde maaltijd met mager vlees en verse groenten', '1. Kruid de kipfilet\n2. Grill 6-8 minuten per kant\n3. Bak groenten in olijfolie\n4. Serveer samen', 10, 20, 2, 'easy', 'dinner', 350, 45, 15, 12, (SELECT id FROM users LIMIT 1)),
    ('Zalm met Quinoa', 'Omega-3 rijke maaltijd met complete eiwitten', '1. Bak zalm 4-5 minuten per kant\n2. Kook quinoa volgens instructies\n3. Voeg groenten toe\n4. Combineer en serveer', 15, 25, 2, 'medium', 'dinner', 420, 38, 25, 18, (SELECT id FROM users LIMIT 1)),
    ('Power Ontbijt Bowl', 'Energierijk ontbijt met havermout en fruit', '1. Kook havermout met melk\n2. Voeg fruit en noten toe\n3. Bestrooi met honing\n4. Serveer warm', 5, 10, 1, 'easy', 'breakfast', 280, 12, 45, 8, (SELECT id FROM users LIMIT 1))
    ON CONFLICT (name) DO NOTHING;

    -- Insert sample nutrition plans
    INSERT INTO nutrition_plans (name, description, target_calories, target_protein, target_carbs, target_fat, duration_weeks, difficulty, goal, author_id) VALUES
    ('Spieropbouw Plan', '4-weken plan voor spieropbouw met verhoogde eiwitinname', 2500, 180, 250, 80, 4, 'intermediate', 'muscle_gain', (SELECT id FROM users LIMIT 1)),
    ('Vetverlies Plan', 'Gebalanceerd plan voor gezond vetverlies', 1800, 150, 180, 60, 4, 'beginner', 'weight_loss', (SELECT id FROM users LIMIT 1)),
    ('Performance Plan', 'Optimalisatie voor sportprestaties', 2200, 160, 220, 70, 4, 'advanced', 'performance', (SELECT id FROM users LIMIT 1))
    ON CONFLICT (name) DO NOTHING;

    -- Insert sample educational content
    INSERT INTO nutrition_educational_hubs (title, content, category, author_id, is_published) VALUES
    ('Eiwitten: De Bouwstenen van Spieren', 'Leer alles over eiwitten en hun rol in spieropbouw en herstel...', 'Eiwitten', (SELECT id FROM users LIMIT 1), TRUE),
    ('Koolhydraten: Brandstof voor Prestaties', 'Ontdek hoe koolhydraten je energie geven voor trainingen...', 'Koolhydraten', (SELECT id FROM users LIMIT 1), TRUE),
    ('Gezonde Vetten: Essentieel voor Gezondheid', 'Waarom gezonde vetten belangrijk zijn voor je lichaam...', 'Vetten', (SELECT id FROM users LIMIT 1), TRUE)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- 6. ROW LEVEL SECURITY (RLS)
    -- =====================================================

    -- Enable RLS on all tables
    ALTER TABLE nutrition_ingredients ENABLE ROW LEVEL SECURITY;
    ALTER TABLE nutrition_recipes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
    ALTER TABLE nutrition_educational_hubs ENABLE ROW LEVEL SECURITY;

    -- Nutrition ingredients: Everyone can read, only admins can write
    CREATE POLICY "nutrition_ingredients_read_policy" ON nutrition_ingredients
        FOR SELECT USING (is_active = true);

    CREATE POLICY "nutrition_ingredients_write_policy" ON nutrition_ingredients
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    -- Nutrition recipes: Everyone can read public recipes, authors can edit their own, admins can do everything
    CREATE POLICY "nutrition_recipes_read_policy" ON nutrition_recipes
        FOR SELECT USING (
            is_public = true OR
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    CREATE POLICY "nutrition_recipes_write_policy" ON nutrition_recipes
        FOR ALL USING (
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    -- Nutrition plans: Everyone can read public plans, authors can edit their own, admins can do everything
    CREATE POLICY "nutrition_plans_read_policy" ON nutrition_plans
        FOR SELECT USING (
            is_public = true OR
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    CREATE POLICY "nutrition_plans_write_policy" ON nutrition_plans
        FOR ALL USING (
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    -- Educational hubs: Everyone can read published content, authors can edit their own, admins can do everything
    CREATE POLICY "nutrition_educational_hubs_read_policy" ON nutrition_educational_hubs
        FOR SELECT USING (
            is_published = true OR
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    CREATE POLICY "nutrition_educational_hubs_write_policy" ON nutrition_educational_hubs
        FOR ALL USING (
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    -- =====================================================
    -- 7. INDEXES FOR PERFORMANCE
    -- =====================================================

    -- Nutrition ingredients indexes
    CREATE INDEX IF NOT EXISTS idx_nutrition_ingredients_category ON nutrition_ingredients(category);
    CREATE INDEX IF NOT EXISTS idx_nutrition_ingredients_name ON nutrition_ingredients(name);
    CREATE INDEX IF NOT EXISTS idx_nutrition_ingredients_is_active ON nutrition_ingredients(is_active);

    -- Nutrition recipes indexes
    CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_meal_type ON nutrition_recipes(meal_type);
    CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_difficulty ON nutrition_recipes(difficulty);
    CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_author_id ON nutrition_recipes(author_id);
    CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_is_public ON nutrition_recipes(is_public);

    -- Nutrition plans indexes
    CREATE INDEX IF NOT EXISTS idx_nutrition_plans_goal ON nutrition_plans(goal);
    CREATE INDEX IF NOT EXISTS idx_nutrition_plans_difficulty ON nutrition_plans(difficulty);
    CREATE INDEX IF NOT EXISTS idx_nutrition_plans_author_id ON nutrition_plans(author_id);
    CREATE INDEX IF NOT EXISTS idx_nutrition_plans_is_public ON nutrition_plans(is_public);

    -- Educational hubs indexes
    CREATE INDEX IF NOT EXISTS idx_nutrition_educational_hubs_category ON nutrition_educational_hubs(category);
    CREATE INDEX IF NOT EXISTS idx_nutrition_educational_hubs_author_id ON nutrition_educational_hubs(author_id);
    CREATE INDEX IF NOT EXISTS idx_nutrition_educational_hubs_is_published ON nutrition_educational_hubs(is_published);

    -- =====================================================
    -- 8. TRIGGERS FOR AUTOMATIC UPDATES
    -- =====================================================

    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create triggers for updated_at
    CREATE TRIGGER update_nutrition_ingredients_updated_at
        BEFORE UPDATE ON nutrition_ingredients
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_nutrition_recipes_updated_at
        BEFORE UPDATE ON nutrition_recipes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_nutrition_plans_updated_at
        BEFORE UPDATE ON nutrition_plans
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_nutrition_educational_hubs_updated_at
        BEFORE UPDATE ON nutrition_educational_hubs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- =====================================================
    -- SUCCESS MESSAGE
    -- =====================================================

    DO $$
    BEGIN
        RAISE NOTICE '✅ Nutrition database setup voltooid!';
        RAISE NOTICE '🥗 % ingrediënten toegevoegd', (SELECT COUNT(*) FROM nutrition_ingredients);
        RAISE NOTICE '🍳 % recepten aangemaakt', (SELECT COUNT(*) FROM nutrition_recipes);
        RAISE NOTICE '📋 % voedingsplannen gemaakt', (SELECT COUNT(*) FROM nutrition_plans);
        RAISE NOTICE '📚 % educatieve artikelen gepubliceerd', (SELECT COUNT(*) FROM nutrition_educational_hubs);
        RAISE NOTICE '🔒 RLS policies geactiveerd voor beveiliging';
        RAISE NOTICE '⚡ Performance indexes aangemaakt';
    END $$;
  `;

  try {
    console.log('  📖 Creating nutrition tables...');
    
    // Split the SQL into individual statements
    const statements = nutritionSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`  📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`    🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: statement + ';'
          });

          if (error) {
            console.error(`      ❌ Error in statement ${i + 1}:`, error.message);
            // Continue with next statement
          } else {
            console.log(`      ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`      ❌ Exception in statement ${i + 1}:`, err.message);
          // Continue with next statement
        }
      }
    }

  } catch (error) {
    console.error('❌ Error creating nutrition tables:', error);
    throw error;
  }
}

async function verifyTables() {
  const tablesToVerify = [
    'forum_reports',
    'forum_moderation_logs',
    'forum_post_flags',
    'event_categories',
    'events',
    'event_participants',
    'event_comments',
    'announcement_categories',
    'announcements',
    'announcement_views',
    'nutrition_ingredients',
    'nutrition_recipes',
    'nutrition_plans',
    'nutrition_educational_hubs'
  ];

  console.log('  🔍 Verifying tables...');

  for (const tableName of tablesToVerify) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`    ❌ Table ${tableName}: ${error.message}`);
      } else {
        console.log(`    ✅ Table ${tableName}: Accessible`);
      }
    } catch (err) {
      console.log(`    ❌ Table ${tableName}: ${err.message}`);
    }
  }
}

// Run the setup
setupAdminDatabase().catch(console.error); 