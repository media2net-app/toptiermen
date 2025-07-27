import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching platform settings from database...');
    
    const { searchParams } = new URL(request.url);
    const settingType = searchParams.get('type');
    const isPublic = searchParams.get('public');

    let query = supabaseAdmin
      .from('platform_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (settingType) {
      query = query.eq('setting_type', settingType);
    }

    if (isPublic !== null) {
      query = query.eq('is_public', isPublic === 'true');
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('❌ Error fetching platform settings:', error);
      return NextResponse.json({ error: `Failed to fetch settings: ${error.message}` }, { status: 500 });
    }

    // Convert to key-value format for easier frontend consumption
    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = {
        ...setting.setting_value,
        _metadata: {
          type: setting.setting_type,
          description: setting.description,
          is_public: setting.is_public,
          updated_at: setting.updated_at
        }
      };
      return acc;
    }, {} as Record<string, any>) || {};

    console.log('✅ Platform settings fetched successfully:', Object.keys(settingsMap).length, 'settings');
    return NextResponse.json({ success: true, settings: settingsMap });

  } catch (error) {
    console.error('❌ Error in platform settings API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📝 Updating platform settings...');
    
    const body = await request.json();
    const { settingKey, settingValue } = body;

    if (!settingKey || settingValue === undefined) {
      return NextResponse.json({ error: 'Setting key and value are required' }, { status: 400 });
    }

    const { data: setting, error } = await supabaseAdmin
      .from('platform_settings')
      .update({ 
        setting_value: settingValue,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', settingKey)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating platform setting:', error);
      return NextResponse.json({ error: `Failed to update setting: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Platform setting updated successfully:', settingKey);
    return NextResponse.json({ success: true, setting });

  } catch (error) {
    console.error('❌ Error in platform settings PUT API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 