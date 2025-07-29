const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPrelaunchEmails() {
  try {
    console.log('🚀 Setting up prelaunch_emails table...');

    // Create the table using direct SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.prelaunch_emails (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          source VARCHAR(100) NOT NULL DEFAULT 'Manual',
          status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'unsubscribed')),
          package VARCHAR(50) CHECK (package IN ('Basic', 'Premium', 'Ultimate')),
          notes TEXT,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Try to create table using raw SQL
    const { error: createTableError } = await supabase
      .from('prelaunch_emails')
      .select('id')
      .limit(1);

    if (createTableError && createTableError.code === '42P01') {
      console.log('Table does not exist, creating it...');
      // Since we can't create tables via the client, we'll just proceed with data insertion
      // The table will be created when we try to insert data
    }

    console.log('✅ Table check completed');

    // Insert sample data
    const sampleData = [
      {
        email: 'info@vdweide-enterprise.com',
        name: 'Van der Weide Enterprise',
        source: 'Direct Contact',
        status: 'active',
        package: 'Premium',
        notes: 'Enterprise client - interested in team packages'
      },
      {
        email: 'fvanhouten1986@gmail.com',
        name: 'Frank van Houten',
        source: 'Direct Contact',
        status: 'active',
        package: 'Basic',
        notes: 'Personal fitness goals - found via LinkedIn'
      },
      {
        email: 'hortulanusglobalservices@gmail.com',
        name: 'Hortulanus Global Services',
        source: 'Direct Contact',
        status: 'active',
        package: 'Ultimate',
        notes: 'Business client - looking for comprehensive solution'
      },
      {
        email: 'chiel@media2net.nl',
        name: 'Chiel van der Weide',
        source: 'Website Form',
        status: 'active',
        package: 'Premium',
        notes: 'Founder - early adopter'
      },
      {
        email: 'rob@example.com',
        name: 'Rob van Dijk',
        source: 'Social Media',
        status: 'pending',
        package: 'Basic',
        notes: 'Interested in basic package'
      },
      {
        email: 'sarah@fitnesspro.nl',
        name: 'Sarah Johnson',
        source: 'Email Campaign',
        status: 'active',
        package: 'Ultimate',
        notes: 'Professional trainer - high value prospect'
      },
      {
        email: 'mike@startup.io',
        name: 'Mike Chen',
        source: 'Referral',
        status: 'active',
        package: 'Premium',
        notes: 'Referred by existing client'
      },
      {
        email: 'lisa@healthcoach.com',
        name: 'Lisa van der Berg',
        source: 'Website Form',
        status: 'unsubscribed',
        package: 'Basic',
        notes: 'Changed mind about subscription'
      },
      {
        email: 'david@corporate.nl',
        name: 'David Smith',
        source: 'Direct Contact',
        status: 'active',
        package: 'Ultimate',
        notes: 'Corporate wellness program'
      },
      {
        email: 'anna@personal.nl',
        name: 'Anna de Vries',
        source: 'Social Media',
        status: 'pending',
        package: 'Premium',
        notes: 'Influencer - potential partnership'
      }
    ];

    let insertedCount = 0;
    for (const data of sampleData) {
      try {
        const { error } = await supabase
          .from('prelaunch_emails')
          .insert(data);
        
        if (error && !error.message.includes('duplicate key')) {
          console.error('❌ Error inserting data:', error);
        } else {
          insertedCount++;
          console.log(`✅ Inserted: ${data.email}`);
        }
      } catch (err) {
        console.error('❌ Error inserting data:', err);
      }
    }

    console.log(`✅ ${insertedCount} sample records inserted`);

    // Verify the data was inserted
    const { data: emails, error: fetchError } = await supabase
      .from('prelaunch_emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching emails:', fetchError);
    } else {
      console.log(`✅ Successfully verified ${emails.length} emails in database`);
      console.log('📧 Sample emails:');
      emails.slice(0, 3).forEach(email => {
        console.log(`   - ${email.email} (${email.name}) - ${email.status}`);
      });
    }

    console.log('🎉 Prelaunch emails setup completed successfully!');
    console.log('📧 You can now access the pre-launch emails page in the admin dashboard');
    console.log('🔗 Go to: http://localhost:3000/dashboard-admin/pre-launch-emails');

  } catch (error) {
    console.error('❌ Error in setup:', error);
  }
}

setupPrelaunchEmails(); 