#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOnboardingStatus() {
  try {
    console.log('📊 Checking onboarding status of all members...\n');

    // Get all users with their onboarding status
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    // Get onboarding status for all users
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*');

    if (onboardingError) {
      console.error('❌ Error fetching onboarding data:', onboardingError.message);
      return;
    }

    // Get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    // Create maps for easy lookup
    const onboardingMap = new Map();
    onboardingData?.forEach(item => {
      onboardingMap.set(item.user_id, item);
    });

    const profilesMap = new Map();
    profiles?.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });

    // Filter out admin users and focus on members
    const memberUsers = users.users.filter(user => {
      const profile = profilesMap.get(user.id);
      return profile?.role === 'member' || !profile?.role; // Include users without role as members
    });

    console.log(`👥 Total Members: ${memberUsers.length}\n`);

    // Process each member
    const membersWithStatus = memberUsers.map(user => {
      const onboarding = onboardingMap.get(user.id);
      const profile = profilesMap.get(user.id);
      
      // Calculate actual current step based on completed steps
      let actualCurrentStep = 0;
      let stepDescription = '';
      
      if (onboarding) {
        if (onboarding.onboarding_completed) {
          actualCurrentStep = 6;
          stepDescription = '✅ Voltooid';
        } else if (onboarding.step_5_completed) {
          actualCurrentStep = 6;
          stepDescription = 'Forum Introductie (final step)';
        } else if (onboarding.step_4_completed) {
          actualCurrentStep = 5;
          stepDescription = 'Forum Introductie';
        } else if (onboarding.step_3_completed) {
          actualCurrentStep = 4;
          stepDescription = 'Voedingsplan';
        } else if (onboarding.step_2_completed) {
          actualCurrentStep = 3;
          stepDescription = 'Trainingsschema';
        } else if (onboarding.step_1_completed) {
          actualCurrentStep = 2;
          stepDescription = 'Missies Selecteren';
        } else if (onboarding.welcome_video_watched) {
          actualCurrentStep = 1;
          stepDescription = 'Doel Omschrijven';
        } else {
          actualCurrentStep = 0;
          stepDescription = 'Welkom Video';
        }
      } else {
        actualCurrentStep = 0;
        stepDescription = 'Nog niet gestart';
      }
      
      return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        onboardingCompleted: onboarding?.onboarding_completed || false,
        currentStep: actualCurrentStep,
        stepDescription: stepDescription,
        mainGoal: profile?.main_goal || 'Niet ingesteld',
        welcomeVideoWatched: onboarding?.welcome_video_watched || false,
        step1Completed: onboarding?.step_1_completed || false,
        step2Completed: onboarding?.step_2_completed || false,
        step3Completed: onboarding?.step_3_completed || false,
        step4Completed: onboarding?.step_4_completed || false,
        step5Completed: onboarding?.step_5_completed || false,
        startedAt: onboarding?.started_at || null,
        completedAt: onboarding?.completed_at || null
      };
    });

    // Sort by completion status and creation date
    membersWithStatus.sort((a, b) => {
      if (a.onboardingCompleted && !b.onboardingCompleted) return -1;
      if (!a.onboardingCompleted && b.onboardingCompleted) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Calculate statistics
    const totalMembers = membersWithStatus.length;
    const completedOnboarding = membersWithStatus.filter(u => u.onboardingCompleted).length;
    const pendingOnboarding = totalMembers - completedOnboarding;
    const startedOnboarding = membersWithStatus.filter(u => u.currentStep > 0).length;
    const notStarted = membersWithStatus.filter(u => u.currentStep === 0).length;

    console.log('📈 ONBOARDING STATISTIEKEN:');
    console.log('========================');
    console.log(`👥 Totaal leden: ${totalMembers}`);
    console.log(`✅ Onboarding voltooid: ${completedOnboarding} (${((completedOnboarding/totalMembers)*100).toFixed(1)}%)`);
    console.log(`⏳ Onboarding gestart: ${startedOnboarding} (${((startedOnboarding/totalMembers)*100).toFixed(1)}%)`);
    console.log(`❌ Nog niet gestart: ${notStarted} (${((notStarted/totalMembers)*100).toFixed(1)}%)`);
    console.log(`🔄 Nog bezig: ${pendingOnboarding - notStarted} (${(((pendingOnboarding - notStarted)/totalMembers)*100).toFixed(1)}%)`);
    console.log('');

    // Show completed members
    const completedMembers = membersWithStatus.filter(u => u.onboardingCompleted);
    if (completedMembers.length > 0) {
      console.log('✅ LEDEN MET VOLTOOIDE ONBOARDING:');
      console.log('==================================');
      completedMembers.forEach((member, index) => {
        console.log(`${index + 1}. ${member.email}`);
        console.log(`   📅 Aangemeld: ${new Date(member.createdAt).toLocaleDateString('nl-NL')}`);
        console.log(`   🎯 Hoofddoel: ${member.mainGoal}`);
        console.log(`   ✅ Voltooid op: ${member.completedAt ? new Date(member.completedAt).toLocaleDateString('nl-NL') : 'Onbekend'}`);
        console.log('');
      });
    }

    // Show members in progress
    const inProgressMembers = membersWithStatus.filter(u => !u.onboardingCompleted && u.currentStep > 0);
    if (inProgressMembers.length > 0) {
      console.log('⏳ LEDEN MET ONBOARDING IN PROGRESS:');
      console.log('===================================');
      inProgressMembers.forEach((member, index) => {
        console.log(`${index + 1}. ${member.email}`);
        console.log(`   📅 Aangemeld: ${new Date(member.createdAt).toLocaleDateString('nl-NL')}`);
        console.log(`   📍 Huidige stap: ${member.currentStep}/6 - ${member.stepDescription}`);
        console.log(`   🎯 Hoofddoel: ${member.mainGoal}`);
        console.log(`   📊 Voortgang: ${member.welcomeVideoWatched ? '✅' : '❌'} Welkom Video | ${member.step1Completed ? '✅' : '❌'} Stap 1 | ${member.step2Completed ? '✅' : '❌'} Stap 2 | ${member.step3Completed ? '✅' : '❌'} Stap 3 | ${member.step4Completed ? '✅' : '❌'} Stap 4 | ${member.step5Completed ? '✅' : '❌'} Stap 5`);
        console.log('');
      });
    }

    // Show members who haven't started
    const notStartedMembers = membersWithStatus.filter(u => u.currentStep === 0);
    if (notStartedMembers.length > 0) {
      console.log('❌ LEDEN DIE NOG NIET ZIJN GESTART:');
      console.log('==================================');
      notStartedMembers.forEach((member, index) => {
        console.log(`${index + 1}. ${member.email}`);
        console.log(`   📅 Aangemeld: ${new Date(member.createdAt).toLocaleDateString('nl-NL')}`);
        console.log(`   🎯 Hoofddoel: ${member.mainGoal}`);
        console.log('');
      });
    }

    console.log('🏁 Onboarding status check completed!');

  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
  }
}

// Run the function
checkOnboardingStatus();
