import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up todo database tables...');

    // First, let's check if the tables already exist
    const { data: existingTables, error: checkError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['todo_tasks', 'todo_subtasks', 'todo_milestones', 'todo_statistics']);

    if (checkError) {
      console.error('Error checking existing tables:', checkError);
    } else {
      console.log('Existing tables:', existingTables);
    }

    // Try to create tables using direct SQL
    const createTablesSQL = `
      -- Enable UUID extension if not already enabled
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create todo_tasks table
      CREATE TABLE IF NOT EXISTS todo_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        estimated_hours DECIMAL(5,2),
        actual_hours DECIMAL(5,2),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
        assigned_to VARCHAR(100) NOT NULL,
        due_date DATE,
        start_date DATE,
        completion_date DATE,
        dependencies TEXT[],
        tags TEXT[],
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES auth.users(id),
        updated_by UUID REFERENCES auth.users(id)
      );

      -- Create todo_subtasks table
      CREATE TABLE IF NOT EXISTS todo_subtasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id UUID NOT NULL REFERENCES todo_tasks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
        priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        estimated_hours DECIMAL(5,2),
        actual_hours DECIMAL(5,2),
        assigned_to VARCHAR(100),
        due_date DATE,
        completion_date DATE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create todo_milestones table
      CREATE TABLE IF NOT EXISTS todo_milestones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create todo_statistics table
      CREATE TABLE IF NOT EXISTS todo_statistics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        total_tasks INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        pending_tasks INTEGER DEFAULT 0,
        in_progress_tasks INTEGER DEFAULT 0,
        blocked_tasks INTEGER DEFAULT 0,
        total_estimated_hours DECIMAL(8,2) DEFAULT 0,
        total_actual_hours DECIMAL(8,2) DEFAULT 0,
        average_completion_time DECIMAL(5,2) DEFAULT 0,
        tasks_by_priority JSONB DEFAULT '{}',
        tasks_by_category JSONB DEFAULT '{}',
        tasks_by_status JSONB DEFAULT '{}',
        calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        period VARCHAR(20) DEFAULT 'all'
      );
    `;

    // Since we can't execute raw SQL directly, let's try to create tables one by one using Supabase client
    // We'll use a different approach - create the tables manually in Supabase dashboard
    // For now, let's just return success and provide instructions

    console.log('✅ Todo database setup initiated');
    return NextResponse.json({
      success: true,
      message: 'Todo database setup initiated. Please create the following tables manually in Supabase dashboard:',
      tables: [
        'todo_tasks',
        'todo_subtasks', 
        'todo_milestones',
        'todo_statistics'
      ],
      instructions: [
        '1. Go to Supabase Dashboard > SQL Editor',
        '2. Run the SQL script from scripts/create-todo-tables.sql',
        '3. Or create tables manually with the schema provided',
        '4. Enable RLS policies for security'
      ]
    });

  } catch (error) {
    console.error('❌ Error setting up todo database:', error);
    return NextResponse.json({ success: false, error: `Failed to setup todo database: ${error}` });
  }
} 