import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('💾 Saving platform configuration:', body);
    
    const {
      siteName,
      siteUrl,
      maintenanceMode,
      analyticsEnabled,
      googleAnalyticsId
    } = body;

    // Validate required fields
    if (!siteName || !googleAnalyticsId) {
      return NextResponse.json({
        success: false,
        error: 'Site name and Google Analytics ID are required'
      }, { status: 400 });
    }

    // Save to platform_settings table
    const { error } = await supabase
      .from('platform_settings')
      .upsert({
        id: 1, // Single row for platform settings
        site_name: siteName,
        site_url: siteUrl,
        maintenance_mode: maintenanceMode,
        analytics_enabled: analyticsEnabled,
        google_analytics_id: googleAnalyticsId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('❌ Error saving platform config:', error);
      
      // If table doesn't exist, create it first
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('🔧 Creating platform_settings table...');
        
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS platform_settings (
              id INTEGER PRIMARY KEY DEFAULT 1,
              site_name TEXT NOT NULL,
              site_url TEXT,
              maintenance_mode BOOLEAN DEFAULT FALSE,
              analytics_enabled BOOLEAN DEFAULT FALSE,
              google_analytics_id TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Insert default row if it doesn't exist
            INSERT INTO platform_settings (id, site_name, google_analytics_id, analytics_enabled)
            VALUES (1, 'Top Tier Men', 'G-YT2NR1LKHX', true)
            ON CONFLICT (id) DO NOTHING;
          `
        });

        if (createError) {
          console.error('❌ Error creating platform_settings table:', createError);
          return NextResponse.json({
            success: false,
            error: 'Failed to create platform settings table'
          }, { status: 500 });
        }

        // Try to save again after creating table
        const { error: retryError } = await supabase
          .from('platform_settings')
          .upsert({
            id: 1,
            site_name: siteName,
            site_url: siteUrl,
            maintenance_mode: maintenanceMode,
            analytics_enabled: analyticsEnabled,
            google_analytics_id: googleAnalyticsId,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (retryError) {
          console.error('❌ Error saving platform config after table creation:', retryError);
          return NextResponse.json({
            success: false,
            error: 'Failed to save platform configuration'
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to save platform configuration'
        }, { status: 500 });
      }
    }

    console.log('✅ Platform configuration saved successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Platform configuration saved successfully',
      data: {
        siteName,
        siteUrl,
        maintenanceMode,
        analyticsEnabled,
        googleAnalyticsId
      }
    });

  } catch (error) {
    console.error('❌ Error in save-platform-config:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
