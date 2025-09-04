import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Try to create the table by attempting to insert a test record
    // This will fail if the table doesn't exist, but we can catch that
    const { error: testError } = await supabase
      .from('training_profiles')
      .select('*')
      .limit(1);

    if (testError && testError.message.includes('relation "training_profiles" does not exist')) {
      return NextResponse.json({
        success: false,
        error: 'Training profiles table does not exist. Please create it manually in Supabase dashboard with the following SQL:',
        sql: `
CREATE TABLE training_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  training_goal TEXT NOT NULL,
  training_frequency INTEGER NOT NULL,
  experience_level TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE training_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own training profile" ON training_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training profile" ON training_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training profile" ON training_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_training_profiles_updated_at 
  BEFORE UPDATE ON training_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
        `
      });
    }

    // If we get here, the table exists
    return NextResponse.json({
      success: true,
      message: 'Training profiles table already exists'
    });

  } catch (error) {
    console.error('Error creating training_profiles table:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
