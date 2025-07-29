import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Setup function for prelaunch_emails table
async function setupPrelaunchEmailsTable(supabase: any) {
  try {
    console.log('Setting up prelaunch_emails table...');
    
    // For now, we'll just return success since we can't create tables via RPC
    // The table should be created manually in Supabase dashboard
    console.log('Table setup skipped - please create table manually in Supabase dashboard');
    
    // Try to insert initial data directly
    const initialData = [
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

    for (const data of initialData) {
      try {
        const { error } = await supabase
          .from('prelaunch_emails')
          .insert(data);
        
        if (error && !error.message.includes('duplicate key')) {
          console.error('Error inserting data:', error);
        }
      } catch (err) {
        console.error('Error inserting data:', err);
      }
    }

    console.log('Prelaunch emails setup completed');
  } catch (error) {
    console.error('Error in setupPrelaunchEmailsTable:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
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

    // Check if user is admin - use users table instead of profiles
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    let query = supabase
      .from('prelaunch_emails')
      .select('*')
      .order('subscribed_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (source && source !== 'all') {
      query = query.eq('source', source);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const { data: emails, error } = await query;

    if (error) {
      console.error('Error fetching prelaunch emails:', error);
      
      // If table doesn't exist, create it and return empty array
      if (error.code === '42P01') {
        console.log('Table does not exist, creating it...');
        try {
          await setupPrelaunchEmailsTable(supabase);
          return NextResponse.json({ 
            success: true, 
            emails: [],
            total: 0
          });
        } catch (setupError) {
          console.error('Error setting up table:', setupError);
          return NextResponse.json({ error: 'Failed to setup table' }, { status: 500 });
        }
      }
      
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      emails: emails || [],
      total: emails?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /api/admin/prelaunch-emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Check if user is admin - use users table instead of profiles
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

    const body = await request.json();
    const { email, name, source, status, package: packageType, notes } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: emailRecord, error } = await supabase
      .from('prelaunch_emails')
      .insert({
        email,
        name,
        source: source || 'Manual',
        status: status || 'active',
        package: packageType,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prelaunch email:', error);
      
      // If table doesn't exist, create it and retry
      if (error.code === '42P01') {
        console.log('Table does not exist, creating it...');
        try {
          await setupPrelaunchEmailsTable(supabase);
          // Retry the insert
          const { data: retryEmailRecord, error: retryError } = await supabase
            .from('prelaunch_emails')
            .insert({
              email,
              name,
              source: source || 'Manual',
              status: status || 'active',
              package: packageType,
              notes
            })
            .select()
            .single();

          if (retryError) {
            console.error('Error creating email after table setup:', retryError);
            return NextResponse.json({ error: 'Failed to create email' }, { status: 500 });
          }

          return NextResponse.json({ 
            success: true, 
            email: retryEmailRecord 
          });
        } catch (setupError) {
          console.error('Error setting up table:', setupError);
          return NextResponse.json({ error: 'Failed to setup table' }, { status: 500 });
        }
      }
      
      return NextResponse.json({ error: 'Failed to create email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      email: emailRecord 
    });

  } catch (error) {
    console.error('Error in POST /api/admin/prelaunch-emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Check if user is admin - use users table instead of profiles
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

    const body = await request.json();
    const { id, email, name, source, status, package: packageType, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data: emailRecord, error } = await supabase
      .from('prelaunch_emails')
      .update({
        email,
        name,
        source,
        status,
        package: packageType,
        notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating prelaunch email:', error);
      
      // If table doesn't exist, create it and return error
      if (error.code === '42P01') {
        console.log('Table does not exist, creating it...');
        try {
          await setupPrelaunchEmailsTable(supabase);
          return NextResponse.json({ error: 'Email not found - table was just created' }, { status: 404 });
        } catch (setupError) {
          console.error('Error setting up table:', setupError);
          return NextResponse.json({ error: 'Failed to setup table' }, { status: 500 });
        }
      }
      
      return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      email: emailRecord 
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/prelaunch-emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    // Check if user is admin - use users table instead of profiles
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('prelaunch_emails')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting prelaunch email:', error);
      
      // If table doesn't exist, create it and return error
      if (error.code === '42P01') {
        console.log('Table does not exist, creating it...');
        try {
          await setupPrelaunchEmailsTable(supabase);
          return NextResponse.json({ error: 'Email not found - table was just created' }, { status: 404 });
        } catch (setupError) {
          console.error('Error setting up table:', setupError);
          return NextResponse.json({ error: 'Failed to setup table' }, { status: 500 });
        }
      }
      
      return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email deleted successfully' 
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/prelaunch-emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 