import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Working test notes API called');
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { test_user_id, type, page_url, element_selector, area_selection, description, priority, screenshot_url } = body;

    // Validate required fields
    if (!test_user_id || !type || !page_url || !description) {
      console.log('❌ Missing required fields:', { test_user_id, type, page_url, description });
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate type
    if (!['bug', 'improvement', 'general'].includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type. Must be bug, improvement, or general' 
      }, { status: 400 });
    }

    // Validate priority
    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return NextResponse.json({ 
        error: 'Invalid priority. Must be low, medium, high, or critical' 
      }, { status: 400 });
    }

    // Validate area_selection if provided
    if (area_selection) {
      if (!area_selection.x || !area_selection.y || !area_selection.width || !area_selection.height) {
        return NextResponse.json({ 
          error: 'Invalid area_selection. Must include x, y, width, and height' 
        }, { status: 400 });
      }
    }

    console.log('📝 Attempting to insert note...');
    
    // Try to insert the note
    const { data, error } = await supabaseAdmin
      .from('test_notes')
      .insert({
        test_user_id,
        type,
        page_url,
        element_selector,
        area_selection: area_selection ? JSON.stringify(area_selection) : null,
        description,
        priority: priority || 'medium',
        status: 'open',
        screenshot_url
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting test note:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // If table doesn't exist, try to create it
      if (error.message && error.message.includes('relation "public.test_notes" does not exist')) {
        console.log('🔧 Table does not exist, creating it...');
        
        try {
          // Create table using direct SQL
          const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
            sql_query: `
              CREATE TABLE test_notes (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                test_user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                page_url TEXT NOT NULL,
                element_selector TEXT,
                area_selection JSONB,
                description TEXT NOT NULL,
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'open',
                screenshot_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              )
            `
          });

          if (createError) {
            console.error('❌ Error creating table:', createError);
            throw new Error(`Failed to create table: ${createError.message}`);
          }

          console.log('✅ Table created successfully, retrying insert...');
          
          // Try insert again
          const { data: retryData, error: retryError } = await supabaseAdmin
            .from('test_notes')
            .insert({
              test_user_id,
              type,
              page_url,
              element_selector,
              area_selection: area_selection ? JSON.stringify(area_selection) : null,
              description,
              priority: priority || 'medium',
              status: 'open',
              screenshot_url
            })
            .select()
            .single();

          if (retryError) {
            console.error('❌ Error on retry insert:', retryError);
            throw new Error(`Failed to save note after table creation: ${retryError.message}`);
          }

          console.log('✅ Note inserted successfully on retry:', retryData);
          
          // Send notification to user about new bug report
          try {
            const { sendNewBugNotification } = await import('@/lib/notification-utils');
            await sendNewBugNotification(retryData);
            console.log('✅ Notification sent for new bug report (retry)');
          } catch (notificationError) {
            console.warn('⚠️ Failed to send notification for new bug report (retry):', notificationError);
            // Don't fail the bug report creation if notification fails
          }
          
          return NextResponse.json({ 
            success: true, 
            note: retryData 
          });
          
        } catch (tableError) {
          console.error('❌ Table creation failed:', tableError);
          return NextResponse.json({ 
            error: 'Failed to create table',
            details: tableError instanceof Error ? tableError.message : 'Unknown error'
          }, { status: 500 });
        }
      }
      
      // For any other error, return the error details
      return NextResponse.json({ 
        error: 'Failed to save note',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    console.log('✅ Note inserted successfully:', data);

    // Send notification to user about new bug report
    try {
      const { sendNewBugNotification } = await import('@/lib/notification-utils');
      await sendNewBugNotification(data);
      console.log('✅ Notification sent for new bug report');
    } catch (notificationError) {
      console.warn('⚠️ Failed to send notification for new bug report:', notificationError);
      // Don't fail the bug report creation if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      note: data 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📝 Working test notes GET API called');
    const { searchParams } = new URL(request.url);
    const test_user_id = searchParams.get('test_user_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    console.log('📝 Query parameters:', { test_user_id, status, type });

    let query = supabaseAdmin
      .from('test_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (test_user_id) {
      query = query.eq('test_user_id', test_user_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching test notes:', error);
      
      // If table doesn't exist, return empty array
      if (error.message && error.message.includes('relation "public.test_notes" does not exist')) {
        console.log('📊 Table does not exist, returning empty array');
        return NextResponse.json({ 
          success: true, 
          notes: [] 
        });
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch notes',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Notes fetched successfully:', data?.length || 0, 'notes');

    return NextResponse.json({ 
      success: true, 
      notes: data 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 