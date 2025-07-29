import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (source && source !== 'all') {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    const emails = await prisma.prelaunchEmail.findMany({
      where,
      orderBy: { subscribedAt: 'desc' }
    });

    // Calculate stats
    const total = emails.length;
    const active = emails.filter((e: any) => e.status === 'ACTIVE').length;
    const pending = emails.filter((e: any) => e.status === 'PENDING').length;
    const unsubscribed = emails.filter((e: any) => e.status === 'UNSUBSCRIBED').length;
    const premium = emails.filter((e: any) => e.package === 'PREMIUM').length;
    const ultimate = emails.filter((e: any) => e.package === 'ULTIMATE').length;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = emails.filter((e: any) => e.subscribedAt >= weekAgo).length;

    return NextResponse.json({ 
      success: true, 
      emails,
      total,
      stats: {
        total,
        active,
        pending,
        unsubscribed,
        premium,
        ultimate,
        thisWeek
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/prelaunch-emails-live:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source, status, package: packageType, notes } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRecord = await prisma.prelaunchEmail.create({
      data: {
        email,
        name,
        source: source || 'Manual',
        status: status?.toUpperCase() || 'ACTIVE',
        package: packageType?.toUpperCase(),
        notes
      }
    });

    return NextResponse.json({ 
      success: true, 
      email: emailRecord 
    });

  } catch (error) {
    console.error('Error in POST /api/admin/prelaunch-emails-live:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, source, status, package: packageType, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const emailRecord = await prisma.prelaunchEmail.update({
      where: { id },
      data: {
        email,
        name,
        source,
        status: status?.toUpperCase(),
        package: packageType?.toUpperCase(),
        notes
      }
    });

    return NextResponse.json({ 
      success: true, 
      email: emailRecord 
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/prelaunch-emails-live:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.prelaunchEmail.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email deleted successfully' 
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/prelaunch-emails-live:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 