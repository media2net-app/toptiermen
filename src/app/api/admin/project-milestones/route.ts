import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching project milestones from database...');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let query = supabaseAdmin
      .from('project_milestones')
      .select('*')
      .order('target_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: milestones, error } = await query;

    if (error) {
      console.error('❌ Error fetching project milestones:', error);
      return NextResponse.json({ error: `Failed to fetch milestones: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Project milestones fetched successfully:', milestones?.length || 0, 'milestones');
    
    // Return real project milestones instead of database data
    const realMilestones = [
      {
        id: "1",
        title: "Project Foundation",
        description: "Volledige project setup, planning en initieel database ontwerp",
        target_date: "2025-06-15",
        status: "completed",
        priority: "high",
        total_hours_estimated: 20,
        total_hours_actual: 18,
        progress_percentage: 100,
        tags: ["foundation", "setup", "planning"]
      },
      {
        id: "2",
        title: "Kernfuncties Ontwikkeling",
        description: "Implementeer kernplatform functies inclusief gebruikersbeheer, training en voeding",
        target_date: "2025-06-30",
        status: "completed",
        priority: "high",
        total_hours_estimated: 80,
        total_hours_actual: 82,
        progress_percentage: 100,
        tags: ["core-features", "user-management", "training"]
      },
      {
        id: "3",
        title: "Sociale & Community Functies",
        description: "Bouw brotherhood, forum en sociale interactie functies",
        target_date: "2025-07-10",
        status: "completed",
        priority: "medium",
        total_hours_estimated: 40,
        total_hours_actual: 38,
        progress_percentage: 100,
        tags: ["social", "community", "brotherhood"]
      },
      {
        id: "4",
        title: "Admin Dashboard & Beheer",
        description: "Volledig admin dashboard met volledige database integratie",
        target_date: "2025-07-20",
        status: "completed",
        priority: "high",
        total_hours_estimated: 60,
        total_hours_actual: 263,
        progress_percentage: 100,
        tags: ["admin", "dashboard", "management"]
      },
      {
        id: "5",
        title: "Finale Ontwikkelingsfase",
        description: "Volledig finale functies, testing en launch voorbereiding",
        target_date: "2025-07-27",
        status: "completed",
        priority: "high",
        total_hours_estimated: 40,
        total_hours_actual: 316,
        progress_percentage: 100,
        tags: ["final-phase", "testing", "launch-prep"]
      },
      {
        id: "6",
        title: "Frontend Database Integratie",
        description: "Alle frontend pagina's migreren van mock data naar echte database data",
        target_date: "2025-08-15",
        status: "in_progress",
        priority: "high",
        total_hours_estimated: 80,
        total_hours_actual: 0,
        progress_percentage: 15,
        tags: ["frontend", "database", "integration"]
      },
      {
        id: "7",
        title: "Challenges & Gamification Systeem",
        description: "Volledig challenges systeem met leaderboards en achievement tracking",
        target_date: "2025-08-25",
        status: "in_progress",
        priority: "medium",
        total_hours_estimated: 60,
        total_hours_actual: 0,
        progress_percentage: 0,
        tags: ["challenges", "gamification", "leaderboards"]
      },
      {
        id: "8",
        title: "Voedingsplannen & Mind & Focus",
        description: "Database integratie voor voeding, meditatie en focus features",
        target_date: "2025-09-05",
        status: "in_progress",
        priority: "medium",
        total_hours_estimated: 70,
        total_hours_actual: 0,
        progress_percentage: 0,
        tags: ["nutrition", "mind", "focus", "meditation"]
      },
      {
        id: "9",
        title: "Finance & Business Tools",
        description: "Financiële calculators en business planning tools met database",
        target_date: "2025-09-15",
        status: "in_progress",
        priority: "low",
        total_hours_estimated: 50,
        total_hours_actual: 0,
        progress_percentage: 0,
        tags: ["finance", "business", "calculators"]
      },
      {
        id: "10",
        title: "Social Feed & Evenementen",
        description: "Real-time social feed en evenementen management systeem",
        target_date: "2025-09-25",
        status: "in_progress",
        priority: "low",
        total_hours_estimated: 65,
        total_hours_actual: 0,
        progress_percentage: 0,
        tags: ["social-feed", "events", "real-time"]
      },
      {
        id: "11",
        title: "Performance Optimalisatie & Testing",
        description: "Uitgebreide testing, performance optimalisatie en bug fixes",
        target_date: "2025-10-05",
        status: "in_progress",
        priority: "high",
        total_hours_estimated: 40,
        total_hours_actual: 0,
        progress_percentage: 0,
        tags: ["performance", "testing", "optimization"]
      },
      {
        id: "12",
        title: "Platform Launch - September 2025",
        description: "Finale testing, optimalisatie en platform launch",
        target_date: "2025-09-01",
        status: "in_progress",
        priority: "critical",
        total_hours_estimated: 40,
        total_hours_actual: 0,
        progress_percentage: 25,
        tags: ["launch", "testing", "optimization"]
      }
    ];
    
    return NextResponse.json({ success: true, milestones: realMilestones });

  } catch (error) {
    console.error('❌ Error in project milestones API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 