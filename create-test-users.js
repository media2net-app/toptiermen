const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testUsers = [
  {
    email: 'testuser001@toptiermen.eu',
    password: 'TestUser123!',
    fullName: 'Test User 001'
  },
  {
    email: 'testuser002@toptiermen.eu',
    password: 'TestUser123!',
    fullName: 'Test User 002'
  },
  {
    email: 'testuser003@toptiermen.eu',
    password: 'TestUser123!',
    fullName: 'Test User 003'
  },
  {
    email: 'testuser004@toptiermen.eu',
    password: 'TestUser123!',
    fullName: 'Test User 004'
  },
  {
    email: 'testuser005@toptiermen.eu',
    password: 'TestUser123!',
    fullName: 'Test User 005'
  }
];

async function createTestUsers() {
  console.log('🚀 Creating 5 test users...\n');
  
  const createdUsers = [];
  
  for (const user of testUsers) {
    try {
      console.log(`🔧 Creating user: ${user.email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName
        }
      });

      if (authError) {
        console.error(`❌ Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      if (authData.user) {
        console.log(`✅ Auth user created: ${authData.user.email}`);
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              full_name: user.fullName,
              role: 'USER'
            }
          ]);

        if (profileError) {
          console.error(`❌ Error creating profile for ${user.email}:`, profileError.message);
          // Continue anyway, auth user was created
        } else {
          console.log(`✅ Profile created for: ${user.email}`);
        }
        
        createdUsers.push({
          email: user.email,
          password: user.password,
          fullName: user.fullName,
          id: authData.user.id
        });
      }
      
      console.log(''); // Empty line for readability
      
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error.message);
    }
  }
  
  console.log('🎉 Test Users Created Successfully!\n');
  console.log('📧 Login Credentials:');
  console.log('====================');
  
  createdUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   ID: ${user.id}`);
    console.log('');
  });
  
  console.log('🌐 Login URL: https://platform.toptiermen.eu/login');
  console.log('📱 Dashboard URL: https://platform.toptiermen.eu/dashboard');
}

createTestUsers().catch(console.error);
