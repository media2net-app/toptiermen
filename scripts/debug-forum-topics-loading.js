require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugForumTopicsLoading() {
  try {
    console.log('🔍 Debugging forum topics loading issue...\n');
    
    // 1. Test the exact query that the frontend uses
    console.log('📝 Step 1: Testing frontend query...');
    const { data: topicsData, error } = await supabase
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
      .eq('category_id', 1) // Fitness & Gezondheid category
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error with frontend query:', error.message);
      console.log('Error details:', error);
      return;
    }

    console.log(`✅ Frontend query successful: ${topicsData.length} topics found`);
    topicsData.forEach(topic => {
      console.log(`   - ID: ${topic.id} | ${topic.title} | Author: ${topic.author_id}`);
    });

    // 2. Test user profiles fetching
    console.log('\n👤 Step 2: Testing user profiles fetching...');
    const userIds = new Set();
    topicsData?.forEach(topic => {
      if (topic.author_id) userIds.add(topic.author_id);
    });

    console.log(`📊 Unique user IDs found: ${userIds.size}`);
    console.log('User IDs:', Array.from(userIds));

    if (userIds.size > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.log('❌ Error fetching profiles:', profilesError.message);
      } else {
        console.log(`✅ Profiles fetched: ${profiles.length} profiles`);
        profiles.forEach(profile => {
          console.log(`   - ${profile.id}: ${profile.full_name}`);
        });
      }
    }

    // 3. Test the complete data processing
    console.log('\n🔄 Step 3: Testing complete data processing...');
    
    // Simulate the frontend processing
    const profiles = userIds.size > 0 ? await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', Array.from(userIds)) : { data: [] };

    const profilesMap = {};
    profiles.data?.forEach(profile => {
      profilesMap[profile.id] = profile;
    });

    const getAuthorInfo = (authorId) => {
      const profile = profilesMap[authorId];
      if (profile) {
        const nameParts = profile.full_name.split(' ');
        return {
          first_name: nameParts[0] || 'User',
          last_name: nameParts.slice(1).join(' ') || '',
          avatar_url: profile.avatar_url
        };
      }
      return {
        first_name: 'User',
        last_name: '',
        avatar_url: undefined
      };
    };

    const processedTopics = (topicsData || []).map((topic) => ({
      id: topic.id,
      title: topic.title,
      created_at: topic.created_at,
      last_reply_at: topic.last_reply_at,
      reply_count: topic.reply_count || 0,
      view_count: topic.view_count || 0,
      author: getAuthorInfo(topic.author_id)
    }));

    console.log(`✅ Data processing successful: ${processedTopics.length} processed topics`);
    processedTopics.forEach(topic => {
      console.log(`   - ${topic.title} | Author: ${topic.author.first_name} ${topic.author.last_name}`);
    });

    // 4. Test browser console simulation
    console.log('\n🌐 Step 4: Simulating browser environment...');
    console.log('📊 Data that should be available in browser:');
    console.log('topicsData:', JSON.stringify(topicsData, null, 2));
    console.log('processedTopics:', JSON.stringify(processedTopics, null, 2));

    // 5. Check for potential issues
    console.log('\n🔍 Step 5: Checking for potential issues...');
    
    // Check if topics have required fields
    const topicsWithMissingFields = topicsData.filter(topic => 
      !topic.title || !topic.author_id || !topic.created_at
    );
    
    if (topicsWithMissingFields.length > 0) {
      console.log(`⚠️ Found ${topicsWithMissingFields.length} topics with missing fields:`);
      topicsWithMissingFields.forEach(topic => {
        console.log(`   - ID: ${topic.id} | Title: ${topic.title} | Author: ${topic.author_id}`);
      });
    } else {
      console.log('✅ All topics have required fields');
    }

    // Check for null/undefined values
    const topicsWithNullValues = topicsData.filter(topic => 
      topic.title === null || topic.title === undefined ||
      topic.author_id === null || topic.author_id === undefined
    );
    
    if (topicsWithNullValues.length > 0) {
      console.log(`⚠️ Found ${topicsWithNullValues.length} topics with null values:`);
      topicsWithNullValues.forEach(topic => {
        console.log(`   - ID: ${topic.id} | Title: ${topic.title} | Author: ${topic.author_id}`);
      });
    } else {
      console.log('✅ No topics with null values');
    }

    console.log('\n🎉 Forum Topics Loading Debug Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Topics found: ${topicsData.length}`);
    console.log(`✅ Profiles found: ${profiles.data?.length || 0}`);
    console.log(`✅ Processed topics: ${processedTopics.length}`);
    console.log('');
    console.log('💡 If topics still don\'t load in browser:');
    console.log('1. Check browser console for errors');
    console.log('2. Verify network requests');
    console.log('3. Check authentication status');
    console.log('4. Verify RLS policies');
    
  } catch (error) {
    console.error('❌ Error debugging forum topics loading:', error);
  }
}

debugForumTopicsLoading();
