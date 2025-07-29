import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    const user = session.user;
    console.log('User authenticated:', user.email);

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 });
    }

    if (!userData || userData.role !== 'admin') {
      console.log('User not admin:', user.email, userData?.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Admin access granted for:', user.email);

    // Use admin client to create table
    console.log('Setting up prelaunch_emails table...');

    // Create the table
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

    const { error: createTableError } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL });
    
    if (createTableError) {
      console.error('Error creating table:', createTableError);
      // Try direct SQL execution
      const { error: directError } = await supabaseAdmin.rpc('exec_sql', { 
        sql: 'CREATE TABLE IF NOT EXISTS public.prelaunch_emails (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, name VARCHAR(255), source VARCHAR(100) NOT NULL DEFAULT \'Manual\', status VARCHAR(50) NOT NULL DEFAULT \'active\', package VARCHAR(50), notes TEXT, subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());'
      });
      
      if (directError) {
        console.error('Direct SQL error:', directError);
        return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
      }
    }

    // Create indexes
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_email ON public.prelaunch_emails(email);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_status ON public.prelaunch_emails(status);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_source ON public.prelaunch_emails(source);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_subscribed_at ON public.prelaunch_emails(subscribed_at);
    `;

    await supabaseAdmin.rpc('exec_sql', { sql: indexesSQL });

    // Enable RLS
    await supabaseAdmin.rpc('exec_sql', { sql: 'ALTER TABLE public.prelaunch_emails ENABLE ROW LEVEL SECURITY;' });

    // Create RLS policies
    const policiesSQL = `
      DROP POLICY IF EXISTS "Admins can read all prelaunch emails" ON public.prelaunch_emails;
      CREATE POLICY "Admins can read all prelaunch emails" ON public.prelaunch_emails
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'admin'
              )
          );

      DROP POLICY IF EXISTS "Admins can insert prelaunch emails" ON public.prelaunch_emails;
      CREATE POLICY "Admins can insert prelaunch emails" ON public.prelaunch_emails
          FOR INSERT WITH CHECK (
              EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'admin'
              )
          );

      DROP POLICY IF EXISTS "Admins can update prelaunch emails" ON public.prelaunch_emails;
      CREATE POLICY "Admins can update prelaunch emails" ON public.prelaunch_emails
          FOR UPDATE USING (
              EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'admin'
              )
          );

      DROP POLICY IF EXISTS "Admins can delete prelaunch emails" ON public.prelaunch_emails;
      CREATE POLICY "Admins can delete prelaunch emails" ON public.prelaunch_emails
          FOR DELETE USING (
              EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'admin'
              )
          );
    `;

    await supabaseAdmin.rpc('exec_sql', { sql: policiesSQL });

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

    for (const data of sampleData) {
      try {
        const { error } = await supabaseAdmin
          .from('prelaunch_emails')
          .insert(data);
        
        if (error && !error.message.includes('duplicate key')) {
          console.error('Error inserting data:', error);
        }
      } catch (err) {
        console.error('Error inserting data:', err);
      }
    }

    // Create trigger function and trigger
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_prelaunch_emails_updated_at ON public.prelaunch_emails;
      CREATE TRIGGER update_prelaunch_emails_updated_at 
          BEFORE UPDATE ON public.prelaunch_emails 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    await supabaseAdmin.rpc('exec_sql', { sql: triggerSQL });

    // Grant permissions
    await supabaseAdmin.rpc('exec_sql', { 
      sql: 'GRANT ALL ON public.prelaunch_emails TO authenticated; GRANT USAGE ON SCHEMA public TO authenticated;' 
    });

    console.log('Prelaunch emails setup completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully',
      tableCreated: true,
      sampleDataInserted: sampleData.length
    });

  } catch (error) {
    console.error('Error in setup-prelaunch-emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 