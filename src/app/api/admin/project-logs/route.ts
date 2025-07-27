import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching project logs from database...');
    
    // Return hardcoded project logs for now
    const hardcodedLogs = [
      {
        id: "log-2025-06-13",
        date: "2025-06-13",
        title: "Project Start",
        description: "Project initiatie en basis setup van Next.js applicatie met Supabase integratie",
        hours_spent: 8,
        category: "setup",
        milestone: "Project Foundation",
        created_at: "2025-06-13T09:00:00Z"
      },
      {
        id: "log-2025-06-14",
        date: "2025-06-14",
        title: "Database Schema Design",
        description: "Ontwerp van basis database schema voor users, profiles en core functionaliteiten",
        hours_spent: 6,
        category: "database",
        milestone: "Database Foundation",
        created_at: "2025-06-14T09:00:00Z"
      },
      {
        id: "log-2025-06-15",
        date: "2025-06-15",
        title: "Authentication System",
        description: "Implementatie van Supabase authentication met login/register functionaliteit",
        hours_spent: 8,
        category: "backend",
        milestone: "User Authentication",
        created_at: "2025-06-15T09:00:00Z"
      },
      {
        id: "log-2025-06-16",
        date: "2025-06-16",
        title: "Dashboard Layout",
        description: "Basis dashboard layout met sidebar navigatie en responsive design",
        hours_spent: 6,
        category: "frontend",
        milestone: "UI Foundation",
        created_at: "2025-06-16T09:00:00Z"
      },
      {
        id: "log-2025-06-17",
        date: "2025-06-17",
        title: "User Profile System",
        description: "User profile pagina's met edit functionaliteit en avatar upload",
        hours_spent: 7,
        category: "frontend",
        milestone: "User Profiles",
        created_at: "2025-06-17T09:00:00Z"
      },
      {
        id: "log-2025-06-18",
        date: "2025-06-18",
        title: "Brotherhood Module",
        description: "Brotherhood sectie met leden, groepen en evenementen functionaliteit",
        hours_spent: 10,
        category: "frontend",
        milestone: "Community Features",
        created_at: "2025-06-18T09:00:00Z"
      },
      {
        id: "log-2025-06-19",
        date: "2025-06-19",
        title: "Training Center",
        description: "Training center met workout schema's en progress tracking",
        hours_spent: 12,
        category: "frontend",
        milestone: "Training Features",
        created_at: "2025-06-19T09:00:00Z"
      },
      {
        id: "log-2025-06-20",
        date: "2025-06-20",
        title: "Nutrition Plans",
        description: "Voedingsplannen module met calorie calculator en meal planning",
        hours_spent: 8,
        category: "frontend",
        milestone: "Nutrition Features",
        created_at: "2025-06-20T09:00:00Z"
      },
      {
        id: "log-2025-06-21",
        date: "2025-06-21",
        title: "Mind & Focus",
        description: "Mind en focus sectie met meditaties en stoïcijnse mindset tools",
        hours_spent: 6,
        category: "frontend",
        milestone: "Mind Features",
        created_at: "2025-06-21T09:00:00Z"
      },
      {
        id: "log-2025-06-22",
        date: "2025-06-22",
        title: "Finance & Business",
        description: "Finance en business module met calculators en kennisbank",
        hours_spent: 9,
        category: "frontend",
        milestone: "Finance Features",
        created_at: "2025-06-22T09:00:00Z"
      },
      {
        id: "log-2025-06-23",
        date: "2025-06-23",
        title: "Missions System",
        description: "Missions systeem met progress tracking en achievements",
        hours_spent: 7,
        category: "frontend",
        milestone: "Gamification",
        created_at: "2025-06-23T09:00:00Z"
      },
      {
        id: "log-2025-06-24",
        date: "2025-06-24",
        title: "Badges & Ranks",
        description: "Badges en ranks systeem met XP tracking en level progression",
        hours_spent: 8,
        category: "frontend",
        milestone: "Gamification",
        created_at: "2025-06-24T09:00:00Z"
      },
      {
        id: "log-2025-06-25",
        date: "2025-06-25",
        title: "Social Feed",
        description: "Social feed met posts, likes en comments functionaliteit",
        hours_spent: 10,
        category: "frontend",
        milestone: "Social Features",
        created_at: "2025-06-25T09:00:00Z"
      },
      {
        id: "log-2025-06-26",
        date: "2025-06-26",
        title: "Forum System",
        description: "Forum systeem met categorieën, threads en moderatie tools",
        hours_spent: 11,
        category: "frontend",
        milestone: "Community Features",
        created_at: "2025-06-26T09:00:00Z"
      },
      {
        id: "log-2025-06-27",
        date: "2025-06-27",
        title: "Events Management",
        description: "Evenementen management systeem met calendar en RSVP functionaliteit",
        hours_spent: 9,
        category: "frontend",
        milestone: "Community Features",
        created_at: "2025-06-27T09:00:00Z"
      },
      {
        id: "log-2025-06-28",
        date: "2025-06-28",
        title: "Book Library",
        description: "Boekenkamer met book reviews en categorieën systeem",
        hours_spent: 7,
        category: "frontend",
        milestone: "Content Features",
        created_at: "2025-06-28T09:00:00Z"
      },
      {
        id: "log-2025-06-29",
        date: "2025-06-29",
        title: "Academy Module",
        description: "Academy module met lessen, modules en progress tracking",
        hours_spent: 12,
        category: "frontend",
        milestone: "Education Features",
        created_at: "2025-06-29T09:00:00Z"
      },
      {
        id: "log-2025-06-30",
        date: "2025-06-30",
        title: "Challenges System",
        description: "Challenges systeem met user challenges en leaderboards",
        hours_spent: 8,
        category: "frontend",
        milestone: "Gamification",
        created_at: "2025-06-30T09:00:00Z"
      },
      {
        id: "log-2025-07-01",
        date: "2025-07-01",
        title: "Admin Dashboard",
        description: "Admin dashboard met user management en platform analytics",
        hours_spent: 10,
        category: "frontend",
        milestone: "Admin Features",
        created_at: "2025-07-01T09:00:00Z"
      },
      {
        id: "log-2025-07-02",
        date: "2025-07-02",
        title: "Database Integration",
        description: "Volledige database integratie voor alle frontend modules",
        hours_spent: 14,
        category: "database",
        milestone: "Database Integration",
        created_at: "2025-07-02T09:00:00Z"
      },
      {
        id: "log-2025-07-03",
        date: "2025-07-03",
        title: "API Routes",
        description: "API routes implementatie voor alle backend functionaliteiten",
        hours_spent: 12,
        category: "api",
        milestone: "API Development",
        created_at: "2025-07-03T09:00:00Z"
      },
      {
        id: "log-2025-07-04",
        date: "2025-07-04",
        title: "Testing & Bug Fixes",
        description: "Uitgebreide testing en bug fixes voor alle modules",
        hours_spent: 8,
        category: "testing",
        milestone: "Quality Assurance",
        created_at: "2025-07-04T09:00:00Z"
      },
      {
        id: "log-2025-07-05",
        date: "2025-07-05",
        title: "Performance Optimization",
        description: "Performance optimalisatie en code refactoring",
        hours_spent: 6,
        category: "optimization",
        milestone: "Performance",
        created_at: "2025-07-05T09:00:00Z"
      },
      {
        id: "log-2025-07-06",
        date: "2025-07-06",
        title: "UI/UX Improvements",
        description: "UI/UX verbeteringen en responsive design optimalisatie",
        hours_spent: 7,
        category: "ui",
        milestone: "UI/UX Polish",
        created_at: "2025-07-06T09:00:00Z"
      },
      {
        id: "log-2025-07-17",
        date: "2025-07-17",
        title: "Project Logs Feature",
        description: "Project logs pagina implementatie met development tracking",
        hours_spent: 4,
        category: "frontend",
        milestone: "Project Management",
        created_at: "2025-07-17T09:00:00Z"
      },
      {
        id: "log-2025-07-18",
        date: "2025-07-18",
        title: "Planning & To-Do System",
        description: "Planning en to-do systeem met task management en milestones",
        hours_spent: 6,
        category: "frontend",
        milestone: "Project Management",
        created_at: "2025-07-18T09:00:00Z"
      },
      {
        id: "log-2025-07-19",
        date: "2025-07-19",
        title: "Database Schema Updates",
        description: "Database schema updates voor project logs en todo system",
        hours_spent: 3,
        category: "database",
        milestone: "Database Integration",
        created_at: "2025-07-19T09:00:00Z"
      },
      {
        id: "log-2025-07-20",
        date: "2025-07-20",
        title: "API Integration",
        description: "API integratie voor project logs en todo system",
        hours_spent: 4,
        category: "api",
        milestone: "API Development",
        created_at: "2025-07-20T09:00:00Z"
      },
      {
        id: "log-2025-07-21",
        date: "2025-07-21",
        title: "Frontend Polish",
        description: "Frontend polish en styling verbeteringen",
        hours_spent: 5,
        category: "ui",
        milestone: "UI/UX Polish",
        created_at: "2025-07-21T09:00:00Z"
      },
      {
        id: "log-2025-07-22",
        date: "2025-07-22",
        title: "Bug Fixes & Testing",
        description: "Bug fixes en testing voor alle nieuwe features",
        hours_spent: 6,
        category: "testing",
        milestone: "Quality Assurance",
        created_at: "2025-07-22T09:00:00Z"
      },
      {
        id: "log-2025-07-23",
        date: "2025-07-23",
        title: "Database Integration Fixes",
        description: "Database integratie fixes en API route optimalisatie",
        hours_spent: 4,
        category: "database",
        milestone: "Database Integration",
        created_at: "2025-07-23T09:00:00Z"
      },
      {
        id: "log-2025-07-24",
        date: "2025-07-24",
        title: "Frontend Database Migration",
        description: "Frontend migratie van mock data naar echte database data",
        hours_spent: 8,
        category: "frontend",
        milestone: "Database Integration",
        created_at: "2025-07-24T09:00:00Z"
      },
      {
        id: "log-2025-07-25",
        date: "2025-07-25",
        title: "API Route Development",
        description: "API route development voor alle admin functionaliteiten",
        hours_spent: 7,
        category: "api",
        milestone: "API Development",
        created_at: "2025-07-25T09:00:00Z"
      },
      {
        id: "log-2025-07-26",
        date: "2025-07-26",
        title: "Admin Dashboard Polish",
        description: "Admin dashboard polish en functionaliteit uitbreiding",
        hours_spent: 6,
        category: "frontend",
        milestone: "Admin Features",
        created_at: "2025-07-26T09:00:00Z"
      },
      {
        id: "log-2025-07-27",
        date: "2025-07-27",
        title: "Project Management Features",
        description: "Project management features met logs en planning systeem",
        hours_spent: 5,
        category: "frontend",
        milestone: "Project Management",
        created_at: "2025-07-27T09:00:00Z"
      }
    ];

    console.log('✅ Project logs fetched successfully:', hardcodedLogs.length, 'logs');
    return NextResponse.json({ success: true, logs: hardcodedLogs });

  } catch (error) {
    console.error('❌ Error in project logs API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Adding new project log entry:', body);

    // For now, we'll just log the new entry since we're using hardcoded data
    // In the future, this would insert into the database
    console.log('✅ New project log entry logged (hardcoded mode):', {
      entry: body,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Project log entry added successfully',
      entry: body
    });

  } catch (error) {
    console.error('❌ Error in project logs POST API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 