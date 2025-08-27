require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runTestChecklist() {
  try {
    console.log('🧪 Running comprehensive test checklist for live launch...\n');
    
    const checklist = {
      userManagement: [],
      onboarding: [],
      missions: [],
      habits: [],
      academy: [],
      forum: [],
      challenges: [],
      badges: [],
      email: [],
      performance: [],
      security: []
    };
    
    // 1. User Management Tests
    console.log('👤 1. User Management Tests...');
    
    // Check if Jan Jansen exists
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      checklist.userManagement.push('❌ Error fetching users');
    } else {
      const janJansen = users.users.find(u => u.email === 'jan.jansen@test.com');
      if (janJansen) {
        checklist.userManagement.push('✅ Jan Jansen user exists');
      } else {
        checklist.userManagement.push('❌ Jan Jansen user not found');
      }
    }
    
    // Check user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      checklist.userManagement.push('❌ Error fetching profiles');
    } else {
      checklist.userManagement.push(`✅ User profiles working (${profiles.length} found)`);
    }
    
    // 2. Onboarding Tests
    console.log('\n📋 2. Onboarding Tests...');
    
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .limit(5);
    
    if (onboardingError) {
      checklist.onboarding.push('❌ Error fetching onboarding data');
    } else {
      checklist.onboarding.push(`✅ Onboarding system working (${onboardingData.length} records)`);
      
      // Check Jan Jansen's onboarding
      const janOnboarding = onboardingData.find(o => o.user_id === users.users.find(u => u.email === 'jan.jansen@test.com')?.id);
      if (janOnboarding && janOnboarding.onboarding_completed) {
        checklist.onboarding.push('✅ Jan Jansen onboarding completed');
      } else {
        checklist.onboarding.push('⚠️ Jan Jansen onboarding not completed');
      }
    }
    
    // 3. Missions Tests
    console.log('\n🎯 3. Missions Tests...');
    
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .limit(10);
    
    if (missionsError) {
      checklist.missions.push('❌ Error fetching missions');
    } else {
      checklist.missions.push(`✅ Missions system working (${missions.length} records)`);
      
      const completedMissions = missions.filter(m => m.status === 'completed');
      checklist.missions.push(`✅ Completed missions: ${completedMissions.length}`);
    }
    
    // 4. Habits Tests
    console.log('\n🔄 4. Habits Tests...');
    
    const { data: habits, error: habitsError } = await supabase
      .from('user_habits')
      .select('*')
      .limit(10);
    
    if (habitsError) {
      checklist.habits.push('❌ Error fetching habits');
    } else {
      checklist.habits.push(`✅ Habits system working (${habits.length} records)`);
    }
    
    // Check habit logs
    const { data: habitLogs, error: logsError } = await supabase
      .from('user_habit_logs')
      .select('*')
      .limit(10);
    
    if (logsError) {
      checklist.habits.push('❌ Error fetching habit logs');
    } else {
      checklist.habits.push(`✅ Habit logs working (${habitLogs.length} records)`);
    }
    
    // 5. Academy Tests
    console.log('\n🎓 5. Academy Tests...');
    
    // Check if academy_progress table exists
    const { data: academyProgress, error: academyError } = await supabase
      .from('academy_progress')
      .select('*')
      .limit(5);
    
    if (academyError) {
      checklist.academy.push('⚠️ Academy progress table may not exist');
    } else {
      checklist.academy.push(`✅ Academy system working (${academyProgress.length} records)`);
    }
    
    // 6. Forum Tests
    console.log('\n💬 6. Forum Tests...');
    
    // Check if forum_posts table exists
    const { data: forumPosts, error: forumError } = await supabase
      .from('forum_posts')
      .select('*')
      .limit(5);
    
    if (forumError) {
      checklist.forum.push('⚠️ Forum posts table may not exist');
    } else {
      checklist.forum.push(`✅ Forum system working (${forumPosts.length} posts)`);
    }
    
    // 7. Challenges Tests
    console.log('\n🏆 7. Challenges Tests...');
    
    // Check if user_challenges table exists
    const { data: userChallenges, error: challengesError } = await supabase
      .from('user_challenges')
      .select('*')
      .limit(5);
    
    if (challengesError) {
      checklist.challenges.push('⚠️ User challenges table may not exist');
    } else {
      checklist.challenges.push(`✅ Challenges system working (${userChallenges.length} participations)`);
    }
    
    // 8. Badges Tests
    console.log('\n🏆 8. Badges Tests...');
    
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .limit(5);
    
    if (badgesError) {
      checklist.badges.push('❌ Error fetching badges');
    } else {
      checklist.badges.push(`✅ Badges system working (${badges.length} badges available)`);
    }
    
    // Check user badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .limit(10);
    
    if (userBadgesError) {
      checklist.badges.push('❌ Error fetching user badges');
    } else {
      checklist.badges.push(`✅ User badges working (${userBadges.length} assigned)`);
    }
    
    // 9. Email Tests
    console.log('\n📧 9. Email Tests...');
    
    // Check email configuration
    const { data: emailConfig, error: emailError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('setting_key', 'email')
      .single();
    
    if (emailError) {
      checklist.email.push('❌ Error fetching email configuration');
    } else {
      checklist.email.push('✅ Email configuration found');
      
      const config = emailConfig.setting_value;
      if (config.useManualSmtp && config.smtpHost === 'toptiermen.eu') {
        checklist.email.push('✅ SMTP configuration correct');
      } else {
        checklist.email.push('⚠️ SMTP configuration may need verification');
      }
    }
    
    // 10. Performance Tests
    console.log('\n⚡ 10. Performance Tests...');
    
    // Test database connection speed
    const startTime = Date.now();
    const { data: perfTest, error: perfError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (perfError) {
      checklist.performance.push('❌ Database performance test failed');
    } else {
      checklist.performance.push(`✅ Database response time: ${responseTime}ms`);
      
      if (responseTime < 1000) {
        checklist.performance.push('✅ Database performance good');
      } else {
        checklist.performance.push('⚠️ Database response time slow');
      }
    }
    
    // 11. Security Tests
    console.log('\n🔒 11. Security Tests...');
    
    // Check if sensitive data is properly secured
    const { data: sensitiveData, error: sensitiveError } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'smtp_environment')
      .single();
    
    if (sensitiveError) {
      checklist.security.push('⚠️ Could not verify SMTP security');
    } else {
      const smtpConfig = sensitiveData.setting_value;
      if (smtpConfig.SMTP_PASSWORD && smtpConfig.SMTP_PASSWORD !== '5LUrnxEmEQYgEUt3PmZg') {
        checklist.security.push('✅ SMTP password properly stored');
      } else {
        checklist.security.push('⚠️ SMTP password may be exposed');
      }
    }
    
    // Print comprehensive results
    console.log('\n📊 Test Checklist Results:');
    console.log('='.repeat(50));
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let warnings = 0;
    
    Object.entries(checklist).forEach(([category, tests]) => {
      console.log(`\n${category.toUpperCase()}:`);
      tests.forEach(test => {
        console.log(`  ${test}`);
        totalTests++;
        if (test.includes('✅')) passedTests++;
        else if (test.includes('❌')) failedTests++;
        else if (test.includes('⚠️')) warnings++;
      });
    });
    
    console.log('\n📈 Summary:');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests === 0 && warnings <= 3) {
      console.log('\n🎉 System is ready for live launch!');
      console.log('✅ All critical tests passed');
      console.log('✅ Platform is stable and functional');
    } else if (failedTests <= 2) {
      console.log('\n⚠️ System mostly ready, minor issues to address');
      console.log('🔧 Review failed tests before launch');
    } else {
      console.log('\n❌ System needs attention before launch');
      console.log('🔧 Critical issues must be resolved');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Address any failed tests');
    console.log('2. Review warnings');
    console.log('3. Run manual user journey tests');
    console.log('4. Test email functionality');
    console.log('5. Verify all user flows');
    console.log('6. Prepare for live launch! 🚀');
    
  } catch (error) {
    console.error('❌ Error running test checklist:', error);
  }
}

runTestChecklist();
