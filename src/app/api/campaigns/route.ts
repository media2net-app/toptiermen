import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Fetching campaigns...');
    
    // For now, return mock data until database is properly set up
    const mockCampaigns = [
      {
        id: '1',
        name: 'TTM Het Merk - Q4 2024',
        video_id: 'sample-video-1',
        video_name: 'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov',
        objective: 'CONSIDERATION',
        budget_amount: 5.00,
        budget_currency: 'EUR',
        budget_type: 'DAILY',
        targeting: {
          ageMin: 25,
          ageMax: 45,
          gender: 'MEN',
          locations: ['Nederland'],
          languages: ['Nederlands'],
          interests: ['Fitness', 'Personal Training'],
          behaviors: ['Frequent gym bezoekers'],
          exclusions: []
        },
        placements: {
          facebook: true,
          instagram: true,
          audienceNetwork: false,
          messenger: false
        },
        ad_format: 'VIDEO',
        status: 'DRAFT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'TTM Zakelijk - Q4 2024',
        video_id: 'sample-video-2',
        video_name: 'TTM_Zakelijk_Reel_01.mov',
        objective: 'AWARENESS',
        budget_amount: 5.00,
        budget_currency: 'EUR',
        budget_type: 'DAILY',
        targeting: {
          ageMin: 30,
          ageMax: 50,
          gender: 'MEN',
          locations: ['Nederland'],
          languages: ['Nederlands'],
          interests: ['Ondernemerschap', 'Business'],
          behaviors: ['LinkedIn users'],
          exclusions: []
        },
        placements: {
          facebook: true,
          instagram: false,
          audienceNetwork: false,
          messenger: false
        },
        ad_format: 'VIDEO',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    console.log('✅ Returning mock campaigns:', mockCampaigns.length);
    return NextResponse.json({ success: true, campaigns: mockCampaigns });
  } catch (error) {
    console.error('Error in campaigns GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🎯 Creating campaign:', body);

    // Validate required fields
    if (!body.name || !body.videoId || !body.budget) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create mock campaign with generated ID
    const mockCampaign = {
      id: `campaign-${Date.now()}`,
      name: body.name,
      video_id: body.videoId,
      video_name: body.videoName,
      objective: body.objective || 'CONSIDERATION',
      budget_amount: body.budget.amount,
      budget_currency: body.budget.currency || 'EUR',
      budget_type: body.budget.type || 'DAILY',
      targeting: body.targeting,
      placements: body.placements,
      ad_format: body.adFormat || 'VIDEO',
      status: body.status || 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Campaign created successfully:', mockCampaign);
    return NextResponse.json({ success: true, campaign: mockCampaign });
  } catch (error) {
    console.error('Error in campaigns POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🎯 Updating campaign:', body);

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const updateData = {
      name: body.name,
      video_id: body.videoId,
      video_name: body.videoName,
      objective: body.objective,
      budget_amount: body.budget.amount,
      budget_currency: body.budget.currency,
      budget_type: body.budget.type,
      targeting: body.targeting,
      placements: body.placements,
      ad_format: body.adFormat,
      status: body.status,
      updated_at: new Date().toISOString()
    };

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    console.log('✅ Campaign updated successfully:', campaign);
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error in campaigns PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }

    console.log('✅ Campaign deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in campaigns DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
