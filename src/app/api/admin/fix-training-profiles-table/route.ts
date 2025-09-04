import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔧 Training profiles table fix instructions:');
    
    const sqlCommands = `
-- Run these SQL commands in your Supabase SQL editor:

-- 1. First, backup existing data (if any)
-- CREATE TABLE training_profiles_backup AS SELECT * FROM training_profiles;

-- 2. Drop the existing table
DROP TABLE IF EXISTS training_profiles;

-- 3. Recreate the table with TEXT user_id instead of UUID
CREATE TABLE training_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  training_goal TEXT NOT NULL,
  training_frequency INTEGER NOT NULL,
  experience_level TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Create index for better performance
CREATE INDEX idx_training_profiles_user_id ON training_profiles(user_id);

-- 5. Restore data from backup if needed
-- INSERT INTO training_profiles SELECT * FROM training_profiles_backup;
-- DROP TABLE training_profiles_backup;
    `;
    
    console.log(sqlCommands);
    
    return NextResponse.json({
      success: true,
      message: 'SQL commands generated. Run these in Supabase SQL editor.',
      sqlCommands: sqlCommands
    });
    
  } catch (error) {
    console.error('❌ Error generating SQL commands:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
