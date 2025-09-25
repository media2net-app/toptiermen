import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating Academy completion tables...');
    
    // Create academy_lesson_completions table
    const { error: lessonTableError } = await supabaseAdmin.rpc('exec_sql', {
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
      return NextResponse.json({ error: 'Failed to create academy_lesson_completions table' }, { status: 500 });
    }
    
    // Create academy_module_completions table
    const { error: moduleTableError } = await supabaseAdmin.rpc('exec_sql', {
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
      return NextResponse.json({ error: 'Failed to create academy_module_completions table' }, { status: 500 });
    }
    
    // Enable RLS
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE academy_lesson_completions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE academy_module_completions ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError.message);
    }
    
    // Create RLS policies
    const { error: policiesError } = await supabaseAdmin.rpc('exec_sql', {
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
    }
    
    console.log('✅ Academy tables created successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Academy completion tables created successfully' 
    });

  } catch (error) {
    console.error('❌ Error creating Academy tables:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
