import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching user preferences for user:', userId);

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('preference_key, preference_value')
      .eq('user_id', userId);

    if (error) {
      console.log('❌ Error fetching user preferences:', error.message);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Convert to object format
    const preferencesObj = preferences?.reduce((acc, pref) => {
      acc[pref.preference_key] = pref.preference_value;
      return acc;
    }, {} as { [key: string]: string }) || {};

    console.log('✅ User preferences fetched successfully');
    return NextResponse.json({
      success: true,
      preferences: preferencesObj
    });

  } catch (error) {
    console.error('❌ Error in user preferences GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { userId, preferenceKey, preferenceValue } = body;

    if (!userId || !preferenceKey) {
      return NextResponse.json({ error: 'User ID and preference key are required' }, { status: 400 });
    }

    console.log('📝 Updating user preference:', { userId, preferenceKey, preferenceValue });

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preference_key: preferenceKey,
        preference_value: preferenceValue,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,preference_key'
      })
      .select();

    if (error) {
      console.log('❌ Error updating user preference:', error.message);
      return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 });
    }

    console.log('✅ User preference updated successfully');
    return NextResponse.json({
      success: true,
      message: 'Preference updated successfully'
    });

  } catch (error) {
    console.error('❌ Error in user preferences POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 