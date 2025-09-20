import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating users from paid prelaunch packages...');

    // Get all paid prelaunch packages
    const { data: paidPackages, error: packagesError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });

    if (packagesError) {
      console.error('❌ Error fetching paid packages:', packagesError);
      return NextResponse.json({ error: 'Failed to fetch paid packages' }, { status: 500 });
    }

    if (!paidPackages || paidPackages.length === 0) {
      console.log('ℹ️ No paid packages found');
      return NextResponse.json({ message: 'No paid packages found', created: 0 });
    }

    console.log(`📦 Found ${paidPackages.length} paid packages`);

    const results = {
      created: 0,
      alreadyExists: 0,
      errors: 0,
      details: [] as any[]
    };

    // Process each paid package
    for (const packageData of paidPackages) {
      try {
        console.log(`👤 Processing: ${packageData.email}`);

        // Check if user already exists
        const { data: existingUser } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000
        });
        
        const userExists = existingUser?.users?.find((user: any) => user.email === packageData.email);
        
        if (userExists) {
          console.log(`👤 User already exists: ${packageData.email}`);
          results.alreadyExists++;
          results.details.push({
            email: packageData.email,
            status: 'already_exists',
            userId: userExists.id
          });
          continue;
        }

        // Create user account
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: packageData.email,
          email_confirm: true,
          user_metadata: {
            full_name: packageData.full_name,
            package_id: packageData.package_id,
            package_name: packageData.package_name,
            payment_period: packageData.payment_period,
            prelaunch_customer: true
          }
        });

        if (createError) {
          console.error(`❌ Error creating user ${packageData.email}:`, createError);
          results.errors++;
          results.details.push({
            email: packageData.email,
            status: 'error',
            error: createError.message
          });
          continue;
        }

        console.log(`✅ User created: ${packageData.email} (${newUser.user?.id})`);

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUser.user!.id,
            email: packageData.email,
            full_name: packageData.full_name,
            username: packageData.email.split('@')[0],
            rank: 'Beginner',
            subscription_tier: packageData.package_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`❌ Error creating profile for ${packageData.email}:`, profileError);
          results.errors++;
          results.details.push({
            email: packageData.email,
            status: 'profile_error',
            error: profileError.message
          });
          continue;
        }

        // Create subscription record
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: newUser.user!.id,
            package_id: packageData.package_id,
            billing_period: packageData.payment_period,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + (packageData.payment_period.includes('yearly') ? 365 : 180) * 24 * 60 * 60 * 1000).toISOString(),
            payment_id: packageData.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (subscriptionError) {
          console.error(`❌ Error creating subscription for ${packageData.email}:`, subscriptionError);
          results.errors++;
          results.details.push({
            email: packageData.email,
            status: 'subscription_error',
            error: subscriptionError.message
          });
          continue;
        }

        results.created++;
        results.details.push({
          email: packageData.email,
          status: 'success',
          userId: newUser.user!.id,
          package: packageData.package_name
        });

        console.log(`✅ Complete setup for ${packageData.email}`);

      } catch (error) {
        console.error(`❌ Error processing ${packageData.email}:`, error);
        results.errors++;
        results.details.push({
          email: packageData.email,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`📊 Results: ${results.created} created, ${results.alreadyExists} already exist, ${results.errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Processed ${paidPackages.length} paid packages`,
      results
    });

  } catch (error) {
    console.error('❌ Error in create-users-from-paid-packages:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
