import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Create table using SQL
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS prelaunch_emails (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          source VARCHAR(100) NOT NULL DEFAULT 'Manual',
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'pending')),
          package VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createTableError) {
      console.error('Error creating table:', createTableError);
      return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_email ON prelaunch_emails(email);
        CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_status ON prelaunch_emails(status);
        CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_subscribed_at ON prelaunch_emails(subscribed_at);
        CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_source ON prelaunch_emails(source);
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE prelaunch_emails ENABLE ROW LEVEL SECURITY;`
    });

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
    }

    // Create RLS policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Admins can read all prelaunch emails" ON prelaunch_emails;
        DROP POLICY IF EXISTS "Admins can insert prelaunch emails" ON prelaunch_emails;
        DROP POLICY IF EXISTS "Admins can update prelaunch emails" ON prelaunch_emails;
        DROP POLICY IF EXISTS "Admins can delete prelaunch emails" ON prelaunch_emails;
        
        CREATE POLICY "Admins can read all prelaunch emails" ON prelaunch_emails
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );

        CREATE POLICY "Admins can insert prelaunch emails" ON prelaunch_emails
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );

        CREATE POLICY "Admins can update prelaunch emails" ON prelaunch_emails
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );

        CREATE POLICY "Admins can delete prelaunch emails" ON prelaunch_emails
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `
    });

    if (policyError) {
      console.error('Error creating policies:', policyError);
    }

    // Insert initial real data
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO prelaunch_emails (email, name, source, status, package, notes) VALUES
        ('info@vdweide-enterprise.com', 'Van der Weide Enterprise', 'Direct Contact', 'active', 'Premium', 'Enterprise client - interested in team packages'),
        ('fvanhouten1986@gmail.com', 'Frank van Houten', 'Direct Contact', 'active', 'Basic', 'Personal fitness goals - found via LinkedIn'),
        ('hortulanusglobalservices@gmail.com', 'Hortulanus Global Services', 'Direct Contact', 'active', 'Ultimate', 'Business client - looking for comprehensive solution')
        ON CONFLICT (email) DO NOTHING;
      `
    });

    if (insertError) {
      console.error('Error inserting initial data:', insertError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Prelaunch emails table created successfully' 
    });

  } catch (error) {
    console.error('Error in POST /api/admin/setup-prelaunch-emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 