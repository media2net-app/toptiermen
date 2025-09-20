import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  const { email, userId } = await request.json();
  
  if (!email && !userId) {
    return new Response('Email or userId is required', { status: 400 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const sendLog = (message: string) => {
        const data = `data: ${JSON.stringify({ message, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        sendLog('🔄 Starting onboarding reset...');
        
        const supabase = getSupabaseClient();
        let finalUserId = userId;
        let finalEmail = email;

        // If we have userId but no email, get email from user
        if (userId && !email) {
          sendLog('🔍 Looking up user email...');
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
          if (userError || !userData.users) {
            sendLog('❌ Failed to fetch users');
            throw new Error('Failed to fetch users');
          }

          const user = userData.users.find(u => u.id === userId);
          if (!user) {
            sendLog('❌ User not found');
            throw new Error('User not found');
          }

          finalEmail = user.email;
          sendLog(`✅ Found user email: ${finalEmail}`);
        }
        // If we have email but no userId, get userId from email
        else if (email && !userId) {
          sendLog('🔍 Looking up user ID...');
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
          if (userError || !userData.users) {
            sendLog('❌ Failed to fetch users');
            throw new Error('Failed to fetch users');
          }

          const user = userData.users.find(u => u.email === email);
          if (!user) {
            sendLog('❌ User not found');
            throw new Error('User not found');
          }

          finalUserId = user.id;
          sendLog(`✅ Found user ID: ${finalUserId}`);
        }

        sendLog(`🎯 Resetting onboarding for: ${finalEmail}`);

        // Delete onboarding status records
        sendLog('🗑️ Deleting onboarding status...');
        const { error: onboardingError } = await supabase
          .from('user_onboarding_status')
          .delete()
          .eq('user_id', finalUserId);

        if (onboardingError) {
          sendLog(`⚠️ Error deleting onboarding status: ${onboardingError.message}`);
        } else {
          sendLog('✅ Onboarding status deleted');
        }

        // Delete user missions
        sendLog('🗑️ Deleting user missions...');
        const { error: missionsError } = await supabase
          .from('user_missions')
          .delete()
          .eq('user_id', finalUserId);

        if (missionsError) {
          sendLog(`⚠️ Error deleting user missions: ${missionsError.message}`);
        } else {
          sendLog('✅ User missions deleted');
        }

        // Delete user training progress
        sendLog('🗑️ Deleting training progress...');
        const { error: trainingError } = await supabase
          .from('user_training_progress')
          .delete()
          .eq('user_id', finalUserId);

        if (trainingError) {
          sendLog(`⚠️ Error deleting training progress: ${trainingError.message}`);
        } else {
          sendLog('✅ Training progress deleted');
        }

        // Delete user preferences
        sendLog('🗑️ Deleting user preferences...');
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', finalUserId);

        if (preferencesError) {
          sendLog(`⚠️ Error deleting user preferences: ${preferencesError.message}`);
        } else {
          sendLog('✅ User preferences deleted');
        }

        // Reset main goal in profile
        sendLog('🔄 Resetting profile main goal...');
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ main_goal: null })
          .eq('id', finalUserId);

        if (profileError) {
          sendLog(`⚠️ Error resetting profile: ${profileError.message}`);
        } else {
          sendLog('✅ Profile reset');
        }

        sendLog('🎉 Onboarding reset completed successfully!');
        sendLog(`✅ User ${finalEmail} can now start onboarding from step 0`);
        
        // Send completion signal
        const completionData = `data: ${JSON.stringify({ 
          completed: true, 
          message: 'Reset completed successfully',
          userId: finalUserId,
          email: finalEmail,
          timestamp: new Date().toISOString()
        })}\n\n`;
        controller.enqueue(encoder.encode(completionData));

      } catch (error) {
        sendLog(`❌ Error during reset: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        const errorData = `data: ${JSON.stringify({ 
          error: true, 
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
