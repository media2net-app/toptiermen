import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Updating training_profiles table to support email...');
    
    // Add email column to training_profiles table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE training_profiles 
        ADD COLUMN IF NOT EXISTS user_email TEXT;
        
        -- Create index on user_email for better performance
        CREATE INDEX IF NOT EXISTS idx_training_profiles_user_email 
        ON training_profiles(user_email);
      `
    });
    
    if (error) {
      console.error('❌ Error updating training_profiles table:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Training profiles table updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Training profiles table updated with email support'
    });
    
  } catch (error) {
    console.error('❌ Error in update-training-profiles-table:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
