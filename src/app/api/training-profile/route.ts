import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseAdminClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

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
    
    // Check if userId is an email and convert to UUID if needed
    let actualUserId = userId;
    if (userId.includes('@')) {
      try {
        // Use the existing get-user-uuid API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/get-user-uuid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userId })
        });
        
        if (response.ok) {
          const { uuid } = await response.json();
          actualUserId = uuid;
          console.log('✅ Converted email to UUID:', actualUserId);
        } else {
          console.log('❌ Failed to convert email to UUID');
          return NextResponse.json({
            success: true,
            profile: null
          });
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID:', error);
        return NextResponse.json({
          success: true,
          profile: null
        });
      }
    }
    
    const { data, error } = await supabase
      .from('training_profiles')
      .select('*')
      .eq('user_id', actualUserId)
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
    
    // Check if userId is an email and convert to UUID if needed
    let actualUserId = userId;
    if (userId.includes('@')) {
      try {
        console.log('🔍 Looking up user by email:', userId);
        // Use the existing get-user-uuid API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/get-user-uuid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userId })
        });
        
        if (response.ok) {
          const { uuid } = await response.json();
          actualUserId = uuid;
          console.log('✅ Converted email to UUID for saving:', actualUserId);
        } else {
          console.log('❌ Failed to convert email to UUID');
          return NextResponse.json({ 
            success: false, 
            error: 'User not found' 
          }, { status: 404 });
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID for saving:', error);
        return NextResponse.json({ 
          success: false, 
          error: `Email conversion failed: ${error}` 
        }, { status: 400 });
      }
    }
    
    const profileData = {
      user_id: actualUserId,
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
