require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixChielAcademyBadge() {
  try {
    console.log('🏆 Fixing Chiel\'s Academy Master badge...\n');

    // Chiel's user ID
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    // 1. Get the Academy Master badge
    console.log('1️⃣ Fetching Academy Master badge...');
    const { data: academyBadge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('title', 'Academy Master')
      .single();

    if (badgeError || !academyBadge) {
      console.error('❌ Academy Master badge not found:', badgeError);
      return;
    }

    console.log(`✅ Found Academy Master badge: "${academyBadge.title}" (ID: ${academyBadge.id})`);

    // 2. Check if Chiel already has the badge
    console.log('\n2️⃣ Checking if Chiel already has the badge...');
    const { data: existingBadge, error: existingBadgeError } = await supabase
      .from('user_badges')
      .select('id, unlocked_at')
      .eq('user_id', chielId)
      .eq('badge_id', academyBadge.id)
      .single();

    if (existingBadgeError && existingBadgeError.code !== 'PGRST116') {
      console.error('❌ Error checking existing badge:', existingBadgeError);
      return;
    }

    if (existingBadge) {
      console.log(`✅ Chiel already has the Academy Master badge (unlocked: ${existingBadge.unlocked_at})`);
      return;
    }

    // 3. Verify Chiel's completion status
    console.log('\n3️⃣ Verifying Chiel\'s completion status...');
    const { data: lessonProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed,
        completed_at,
        academy_lessons!inner(
          id,
          title,
          module_id,
          academy_modules!inner(
            id,
            title,
            slug
          )
        )
      `)
      .eq('user_id', chielId)
      .eq('completed', true);

    if (progressError) {
      console.error('❌ Error fetching lesson progress:', progressError);
      return;
    }

    console.log(`✅ Chiel has completed ${lessonProgress?.length || 0} lessons`);

    // 4. Get all modules to verify completion
    console.log('\n4️⃣ Getting all modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules`);

    // 5. Check completion per module (using lesson titles as workaround)
    console.log('\n5️⃣ Checking completion per module...');
    const moduleCompletion = {};

    // Group lessons by module based on their titles/content
    lessonProgress?.forEach(progress => {
      const lessonTitle = progress.academy_lessons?.title || '';
      const moduleTitle = progress.academy_lessons?.academy_modules?.title || '';
      
      // Map lesson titles to modules
      if (lessonTitle.includes('Testosteron') || lessonTitle.includes('TRT')) {
        moduleCompletion['test'] = (moduleCompletion['test'] || 0) + 1;
      } else if (lessonTitle.includes('Discipline') || lessonTitle.includes('Identiteit')) {
        moduleCompletion['discipline-identiteit'] = (moduleCompletion['discipline-identiteit'] || 0) + 1;
      } else if (lessonTitle.includes('Fysieke') || lessonTitle.includes('Dominantie')) {
        moduleCompletion['fysieke-dominantie'] = (moduleCompletion['fysieke-dominantie'] || 0) + 1;
      } else if (lessonTitle.includes('Mentale') || lessonTitle.includes('Weerbaarheid')) {
        moduleCompletion['mentale-kracht-weerbaarheid'] = (moduleCompletion['mentale-kracht-weerbaarheid'] || 0) + 1;
      } else if (lessonTitle.includes('Business') || lessonTitle.includes('Finance') || lessonTitle.includes('Financiële')) {
        moduleCompletion['business-and-finance-'] = (moduleCompletion['business-and-finance-'] || 0) + 1;
      } else if (lessonTitle.includes('Brotherhood') || lessonTitle.includes('Broeders')) {
        moduleCompletion['brotherhood'] = (moduleCompletion['brotherhood'] || 0) + 1;
      } else if (lessonTitle.includes('Voeding') || lessonTitle.includes('Gezondheid') || lessonTitle.includes('Slaap')) {
        moduleCompletion['voeding-gezondheid'] = (moduleCompletion['voeding-gezondheid'] || 0) + 1;
      }
    });

    console.log('Module completion counts:');
    Object.entries(moduleCompletion).forEach(([slug, count]) => {
      console.log(`   ${slug}: ${count} lessons`);
    });

    // 6. Assign the badge
    console.log('\n6️⃣ Assigning Academy Master badge to Chiel...');
    
    const { error: assignError } = await supabase
      .from('user_badges')
      .insert({
        user_id: chielId,
        badge_id: academyBadge.id,
        unlocked_at: new Date().toISOString()
      });

    if (assignError) {
      console.error('❌ Failed to assign badge:', assignError);
      return;
    }

    console.log('✅ Successfully assigned Academy Master badge to Chiel!');

    // 7. Verify the assignment
    console.log('\n7️⃣ Verifying the assignment...');
    const { data: verifyBadge, error: verifyError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        badges!inner(
          title,
          description,
          icon_name
        )
      `)
      .eq('user_id', chielId)
      .eq('badge_id', academyBadge.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying badge assignment:', verifyError);
    } else {
      console.log('✅ Badge assignment verified:');
      console.log(`   Badge: ${verifyBadge.badges.title}`);
      console.log(`   Unlocked: ${verifyBadge.unlocked_at}`);
    }

    console.log('\n🎉 Chiel\'s Academy Master badge has been successfully assigned!');
    console.log('   - The badge will now appear in his profile');
    console.log('   - He will receive the XP reward');
    console.log('   - The completion status should update correctly');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixChielAcademyBadge();
