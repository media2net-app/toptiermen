import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🗑️ Clearing training_profiles table...');
    
    // Delete all records from training_profiles table
    const { data, error } = await supabase
      .from('training_profiles')
      .delete()
      .neq('id', 0); // Delete all records (id is never 0)
    
    if (error) {
      console.error('❌ Error clearing training_profiles:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Training profiles table cleared successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Training profiles table cleared',
      deletedCount: 'all'
    });
    
  } catch (error) {
    console.error('❌ Error in clear-training-profiles:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
