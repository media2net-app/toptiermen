const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAcademyTables() {
  try {
    console.log('🔧 Creating Academy completion tables...');
    
    // Create academy_lesson_completions table
    const { error: lessonTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS academy_lesson_completions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          lesson_id UUID NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          score INTEGER DEFAULT 0,
          time_spent INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, lesson_id)
        );
      `
    });
    
    if (lessonTableError) {
      console.error('❌ Error creating academy_lesson_completions:', lessonTableError.message);
    } else {
      console.log('✅ Created academy_lesson_completions table');
    }
    
    // Create academy_module_completions table
    const { error: moduleTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS academy_module_completions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          module_id UUID NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          total_lessons INTEGER DEFAULT 0,
          completed_lessons INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, module_id)
        );
      `
    });
    
    if (moduleTableError) {
      console.error('❌ Error creating academy_module_completions:', moduleTableError.message);
    } else {
      console.log('✅ Created academy_module_completions table');
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE academy_lesson_completions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE academy_module_completions ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError.message);
    } else {
      console.log('✅ Enabled RLS');
    }
    
    // Create RLS policies
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can view their own lesson completions" ON academy_lesson_completions
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own lesson completions" ON academy_lesson_completions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can view their own module completions" ON academy_module_completions
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own module completions" ON academy_module_completions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
    
    if (policiesError) {
      console.error('❌ Error creating RLS policies:', policiesError.message);
    } else {
      console.log('✅ Created RLS policies');
    }
    
    console.log('🎉 Academy tables created successfully!');
    
    // Now complete all lessons and modules for Rick
    await completeRickAcademy();
    
  } catch (error) {
    console.error('❌ Error creating Academy tables:', error);
  }
}

async function completeRickAcademy() {
  try {
    const rickUserId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'; // Rick's user ID
    
    console.log('🚀 Completing all Academy lessons and modules for Rick...');
    
    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, module_id')
      .order('module_id', { ascending: true })
      .order('order_index', { ascending: true });
    
    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError.message);
      return;
    }
    
    console.log(`📚 Found ${lessons.length} lessons to complete`);
    
    // Complete each lesson
    let completedLessons = 0;
    for (const lesson of lessons) {
      try {
        const { error: insertError } = await supabase
          .from('academy_lesson_completions')
          .upsert({
            user_id: rickUserId,
            lesson_id: lesson.id,
            completed_at: new Date().toISOString(),
            score: 100,
            time_spent: 300
          });
        
        if (insertError) {
          console.error(`❌ Error completing lesson ${lesson.title}:`, insertError.message);
        } else {
          console.log(`✅ Completed lesson: ${lesson.title}`);
          completedLessons++;
        }
      } catch (error) {
        console.error(`❌ Error with lesson ${lesson.title}:`, error.message);
      }
    }
    
    console.log(`🎉 Completed ${completedLessons} out of ${lessons.length} lessons for Rick!`);
    
    // Now complete modules
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .order('positie', { ascending: true });
    
    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError.message);
      return;
    }
    
    let completedModules = 0;
    for (const module of modules) {
      try {
        // Count lessons in this module
        const { count: lessonCount } = await supabase
          .from('academy_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', module.id);
        
        const { error: moduleError } = await supabase
          .from('academy_module_completions')
          .upsert({
            user_id: rickUserId,
            module_id: module.id,
            completed_at: new Date().toISOString(),
            total_lessons: lessonCount || 0,
            completed_lessons: lessonCount || 0
          });
        
        if (moduleError) {
          console.error(`❌ Error completing module ${module.title}:`, moduleError.message);
        } else {
          console.log(`✅ Completed module: ${module.title} (${lessonCount} lessons)`);
          completedModules++;
        }
      } catch (error) {
        console.error(`❌ Error with module ${module.title}:`, error.message);
      }
    }
    
    console.log(`🎉 Completed ${completedModules} out of ${modules.length} modules for Rick!`);
    
  } catch (error) {
    console.error('❌ Error completing Academy:', error);
  }
}

createAcademyTables();
