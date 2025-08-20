import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    console.log('🔍 Fetching introduction task for user:', userId);

    // Get the user's introduction task
    const { data: task, error: taskError } = await supabase
      .from('user_introduction_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_type', 'forum_introduction')
      .single();

    if (taskError && taskError.code !== 'PGRST116') {
      console.error('❌ Error fetching introduction task:', taskError);
      return NextResponse.json({ 
        error: 'Failed to fetch introduction task' 
      }, { status: 500 });
    }

    // If no task exists, create one
    if (!task) {
      console.log('📝 Creating new introduction task for user:', userId);
      
      const { data: newTask, error: createError } = await supabase
        .from('user_introduction_tasks')
        .insert({
          user_id: userId,
          task_type: 'forum_introduction',
          status: 'pending'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating introduction task:', createError);
        return NextResponse.json({ 
          error: 'Failed to create introduction task' 
        }, { status: 500 });
      }

      console.log('✅ Introduction task created:', newTask);
      return NextResponse.json({ 
        success: true, 
        task: newTask 
      });
    }

    console.log('✅ Introduction task found:', task);
    return NextResponse.json({ 
      success: true, 
      task 
    });

  } catch (error) {
    console.error('❌ Error in introduction task API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, forumPostId } = body;

    if (!userId || !action) {
      return NextResponse.json({ 
        error: 'User ID and action are required' 
      }, { status: 400 });
    }

    console.log('📝 Updating introduction task:', { userId, action, forumPostId });

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (action === 'complete') {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
      if (forumPostId) {
        updateData.forum_post_id = forumPostId;
      }
    } else if (action === 'skip') {
      updateData.status = 'skipped';
      updateData.completed_at = new Date().toISOString();
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "complete" or "skip"' 
      }, { status: 400 });
    }

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from('user_introduction_tasks')
      .update(updateData)
      .eq('user_id', userId)
      .eq('task_type', 'forum_introduction')
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating introduction task:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update introduction task' 
      }, { status: 500 });
    }

    console.log('✅ Introduction task updated:', updatedTask);

    // If completing, also check if we need to create a forum post
    if (action === 'complete' && forumPostId) {
      // Verify the forum post exists and belongs to the user
      const { data: forumPost, error: postError } = await supabase
        .from('forum_posts')
        .select('id, author_id, content')
        .eq('id', forumPostId)
        .eq('author_id', userId)
        .single();

      if (postError) {
        console.warn('⚠️ Forum post verification failed:', postError);
      } else {
        console.log('✅ Forum post verified:', forumPost);
      }
    }

    return NextResponse.json({ 
      success: true, 
      task: updatedTask 
    });

  } catch (error) {
    console.error('❌ Error in introduction task update:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
