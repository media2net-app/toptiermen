// Simple test to check Supabase connectivity
const testSupabaseUrl = 'https://your-project.supabase.co'; // Replace with actual URL

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connectivity
    const response = await fetch(`${testSupabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': 'your-anon-key', // Replace with actual key
        'Authorization': 'Bearer your-anon-key' // Replace with actual key
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Supabase is accessible');
    } else {
      console.log('❌ Supabase returned error:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

// Note: This is a template - you need to replace with actual Supabase URL and key
console.log('⚠️ This is a template script. Please replace the Supabase URL and key with actual values.');
testSupabaseConnection();
