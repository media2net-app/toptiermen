import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up todo database tables...');

    // Since we can't execute raw SQL directly through the client,
    // we'll create a simple todo_statistics table with basic structure
    // and provide instructions for the full setup

    // Try to create a simple todo_statistics table
    try {
      // First, let's try to insert a record to see if the table exists
      const { error: insertError } = await supabaseAdmin
        .from('todo_statistics')
        .insert({
          total_tasks: 0,
          completed_tasks: 0,
          pending_tasks: 0,
          in_progress_tasks: 0,
          blocked_tasks: 0,
          total_estimated_hours: 0,
          total_actual_hours: 0,
          average_completion_time: 0,
          tasks_by_priority: {},
          tasks_by_category: {},
          tasks_by_status: {},
          period: 'all'
        });

      if (insertError) {
        console.log('Table todo_statistics does not exist, providing setup instructions');
      } else {
        console.log('✅ todo_statistics table exists and is working');
      }
    } catch (error) {
      console.log('todo_statistics table does not exist');
    }

    // Check what tables currently exist
    const { data: existingTables, error: checkError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['todo_tasks', 'todo_subtasks', 'todo_milestones', 'todo_statistics']);

    if (checkError) {
      console.error('Error checking existing tables:', checkError);
    } else {
      console.log('Existing todo tables:', existingTables?.map(t => t.table_name) || []);
    }

    console.log('✅ Todo database setup check completed');
    return NextResponse.json({
      success: true,
      message: 'Todo database setup check completed. Some tables may need to be created manually.',
      existingTables: existingTables?.map(t => t.table_name) || [],
      instructions: [
        '1. Go to Supabase Dashboard > SQL Editor',
        '2. Run the SQL script from scripts/create-todo-tables.sql',
        '3. This will create all necessary todo tables with proper structure',
        '4. The script includes RLS policies and indexes for security and performance'
      ],
      missingTables: ['todo_tasks', 'todo_subtasks', 'todo_milestones', 'todo_statistics'].filter(
        table => !existingTables?.some(t => t.table_name === table)
      )
    });

  } catch (error) {
    console.error('❌ Error checking todo database:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to check todo database: ${error}`,
      message: 'Please run the SQL script manually in Supabase dashboard'
    });
  }
} 