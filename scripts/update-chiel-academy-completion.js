require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateChielAcademyCompletion() {
  try {
    console.log('🔄 Updating Chiel\'s Academy completion status...\n');

    // Chiel's user ID
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    // 1. Get all published modules
    console.log('1️⃣ Fetching all published modules...');
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

    // 2. Update or create module progress for each module
    console.log('\n2️⃣ Updating module completion status...');
    let updatedCount = 0;
    let createdCount = 0;

    for (const module of modules || []) {
      console.log(`   Processing module: ${module.title} (${module.slug})`);
      
      // Check if module progress already exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_module_progress')
        .select('id, completed')
        .eq('user_id', chielId)
        .eq('module_id', module.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking progress for ${module.title}:`, checkError);
        continue;
      }

      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('user_module_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (updateError) {
          console.error(`❌ Error updating progress for ${module.title}:`, updateError);
        } else {
          console.log(`   ✅ Updated completion for ${module.title}`);
          updatedCount++;
        }
      } else {
        // Create new progress
        const { error: insertError } = await supabase
          .from('user_module_progress')
          .insert({
            user_id: chielId,
            module_id: module.id,
            completed: true,
            completed_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`❌ Error creating progress for ${module.title}:`, insertError);
        } else {
          console.log(`   ✅ Created completion for ${module.title}`);
          createdCount++;
        }
      }
    }

    // 3. Verify the updates
    console.log('\n3️⃣ Verifying completion status...');
    const { data: allProgress, error: verifyError } = await supabase
      .from('user_module_progress')
      .select(`
        id,
        completed,
        completed_at,
        academy_modules!inner(
          title,
          slug
        )
      `)
      .eq('user_id', chielId)
      .eq('completed', true);

    if (verifyError) {
      console.error('❌ Error verifying completion status:', verifyError);
    } else {
      console.log(`✅ Chiel has ${allProgress?.length || 0} completed modules:`);
      allProgress?.forEach(progress => {
        console.log(`   ✅ ${progress.academy_modules.title} (${progress.academy_modules.slug})`);
      });
    }

    // 4. Summary
    console.log('\n🎉 Academy completion status update complete!');
    console.log('=' .repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   Modules processed: ${modules?.length || 0}`);
    console.log(`   Progress records updated: ${updatedCount}`);
    console.log(`   Progress records created: ${createdCount}`);
    console.log(`   Total completed modules: ${allProgress?.length || 0}`);

    if (allProgress?.length === modules?.length) {
      console.log('\n🏆 SUCCESS: Chiel now has 100% Academy completion!');
      console.log('   - All modules are marked as completed');
      console.log('   - The Academy completion status should now show correctly');
      console.log('   - The Academy Master badge has been assigned');
    } else {
      console.log('\n⚠️ WARNING: Not all modules are marked as completed');
      console.log(`   Expected: ${modules?.length || 0}, Found: ${allProgress?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateChielAcademyCompletion();
