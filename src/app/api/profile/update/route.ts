import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, display_name, main_goal, bio, location, website, interests } = body;

    // Get user from session (this would need to be implemented with proper auth)
    // For now, we'll use a test user ID
    const testUserId = '35ca4f47-4b9d-4b68-98d8-acbbc0428cad'; // chieltest user

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        display_name,
        main_goal,
        bio,
        location,
        website,
        interests,
        updated_at: new Date().toISOString()
      })
      .eq('id', testUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      profile 
    });
  } catch (error) {
    console.error('Error in profile update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
