-- Create Todo Management Database Tables
-- This script creates the necessary tables for the todo system

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
    dependencies TEXT[], -- Array of task IDs this task depends on
    tags TEXT[], -- Array of tags
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

-- Create todo_statistics table for caching statistics
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
    period VARCHAR(20) DEFAULT 'all' -- 'all', 'week', 'month', 'quarter'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todo_tasks_status ON todo_tasks(status);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_priority ON todo_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_category ON todo_tasks(category);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_assigned_to ON todo_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_due_date ON todo_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_created_at ON todo_tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_todo_subtasks_task_id ON todo_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_todo_subtasks_status ON todo_subtasks(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_todo_tasks_updated_at BEFORE UPDATE ON todo_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_subtasks_updated_at BEFORE UPDATE ON todo_subtasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_milestones_updated_at BEFORE UPDATE ON todo_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial statistics record
INSERT INTO todo_statistics (id, total_tasks, completed_tasks, pending_tasks, in_progress_tasks, blocked_tasks, total_estimated_hours, total_actual_hours, average_completion_time, tasks_by_priority, tasks_by_category, tasks_by_status, calculated_at, period)
VALUES (
    uuid_generate_v4(),
    0, 0, 0, 0, 0, 0, 0, 0,
    '{"critical": 0, "high": 0, "medium": 0, "low": 0}'::jsonb,
    '{"development": 0, "content": 0, "video": 0, "nutrition": 0, "design": 0, "testing": 0, "api": 0, "ui": 0, "database": 0}'::jsonb,
    '{"pending": 0, "in_progress": 0, "completed": 0, "blocked": 0}'::jsonb,
    NOW(),
    'all'
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for todo_tasks
CREATE POLICY "Users can view their own tasks" ON todo_tasks
    FOR SELECT USING (auth.uid() = created_by OR assigned_to = (SELECT full_name FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all tasks" ON todo_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own tasks" ON todo_tasks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can insert tasks" ON todo_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own tasks" ON todo_tasks
    FOR UPDATE USING (auth.uid() = created_by OR assigned_to = (SELECT full_name FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update all tasks" ON todo_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete tasks" ON todo_tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for todo_subtasks
CREATE POLICY "Users can view subtasks of their tasks" ON todo_subtasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM todo_tasks 
            WHERE id = todo_subtasks.task_id 
            AND (created_by = auth.uid() OR assigned_to = (SELECT full_name FROM profiles WHERE id = auth.uid()))
        )
    );

CREATE POLICY "Admins can view all subtasks" ON todo_subtasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage subtasks" ON todo_subtasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for todo_milestones
CREATE POLICY "Admins can manage milestones" ON todo_milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for todo_statistics
CREATE POLICY "Admins can view statistics" ON todo_statistics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update statistics" ON todo_statistics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON todo_tasks TO authenticated;
GRANT ALL ON todo_subtasks TO authenticated;
GRANT ALL ON todo_milestones TO authenticated;
GRANT ALL ON todo_statistics TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE todo_tasks IS 'Main tasks table for the todo management system';
COMMENT ON TABLE todo_subtasks IS 'Subtasks that belong to main tasks';
COMMENT ON TABLE todo_milestones IS 'Project milestones for tracking progress';
COMMENT ON TABLE todo_statistics IS 'Cached statistics for the todo system'; 