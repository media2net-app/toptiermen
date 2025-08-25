import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get all push subscriptions without foreign key relationship
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching push subscriptions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch push subscriptions' },
        { status: 500 }
      );
    }

    // If we have subscriptions, try to get user details separately
    if (subscriptions && subscriptions.length > 0) {
      const userIds = subscriptions.map(sub => sub.user_id);
      
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (!profilesError && profiles) {
          // Create a map of user details
          const userMap = new Map(profiles.map(profile => [profile.id, profile]));
          
          // Add user details to subscriptions
          const subscriptionsWithUsers = subscriptions.map(sub => ({
            ...sub,
            user_full_name: userMap.get(sub.user_id)?.full_name || 'Unknown',
            user_email: userMap.get(sub.user_id)?.email || 'No email'
          }));

          return NextResponse.json({
            subscriptions: subscriptionsWithUsers,
            count: subscriptionsWithUsers.length
          });
        }
      } catch (profileError) {
        console.error('Error fetching user profiles:', profileError);
        // Continue without user details
      }
    }

    return NextResponse.json({
      subscriptions: subscriptions || [],
      count: subscriptions?.length || 0
    });

  } catch (error) {
    console.error('Error in push-subscriptions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 