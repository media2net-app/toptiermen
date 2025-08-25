require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTestosteronContent() {
  try {
    console.log('🔍 Verifying Testosteron lesson content...\n');

    // 1. Find the Testosteron module
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('slug', 'test');

    if (modulesError || !modules || modules.length === 0) {
      console.error('❌ Testosteron module not found');
      return;
    }

    const testosteronModule = modules[0];
    console.log(`✅ Found Testosteron module: "${testosteronModule.title}" (ID: ${testosteronModule.id})`);

    // 2. Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('module_id', testosteronModule.id)
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons in Testosteron module\n`);

    // 3. Check each lesson's content
    lessons?.forEach((lesson, index) => {
      console.log(`\n📝 Lesson ${index + 1}: "${lesson.title}"`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Content length: ${lesson.content?.length || 0} characters`);
      
      if (lesson.content) {
        // Check if content starts with Markdown headers
        const startsWithMarkdown = lesson.content.trim().startsWith('#');
        const hasMarkdownHeaders = lesson.content.includes('##');
        const hasMarkdownLists = lesson.content.includes('- **') || lesson.content.includes('1. **');
        
        console.log(`   Starts with Markdown header: ${startsWithMarkdown ? '✅' : '❌'}`);
        console.log(`   Has Markdown subheaders: ${hasMarkdownHeaders ? '✅' : '❌'}`);
        console.log(`   Has Markdown lists: ${hasMarkdownLists ? '✅' : '❌'}`);
        
        // Show first 200 characters
        const preview = lesson.content.substring(0, 200);
        console.log(`   Preview: "${preview}..."`);
        
        if (!startsWithMarkdown) {
          console.log(`   ⚠️  WARNING: Content doesn't start with Markdown header!`);
        }
      } else {
        console.log(`   ❌ No content found`);
      }
    });

    // 4. Summary
    console.log('\n📊 Content Verification Summary:');
    const lessonsWithContent = lessons?.filter(l => l.content && l.content.length > 100) || [];
    const lessonsWithMarkdown = lessons?.filter(l => l.content && l.content.trim().startsWith('#')) || [];
    
    console.log(`   Total lessons: ${lessons?.length || 0}`);
    console.log(`   Lessons with content: ${lessonsWithContent.length}`);
    console.log(`   Lessons with Markdown: ${lessonsWithMarkdown.length}`);
    
    if (lessonsWithMarkdown.length === lessons?.length) {
      console.log('   ✅ All lessons have proper Markdown content!');
    } else {
      console.log('   ❌ Some lessons are missing proper Markdown content');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyTestosteronContent();
