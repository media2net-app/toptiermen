import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching todo milestones...');
    
    // Return hardcoded milestones for now while we fix the table creation issue
    const hardcodedMilestones = [
      // NEW MILESTONE FOR FALLBACK DATA CONVERSION
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        title: "Fallback Data naar Echte Data Conversie",
        description: "Systematische conversie van alle fallback/mock data naar echte database data in admin dashboard. Planning & Todo, Gebruikersbeheer, Forum Moderatie en Book Reviews volledig database-gekoppeld maken.",
        target_date: "2025-08-05",
        status: "in_progress",
        priority: "critical",
        total_tasks: 5,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["fallback-conversion", "database", "admin-dashboard", "api"]
      },
      // NEW MILESTONE FOR PLATFORM ENHANCEMENTS
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        title: "Platform Enhancement & Monetization",
        description: "Comprehensive platform verbeteringen: affiliate marketing, product pagina, test gebruikers systeem, Stripe/GA integratie, marketingplan en 7-dagen proefperiode. Focus op user acquisition en monetization.",
        target_date: "2025-08-15",
        status: "planned",
        priority: "high",
        total_tasks: 6,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["monetization", "affiliate", "product-page", "trial", "marketing"]
      },
      // NEW MILESTONE FOR PLATFORM OPTIMIZATION
      {
        id: "platform-optimization-milestone-2025",
        title: "Platform Optimalisatie & Stabiliteit",
        description: "Kritieke platform optimalisaties: Performance verbeteringen, security hardening, mobile responsiveness, accessibility compliance, error handling, caching, SEO optimalisatie en code kwaliteit. Focus op user experience en platform stabiliteit voor schaalbaarheid.",
        target_date: "2025-08-20",
        status: "planned",
        priority: "critical",
        total_tasks: 8,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["performance", "security", "mobile", "accessibility", "optimization", "stability", "ux", "seo"]
      },
      {
        id: "11111111-1111-1111-1111-111111111113",
        title: "Frontend Database Integratie",
        description: "Alle frontend pagina's migreren van mock data naar echte database data",
        target_date: "2025-08-12",
        status: "planned",
        priority: "high",
        total_tasks: 2,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["frontend", "database", "integration"]
      },
      {
        id: "22222222-2222-2222-2222-222222222224",
        title: "Challenges & Gamification Systeem",
        description: "Volledig challenges systeem met leaderboards en achievement tracking",
        target_date: "2025-08-20",
        status: "planned",
        priority: "high",
        total_tasks: 3,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["challenges", "gamification", "leaderboards"]
      },
      {
        id: "33333333-3333-3333-3333-333333333335",
        title: "Voedingsplannen & Mind & Focus",
        description: "Database integratie voor voeding, meditatie en focus features",
        target_date: "2025-08-30",
        status: "planned",
        priority: "medium",
        total_tasks: 5,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["nutrition", "mind", "focus", "meditation"]
      },
      {
        id: "44444444-4444-4444-4444-444444444446",
        title: "Finance & Business Tools",
        description: "Financiële calculators en business planning tools met database",
        target_date: "2025-09-05",
        status: "planned",
        priority: "low",
        total_tasks: 1,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["finance", "business", "calculators"]
      },
      {
        id: "55555555-5555-5555-5555-555555555557",
        title: "Social Feed & Evenementen",
        description: "Real-time social feed en evenementen management systeem",
        target_date: "2025-09-15",
        status: "planned",
        priority: "low",
        total_tasks: 2,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["social-feed", "events", "real-time"]
      },
      {
        id: "66666666-6666-6666-6666-666666666667",
        title: "Performance Optimalisatie & Testing",
        description: "Uitgebreide testing, performance optimalisatie en bug fixes",
        target_date: "2025-08-30",
        status: "planned",
        priority: "high",
        total_tasks: 2,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["performance", "testing", "optimization"]
      },
      {
        id: "77777777-7777-7777-7777-777777777778",
        title: "Gebruikersregistratie & Payment Systeem",
        description: "Registratie flow, payment wall en abonnement management",
        target_date: "2025-08-20",
        status: "planned",
        priority: "critical",
        total_tasks: 2,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["registration", "payments", "subscriptions"]
      },
      {
        id: "88888888-8888-8888-8888-888888888889",
        title: "Email & Analytics Integratie",
        description: "Email flow, notificaties en Google Analytics tracking",
        target_date: "2025-08-22",
        status: "planned",
        priority: "high",
        total_tasks: 2,
        completed_tasks: 0,
        progress_percentage: 0,
        tags: ["email", "analytics", "tracking"]
      },
      {
        id: "99999999-9999-9999-9999-999999999990",
        title: "Platform Launch - September 2025",
        description: "Finale testing, optimalisatie en platform launch",
        target_date: "2025-09-10",
        status: "in_progress",
        priority: "critical",
        total_tasks: 1,
        completed_tasks: 0,
        progress_percentage: 25,
        tags: ["launch", "testing", "optimization"]
      }
    ];

    console.log('✅ Returning hardcoded milestones:', hardcodedMilestones.length, 'milestones');
    return NextResponse.json({ success: true, milestones: hardcodedMilestones });

  } catch (error) {
    console.error('❌ Error in todo milestones API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating new todo milestone:', body);

    const { data: milestone, error } = await supabaseAdmin
      .from('todo_milestones')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating todo milestone:', error);
      return NextResponse.json({ error: 'Failed to create todo milestone' }, { status: 500 });
    }

    console.log('✅ Todo milestone created successfully:', milestone);
    
    return NextResponse.json({ success: true, milestone });

  } catch (error) {
    console.error('❌ Error in todo milestones POST API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 