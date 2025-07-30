import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checking if prelaunch emails table already exists...');

    // First, check if table already exists and has data
    const { data: existingEmails, error: checkError } = await supabaseAdmin
      .from('prelaunch_emails')
      .select('*')
      .limit(5);

    if (!checkError && existingEmails && existingEmails.length > 0) {
      console.log('✅ Prelaunch emails table already exists with data');
      return NextResponse.json({
        success: true,
        message: 'Prelaunch emails table already exists and is ready to use',
        status: 'completed',
        recordsFound: existingEmails.length,
        sampleData: existingEmails
      });
    }

    console.log('🚀 Direct setup prelaunch emails table...');

    // Use admin client directly - no session required for setup
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.prelaunch_emails (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          source VARCHAR(100) NOT NULL DEFAULT 'Manual',
          status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'unsubscribed')),
          package VARCHAR(50) NOT NULL DEFAULT 'BASIC' CHECK (package IN ('BASIC', 'PREMIUM', 'ULTIMATE')),
          notes TEXT,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabaseAdmin.rpc('execute_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.error('Error creating table via RPC:', createError);
      // Try direct SQL execution
      const { error: directError } = await supabaseAdmin
        .from('prelaunch_emails')
        .select('id')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        // Table doesn't exist, we need to create it manually
        return NextResponse.json({ 
          success: false, 
          error: 'Table creation failed. Please create manually in Supabase dashboard.',
          sql: createTableSQL
        });
      }
    }

    console.log('✅ Table created/verified');

    // Enable RLS
    const rlsSQL = `
      ALTER TABLE public.prelaunch_emails ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Admins can manage prelaunch emails" ON public.prelaunch_emails;
      
      CREATE POLICY "Admins can manage prelaunch emails" ON public.prelaunch_emails
          FOR ALL
          TO authenticated
          USING (
              EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'admin'
              )
          );
    `;

    const { error: rlsError } = await supabaseAdmin.rpc('execute_sql', {
      sql: rlsSQL
    });

    if (rlsError) {
      console.log('⚠️ RLS setup failed (expected), but table should work:', rlsError.message);
    }

    // Insert sample data
    const sampleData = [
      {
        email: 'chiel@media2net.nl',
        name: 'Chiel van der Weide',
        source: 'Website Form',
        status: 'active',
        package: 'PREMIUM',
        notes: 'Founder - early adopter'
      },
      {
        email: 'info@vdweide-enterprise.com',
        name: 'Van der Weide Enterprise',
        source: 'Direct Contact',
        status: 'active',
        package: 'PREMIUM',
        notes: 'Enterprise client - interested in team packages'
      },
      {
        email: 'rob@example.com',
        name: 'Rob van Dijk',
        source: 'Social Media',
        status: 'pending',
        package: 'BASIC',
        notes: 'Interested in basic package'
      }
    ];

    for (const data of sampleData) {
      const { error: insertError } = await supabaseAdmin
        .from('prelaunch_emails')
        .upsert(data);

      if (insertError) {
        console.log(`⚠️ Insert warning for ${data.email}:`, insertError.message);
      } else {
        console.log(`✅ Inserted/updated: ${data.email}`);
      }
    }

    // Test the table
    const { data: testData, error: testError } = await supabaseAdmin
      .from('prelaunch_emails')
      .select('*')
      .limit(5);

    if (testError) {
      console.error('❌ Test query failed:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Table test failed: ' + testError.message 
      });
    }

    console.log('🎉 Setup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Prelaunch emails table setup completed',
      recordsCreated: testData?.length || 0,
      sampleData: testData
    });

  } catch (error) {
    console.error('💥 Setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 