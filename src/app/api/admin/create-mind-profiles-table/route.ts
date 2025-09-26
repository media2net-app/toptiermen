import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  try {
    console.log('🧘 Creating mind profiles table...');
    
    const sqlCommands = `
-- Run these SQL commands in your Supabase SQL editor to create the mind profiles system:

-- Create user_mind_profiles table
CREATE TABLE IF NOT EXISTS user_mind_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stress_assessment JSONB,
    lifestyle_info JSONB,
    personal_goals JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create mind_sessions table
CREATE TABLE IF NOT EXISTS mind_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER,
    completed BOOLEAN DEFAULT false,
    mood_before INTEGER,
    mood_after INTEGER,
    stress_before INTEGER,
    stress_after INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_mind_profiles_user_id ON user_mind_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_sessions_user_id ON mind_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_sessions_type ON mind_sessions(type);
CREATE INDEX IF NOT EXISTS idx_mind_sessions_created_at ON mind_sessions(created_at);

-- Enable RLS
ALTER TABLE user_mind_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_mind_profiles
CREATE POLICY "Users can view own mind profile" ON user_mind_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mind profile" ON user_mind_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mind profile" ON user_mind_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for mind_sessions
CREATE POLICY "Users can view own mind sessions" ON mind_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mind sessions" ON mind_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mind sessions" ON mind_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_mind_profiles_updated_at 
  BEFORE UPDATE ON user_mind_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
    `;
    
    console.log('📋 SQL commands generated for mind profiles tables');
    
    return NextResponse.json({
      success: true,
      message: 'SQL commands generated for mind profiles tables',
      sqlCommands: sqlCommands,
      instructions: [
        '1. Go to your Supabase Dashboard',
        '2. Navigate to SQL Editor',
        '3. Copy and paste the SQL commands above',
        '4. Execute the commands',
        '5. Verify tables are created successfully'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error generating mind profiles table SQL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
