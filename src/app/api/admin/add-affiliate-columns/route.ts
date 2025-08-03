import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  try {
    console.log('🔧 Adding affiliate columns to profiles table...');

    // First, let's check if we can access the database directly
    const { data: testData, error: testError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Cannot access profiles table:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot access database: ' + testError.message 
      }, { status: 500 });
    }

    console.log('✅ Database connection successful');

    // Try to add columns one by one using direct SQL
    const columnsToAdd = [
      { name: 'affiliate_code', type: 'VARCHAR(50) UNIQUE' },
      { name: 'affiliate_status', type: 'VARCHAR(20) DEFAULT \'inactive\'' },
      { name: 'total_referrals', type: 'INTEGER DEFAULT 0' },
      { name: 'active_referrals', type: 'INTEGER DEFAULT 0' },
      { name: 'total_earned', type: 'DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'monthly_earnings', type: 'DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'last_referral', type: 'TIMESTAMP WITH TIME ZONE' }
    ];

    let addedColumns = 0;
    let errors: string[] = [];

    for (const column of columnsToAdd) {
      try {
        // Try to add the column using a direct SQL approach
        const { error } = await supabaseAdmin.rpc('exec_sql', { 
          sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};` 
        });

        if (error) {
          console.log(`⚠️ Could not add ${column.name}:`, error.message);
          errors.push(`${column.name}: ${error.message}`);
        } else {
          console.log(`✅ Added column: ${column.name}`);
          addedColumns++;
        }
      } catch (err) {
        console.log(`⚠️ Error adding ${column.name}:`, err);
        errors.push(`${column.name}: ${err}`);
      }
    }

    // If we couldn't add columns via RPC, try a different approach
    if (addedColumns === 0) {
      console.log('⚠️ Could not add columns via RPC, trying alternative approach...');
      
      // Try to create a new table with the affiliate fields and copy data
      try {
        const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS profiles_with_affiliate AS 
            SELECT *, 
                   NULL::VARCHAR(50) as affiliate_code,
                   'inactive'::VARCHAR(20) as affiliate_status,
                   0::INTEGER as total_referrals,
                   0::INTEGER as active_referrals,
                   0.00::DECIMAL(10,2) as total_earned,
                   0.00::DECIMAL(10,2) as monthly_earnings,
                   NULL::TIMESTAMP WITH TIME ZONE as last_referral
            FROM profiles;
          `
        });

        if (createError) {
          console.log('⚠️ Could not create new table:', createError.message);
        } else {
          console.log('✅ Created profiles_with_affiliate table');
          return NextResponse.json({ 
            success: true, 
            message: 'Created new table with affiliate fields. Please manually rename tables in Supabase.',
            alternative: true
          });
        }
      } catch (err) {
        console.log('⚠️ Alternative approach failed:', err);
      }
    }

    // Check if any columns were successfully added
    if (addedColumns > 0) {
      console.log(`✅ Successfully added ${addedColumns} columns`);
      
      // Try to update existing profiles with default codes
      try {
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            affiliate_code: 'DEFAULT_CODE',
            affiliate_status: 'inactive',
            total_referrals: 0,
            active_referrals: 0,
            total_earned: 0.00,
            monthly_earnings: 0.00
          })
          .is('affiliate_code', null)
          .select();

        if (updateError) {
          console.log('⚠️ Could not update default codes:', updateError.message);
        } else {
          console.log('✅ Updated default affiliate codes for', updateData?.length || 0, 'profiles');
        }
      } catch (err) {
        console.log('⚠️ Error updating default codes:', err);
      }

      return NextResponse.json({ 
        success: true, 
        message: `Successfully added ${addedColumns} affiliate columns`,
        addedColumns,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // If we get here, we couldn't add any columns
    console.log('❌ Could not add any affiliate columns');
    return NextResponse.json({ 
      success: false, 
      error: 'Could not add affiliate columns. Manual SQL execution required.',
      errors,
      manualSetupRequired: true
    }, { status: 500 });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error: ' + (error as Error).message 
    }, { status: 500 });
  }
} 