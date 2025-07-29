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

    console.log('🔍 Fetching active training schema for user:', userId);

    try {
      // Get user's selected schema
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('selected_schema_id')
        .eq('id', userId)
        .single();

      if (userError) {
        console.log('⚠️  User data not available');
        return NextResponse.json({ 
          hasActiveSchema: false,
          message: 'No active training schema found'
        });
      }

      if (!userData.selected_schema_id) {
        console.log('ℹ️  No active schema selected');
        return NextResponse.json({ 
          hasActiveSchema: false,
          message: 'No training schema selected'
        });
      }

      // Get the selected schema details
      const { data: schemaData, error: schemaError } = await supabase
        .from('training_schemas')
        .select('*')
        .eq('id', userData.selected_schema_id)
        .single();

      if (schemaError) {
        console.log('⚠️  Schema not found');
        return NextResponse.json({ 
          hasActiveSchema: false,
          message: 'Selected schema not found'
        });
      }

      // Get schema days
      const { data: daysData, error: daysError } = await supabase
        .from('training_schema_days')
        .select('*')
        .eq('schema_id', userData.selected_schema_id)
        .order('order_index');

      if (daysError) {
        console.log('⚠️  Schema days not available');
      }

      // Get user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_training_schema_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('schema_id', userData.selected_schema_id)
        .single();

      if (progressError) {
        console.log('⚠️  User progress not available');
      }

      console.log('✅ Active training schema fetched successfully');
      return NextResponse.json({
        hasActiveSchema: true,
        schema: schemaData,
        days: daysData || [],
        progress: progressData || null
      });

    } catch (error) {
      console.log('⚠️  Database not available, using fallback');
      return NextResponse.json({ 
        hasActiveSchema: false,
        message: 'Database not available'
      });
    }

  } catch (error) {
    console.error('❌ Error in user training schema GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 