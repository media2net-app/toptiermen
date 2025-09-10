const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkForumCategories() {
  console.log('🔍 Checking forum categories...');
  
  try {
    // Get all forum categories
    const { data: categories, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('id');

    if (error) {
      console.error('❌ Error fetching categories:', error);
      return;
    }

    console.log(`📊 Found ${categories?.length || 0} forum categories:`);
    
    if (categories && categories.length > 0) {
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (slug: ${category.slug})`);
        console.log(`   Description: ${category.description || 'No description'}`);
        console.log(`   Emoji: ${category.emoji || 'No emoji'}`);
        console.log('');
      });
    } else {
      console.log('❌ No forum categories found');
    }

    // Check if "algemeen" category exists
    const algemeenCategory = categories?.find(cat => cat.slug === 'algemeen');
    if (algemeenCategory) {
      console.log('✅ "Algemeen" category found:', algemeenCategory);
      
      // Get topics for algemeen category
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('category_id', algemeenCategory.id);

      if (topicsError) {
        console.error('❌ Error fetching topics:', topicsError);
      } else {
        console.log(`📝 Found ${topics?.length || 0} topics in "algemeen" category:`);
        topics?.forEach((topic, index) => {
          console.log(`${index + 1}. ${topic.title}`);
          console.log(`   Author ID: ${topic.author_id}`);
          console.log(`   Created: ${topic.created_at}`);
          console.log(`   Pinned: ${topic.is_pinned}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ "Algemeen" category NOT found');
      console.log('💡 Need to create "algemeen" category');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkForumCategories();
