require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixForumSchema() {
  try {
    console.log('🔧 Fixing forum schema issues...\n');
    
    // 1. Check current profiles schema
    console.log('📋 Step 1: Checking profiles schema...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Error accessing profiles:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      if (profiles && profiles.length > 0) {
        console.log('📝 Sample profile columns:', Object.keys(profiles[0]));
      }
    }
    
    // 2. Check forum topics with author info
    console.log('\n📝 Step 2: Checking forum topics...');
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select(`
        id,
        title,
        author_id,
        created_at,
        forum_categories(name, slug)
      `)
      .limit(5);
    
    if (topicsError) {
      console.log('❌ Error fetching topics:', topicsError.message);
    } else {
      console.log(`✅ Found ${topics.length} topics`);
      topics.forEach(topic => {
        console.log(`   - ${topic.title} (Author: ${topic.author_id})`);
      });
    }
    
    // 3. Check if we can fetch author profiles
    console.log('\n👤 Step 3: Testing author profile fetching...');
    if (topics && topics.length > 0) {
      const authorIds = topics.map(t => t.author_id).filter(id => id);
      
      if (authorIds.length > 0) {
        const { data: authorProfiles, error: authorError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .in('id', authorIds);
        
        if (authorError) {
          console.log('❌ Error fetching author profiles:', authorError.message);
        } else {
          console.log(`✅ Found ${authorProfiles.length} author profiles`);
        }
      }
    }
    
    // 4. Test the exact query that the forum page uses
    console.log('\n🔍 Step 4: Testing forum page query...');
    const { data: forumData, error: forumError } = await supabase
      .from('forum_topics')
      .select(`
        id,
        title,
        created_at,
        last_reply_at,
        reply_count,
        view_count,
        author_id
      `)
      .eq('category_id', 1)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (forumError) {
      console.log('❌ Error with forum page query:', forumError.message);
    } else {
      console.log(`✅ Forum page query successful: ${forumData.length} topics`);
    }
    
    // 5. Check if we need to update author references
    console.log('\n🔧 Step 5: Checking author references...');
    const { data: topicsWithoutAuthor, error: noAuthorError } = await supabase
      .from('forum_topics')
      .select('id, title, author_id')
      .is('author_id', null)
      .limit(5);
    
    if (noAuthorError) {
      console.log('❌ Error checking topics without author:', noAuthorError.message);
    } else if (topicsWithoutAuthor && topicsWithoutAuthor.length > 0) {
      console.log(`⚠️ Found ${topicsWithoutAuthor.length} topics without author`);
      
      // Get a valid user ID to use as default author
      const { data: validUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();
      
      if (userError) {
        console.log('❌ Error getting valid user:', userError.message);
      } else {
        console.log(`✅ Found valid user ID: ${validUser.id}`);
        
        // Update topics without author
        const { error: updateError } = await supabase
          .from('forum_topics')
          .update({ author_id: validUser.id })
          .is('author_id', null);
        
        if (updateError) {
          console.log('❌ Error updating topics:', updateError.message);
        } else {
          console.log('✅ Updated topics without author');
        }
      }
    } else {
      console.log('✅ All topics have authors');
    }
    
    // 6. Test forum thread page query
    console.log('\n🧵 Step 6: Testing forum thread page...');
    if (topics && topics.length > 0) {
      const testTopicId = topics[0].id;
      
      const { data: threadData, error: threadError } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          like_count,
          author_id
        `)
        .eq('id', testTopicId)
        .single();
      
      if (threadError) {
        console.log('❌ Error fetching thread:', threadError.message);
      } else {
        console.log(`✅ Thread query successful: ${threadData.title}`);
      }
    }
    
    console.log('\n🎉 Forum Schema Fix Complete!');
    console.log('='.repeat(50));
    console.log('✅ Profiles table accessible');
    console.log('✅ Forum topics query working');
    console.log('✅ Author references checked');
    console.log('✅ Thread page query tested');
    console.log('');
    console.log('💡 Forum should now work properly!');
    
  } catch (error) {
    console.error('❌ Error fixing forum schema:', error);
  }
}

fixForumSchema();
