const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSocialFeed() {
  console.log('🧪 Testing social feed image functionality...\n');

  // 1. Check if columns exist
  console.log('1️⃣ Checking database columns...');
  const { data: posts, error: fetchError } = await supabase
    .from('social_posts')
    .select('id, content, image_url, video_url, location, tags')
    .limit(1);

  if (fetchError) {
    console.error('❌ Error fetching posts:', fetchError.message);
    if (fetchError.message.includes('column') && fetchError.message.includes('does not exist')) {
      console.error('💡 Run the SQL script in Supabase Dashboard first!');
    }
    return;
  }
  console.log('✅ Database columns exist!\n');

  // 2. Check storage bucket
  console.log('2️⃣ Checking storage bucket...');
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();

  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError.message);
    return;
  }

  const socialMediaBucket = buckets.find(b => b.name === 'social-media');
  if (!socialMediaBucket) {
    console.error('❌ Storage bucket "social-media" not found!');
    console.log('💡 Create the bucket in Supabase Dashboard > Storage');
    return;
  }
  console.log('✅ Storage bucket "social-media" exists!');
  console.log(`   Public: ${socialMediaBucket.public}`);
  console.log(`   Created: ${new Date(socialMediaBucket.created_at).toLocaleString('nl-NL')}\n`);

  // 3. Test inserting a post with image_url
  console.log('3️⃣ Testing post creation with image_url...');
  
  // Get first user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    console.log('⚠️  Not authenticated, using mock user_id');
    console.log('💡 This test requires authentication or a valid user_id\n');
    
    // Just verify the schema is correct
    const { data: schemaData, error: schemaError } = await supabase
      .from('social_posts')
      .select('*')
      .limit(0);
    
    if (schemaError) {
      console.error('❌ Schema error:', schemaError.message);
    } else {
      console.log('✅ Schema validation successful!');
    }
    return;
  }

  const testImageUrl = 'https://via.placeholder.com/600x400.png?text=Test+Image';
  
  const { data: newPost, error: insertError } = await supabase
    .from('social_posts')
    .insert({
      user_id: userData.user.id,
      content: '🧪 Test post met afbeelding vanuit script',
      post_type: 'text',
      image_url: testImageUrl,
      location: 'Test Locatie',
      tags: ['test', 'automated']
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error creating test post:', insertError.message);
    return;
  }

  console.log('✅ Test post created successfully!');
  console.log('   Post ID:', newPost.id);
  console.log('   Image URL:', newPost.image_url);
  console.log('   Location:', newPost.location);
  console.log('   Tags:', newPost.tags);
  console.log('\n📱 Check the social feed in your browser to see the test post!\n');

  // 4. Clean up test post
  console.log('4️⃣ Cleaning up test post...');
  const { error: deleteError } = await supabase
    .from('social_posts')
    .delete()
    .eq('id', newPost.id);

  if (deleteError) {
    console.error('❌ Error deleting test post:', deleteError.message);
    console.log('💡 You can manually delete it with ID:', newPost.id);
  } else {
    console.log('✅ Test post cleaned up!\n');
  }

  console.log('🎉 All tests passed! Photo upload should work now!');
}

testSocialFeed().catch(console.error);

