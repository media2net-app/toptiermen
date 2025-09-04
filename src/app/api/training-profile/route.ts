import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Fetching training profile for user:', userId);
    
    const { data, error } = await supabase
      .from('training_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('ℹ️ No training profile found for user');
        return NextResponse.json({
          success: true,
          profile: null
        });
      }
      console.error('❌ Error fetching training profile:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Training profile fetched:', data);
    
    return NextResponse.json({
      success: true,
      profile: data
    });
    
  } catch (error) {
    console.error('❌ Error in training-profile GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, training_goal, training_frequency, experience_level, equipment_type } = body;

    if (!userId || !training_goal || !training_frequency || !experience_level || !equipment_type) {
      return NextResponse.json({ 
        success: false, 
        error: 'All fields are required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('💾 Saving training profile:', body);
    
    const profileData = {
      user_id: userId,
      training_goal,
      training_frequency,
      experience_level,
      equipment_type,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('training_profiles')
      .upsert(profileData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error saving training profile:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Training profile saved:', data);
    
    return NextResponse.json({
      success: true,
      profile: data
    });
    
  } catch (error) {
    console.error('❌ Error in training-profile POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
