require('dotenv').config({ path: '.env.local' });

const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;

if (!facebookAccessToken) {
  console.error('❌ Missing Facebook access token');
  process.exit(1);
}

async function findTargetingIds() {
  console.log('🔍 Finding Facebook targeting IDs...\n');

  const interestsToSearch = [
    'Fitness',
    'Gezondheid', 
    'Lifestyle',
    'Personal development',
    'Gym',
    'Workout',
    'Bodybuilding',
    'CrossFit',
    'Self improvement',
    'Motivation',
    'Business',
    'Entrepreneurship',
    'Networking',
    'Professional development',
    'Community',
    'Social networking',
    'Friendship',
    'Social activities'
  ];

  const behaviorsToSearch = [
    'Frequent travelers',
    'Early adopters',
    'High income',
    'Business travelers',
    'Parents',
    'Homeowners',
    'Mobile users'
  ];

  console.log('🎯 Searching for Interests...\n');
  
  for (const interest of interestsToSearch) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/search?type=adinterest&q=${encodeURIComponent(interest)}&limit=3&access_token=${facebookAccessToken}`
      );
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ ${interest}:`);
        data.data.forEach(item => {
          console.log(`   ID: ${item.id} | Name: ${item.name} | Audience: ${item.audience_size?.toLocaleString() || 'N/A'}`);
        });
      } else {
        console.log(`❌ ${interest}: No results found`);
      }
    } catch (error) {
      console.log(`❌ ${interest}: Error searching`);
    }
    
    // Wait a bit to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🧠 Searching for Behaviors...\n');
  
  for (const behavior of behaviorsToSearch) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/search?type=adbehavior&q=${encodeURIComponent(behavior)}&limit=3&access_token=${facebookAccessToken}`
      );
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ ${behavior}:`);
        data.data.forEach(item => {
          console.log(`   ID: ${item.id} | Name: ${item.name} | Audience: ${item.audience_size?.toLocaleString() || 'N/A'}`);
        });
      } else {
        console.log(`❌ ${behavior}: No results found`);
      }
    } catch (error) {
      console.log(`❌ ${behavior}: Error searching`);
    }
    
    // Wait a bit to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📝 Note: Use these IDs in your campaign targeting configuration');
}

findTargetingIds()
  .then(() => {
    console.log('\n✅ Targeting ID search completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
