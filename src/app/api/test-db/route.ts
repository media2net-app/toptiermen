import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const emailCount = await prisma.prelaunchEmail.count();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      emailCount 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 