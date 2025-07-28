import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      proposal_type,
      proposal_amount,
      client_name,
      client_company,
      client_email,
      signature_date,
      proposal_details
    } = body;

    // Validate required fields
    if (!proposal_type || !proposal_amount || !client_name || !client_company || !client_email || !signature_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert signature into database
    const { data: signature, error } = await supabase
      .from('proposal_signatures')
      .insert({
        user_id: user.id,
        proposal_type,
        proposal_amount: parseFloat(proposal_amount),
        client_name,
        client_company,
        client_email,
        signature_date,
        proposal_details: proposal_details || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving signature:', error);
      return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      signature,
      message: 'Signature saved successfully' 
    });

  } catch (error) {
    console.error('Error in POST /api/proposal-signatures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const proposal_type = searchParams.get('proposal_type');

    // Build query
    let query = supabase
      .from('proposal_signatures')
      .select('*')
      .eq('user_id', user.id)
      .order('signed_at', { ascending: false });

    // Filter by proposal type if provided
    if (proposal_type) {
      query = query.eq('proposal_type', proposal_type);
    }

    const { data: signatures, error } = await query;

    if (error) {
      console.error('Error fetching signatures:', error);
      return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      signatures: signatures || [],
      has_signed: signatures && signatures.length > 0
    });

  } catch (error) {
    console.error('Error in GET /api/proposal-signatures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 