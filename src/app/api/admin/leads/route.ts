import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch all leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (source) {
      query = query.eq('source', source);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching leads:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error in leads API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const { email, first_name, last_name, full_name, source = 'manual' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        error: 'Valid email address is required'
      }, { status: 400 });
    }

    // Clean and validate names
    let firstName = first_name || '';
    let lastName = last_name || '';
    let fullName = full_name || '';

    // If full name is provided but no first/last, try to split
    if (fullName && !firstName && !lastName) {
      const nameParts = fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = fullName;
      }
    }

    // Clean names (remove extra spaces, capitalize)
    firstName = firstName.trim().replace(/\s+/g, ' ');
    lastName = lastName.trim().replace(/\s+/g, ' ');
    
    // Capitalize first letter of each name
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

    const newLead = {
      email: email.toLowerCase().trim(),
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      source: source,
      status: 'active'
    };

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert([newLead])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating lead:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create lead',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      lead
    });

  } catch (error) {
    console.error('❌ Error in leads API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update lead
export async function PUT(request: NextRequest) {
  try {
    const { id, email, first_name, last_name, full_name, status, source } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Lead ID is required'
      }, { status: 400 });
    }

    const updateData: any = {};
    
    if (email) updateData.email = email.toLowerCase().trim();
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (full_name) updateData.full_name = full_name;
    if (status) updateData.status = status;
    if (source) updateData.source = source;
    
    updateData.updated_at = new Date().toISOString();

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error updating lead:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update lead',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead
    });

  } catch (error) {
    console.error('❌ Error in leads API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete lead
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Lead ID is required'
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting lead:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete lead',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in leads API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
