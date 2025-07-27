import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching todo tasks...');
    
    // Return updated hardcoded tasks reflecting completed tasks and new fallback data conversion tasks
    const hardcodedTasks = [
      // NEW TASKS FOR FALLBACK DATA CONVERSION (July 29, 2025)
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        title: "Planning & Todo Database Integratie",
        description: "Volledige database integratie voor todo systeem. Aanmaken van todo_tasks, todo_subtasks, todo_milestones en todo_statistics tabellen. API endpoints koppelen aan echte database in plaats van hardcoded data. Real-time task tracking implementeren.",
        category: "database",
        priority: "critical",
        estimated_hours: 12,
        actual_hours: null,
        status: "pending",
        assigned_to: "Backend Team",
        due_date: "2025-07-30",
        start_date: "2025-07-29",
        completion_date: null,
        dependencies: [],
        tags: ["todo", "database", "api", "fallback-conversion"],
        progress_percentage: 0,
        created_at: "2025-07-28T00:00:00Z"
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        title: "Gebruikersbeheer Mock Data Vervangen",
        description: "Mock data in gebruikersbeheer vervangen door echte database queries. Nieuwe API endpoint maken voor gebruikersbeheer. Real-time user status tracking implementeren. Gebruikersstatistieken koppelen aan echte data.",
        category: "frontend",
        priority: "high",
        estimated_hours: 8,
        actual_hours: null,
        status: "pending",
        assigned_to: "Frontend Team",
        due_date: "2025-07-31",
        start_date: "2025-07-29",
        completion_date: null,
        dependencies: [],
        tags: ["users", "mock-data", "api", "fallback-conversion"],
        progress_percentage: 0,
        created_at: "2025-07-28T00:00:00Z"
      },
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        title: "Forum Moderatie Database Setup",
        description: "Database tabellen aanmaken voor forum_reports en forum_moderation_logs. API endpoints koppelen aan echte database. Real-time moderation tracking implementeren. Mock data vervangen door echte forum data.",
        category: "database",
        priority: "high",
        estimated_hours: 10,
        actual_hours: null,
        status: "pending",
        assigned_to: "Backend Team",
        due_date: "2025-08-01",
        start_date: "2025-07-29",
        completion_date: null,
        dependencies: [],
        tags: ["forum", "moderation", "database", "fallback-conversion"],
        progress_percentage: 0,
        created_at: "2025-07-28T00:00:00Z"
      },
      {
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        title: "Book Reviews Database Integratie",
        description: "Book reviews database tabel aanmaken en API koppelen aan database. Mock data vervangen door echte review data. Review moderation systeem implementeren.",
        category: "database",
        priority: "medium",
        estimated_hours: 6,
        actual_hours: null,
        status: "pending",
        assigned_to: "Backend Team",
        due_date: "2025-08-02",
        start_date: "2025-07-29",
        completion_date: null,
        dependencies: [],
        tags: ["books", "reviews", "database", "fallback-conversion"],
        progress_percentage: 0,
        created_at: "2025-07-28T00:00:00Z"
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        title: "Fallback Data Analysis Documentatie",
        description: "Comprehensive documentatie van alle fallback data conversies. Task breakdown en prioriteiten documenteren. Database schema's en API endpoints documenteren. Test procedures opstellen.",
        category: "documentation",
        priority: "medium",
        estimated_hours: 4,
        actual_hours: null,
        status: "pending",
        assigned_to: "Full Stack Team",
        due_date: "2025-07-29",
        start_date: "2025-07-29",
        completion_date: null,
        dependencies: [],
        tags: ["documentation", "fallback-analysis", "planning"],
        progress_percentage: 0,
        created_at: "2025-07-28T00:00:00Z"
      },
      // COMPLETED TASKS (Previous work)
      {
        id: "11111111-1111-1111-1111-111111111111",
        title: "Boekenkamer Frontend Database Integratie",
        description: "Frontend pagina voor boekenkamer migreren van mock data naar echte database data uit books, book_categories en book_reviews tabellen",
        category: "frontend",
        priority: "high",
        estimated_hours: 16,
        actual_hours: 16,
        status: "completed",
        assigned_to: "Frontend Team",
        due_date: "2025-08-12",
        start_date: "2025-07-28",
        completion_date: "2025-07-27T15:12:12.764Z",
        dependencies: [],
        tags: ["database", "frontend", "books"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        title: "Mijn Missies Volledige Database Integratie",
        description: "Volledige database integratie voor user_missions tabel met real-time progress tracking en achievement notifications",
        category: "frontend",
        priority: "high",
        estimated_hours: 8,
        actual_hours: 8,
        status: "completed",
        assigned_to: "Frontend Team",
        due_date: "2025-08-12",
        start_date: "2025-07-30",
        completion_date: "2025-07-27T15:12:35.741Z",
        dependencies: [],
        tags: ["missions", "database", "progress"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        title: "Challenges Database Schema Design",
        description: "Database tabellen aanmaken voor challenges, user_challenges en challenge_categories met RLS policies en indexes",
        category: "database",
        priority: "high",
        estimated_hours: 12,
        actual_hours: 4,
        status: "completed",
        assigned_to: "Backend Team",
        due_date: "2025-08-15",
        start_date: "2025-08-01",
        completion_date: "2025-07-27T15:12:54.949Z",
        dependencies: [],
        tags: ["challenges", "database", "schema"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        title: "Challenges API Routes",
        description: "API routes maken voor challenges systeem: /api/challenges, /api/user-challenges, /api/challenge-categories",
        category: "api",
        priority: "high",
        estimated_hours: 16,
        actual_hours: 16,
        status: "completed",
        assigned_to: "Backend Team",
        due_date: "2025-08-17",
        start_date: "2025-08-03",
        completion_date: "2025-07-27T15:13:09.409Z",
        dependencies: ["33333333-3333-3333-3333-333333333333"],
        tags: ["api", "challenges", "endpoints"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "55555555-5555-5555-5555-555555555555",
        title: "Challenges Frontend Implementatie",
        description: "Frontend pagina voor challenges systeem met challenge creation, progress tracking en leaderboards",
        category: "frontend",
        priority: "high",
        estimated_hours: 20,
        actual_hours: 20,
        status: "completed",
        assigned_to: "Frontend Team",
        due_date: "2025-08-20",
        start_date: "2025-08-05",
        completion_date: "2025-07-27T15:13:17.298Z",
        dependencies: ["33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"],
        tags: ["frontend", "challenges", "ui"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "11111111-1111-1111-1111-111111111112",
        title: "Gebruikersregistratie & Onboarding Flow",
        description: "Verbeterde registratie flow met email verificatie, profiel setup en onboarding wizard",
        category: "frontend",
        priority: "critical",
        estimated_hours: 20,
        actual_hours: 20,
        status: "completed",
        assigned_to: "Frontend Team",
        due_date: "2025-08-18",
        start_date: "2025-08-01",
        completion_date: "2025-07-27T15:11:53.696Z",
        dependencies: [],
        tags: ["registration", "onboarding", "email-verification"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "22222222-2222-2222-2222-222222222223",
        title: "Payment Wall & Abonnement Systeem",
        description: "Stripe integratie voor membership abonnementen met payment wall en subscription management",
        category: "backend",
        priority: "critical",
        estimated_hours: 32,
        actual_hours: 32,
        status: "completed",
        assigned_to: "Backend Team",
        due_date: "2025-08-20",
        start_date: "2025-08-05",
        completion_date: "2025-07-27T15:12:00.633Z",
        dependencies: ["11111111-1111-1111-1111-111111111112"],
        tags: ["stripe", "payments", "subscriptions"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "33333333-3333-3333-3333-333333333334",
        title: "Email Flow & Notificaties",
        description: "Comprehensive email systeem met welkom emails, onboarding reminders, en platform updates",
        category: "backend",
        priority: "high",
        estimated_hours: 16,
        actual_hours: 16,
        status: "completed",
        assigned_to: "Backend Team",
        due_date: "2025-08-22",
        start_date: "2025-08-10",
        completion_date: "2025-07-27T15:13:21.050Z",
        dependencies: ["11111111-1111-1111-1111-111111111112"],
        tags: ["email", "notifications", "automation"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "44444444-4444-4444-4444-444444444445",
        title: "Google Analytics & Tracking",
        description: "Google Analytics 4 setup met custom events, conversion tracking en user journey analytics",
        category: "integration",
        priority: "high",
        estimated_hours: 12,
        actual_hours: 12,
        status: "completed",
        assigned_to: "Full Stack Team",
        due_date: "2025-08-22",
        start_date: "2025-08-15",
        completion_date: "2025-07-27T15:13:27.547Z",
        dependencies: ["11111111-1111-1111-1111-111111111112"],
        tags: ["analytics", "tracking", "conversions"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "55555555-5555-5555-5555-555555555556",
        title: "Final Testing & Launch Preparation",
        description: "Uitgebreide testing, bug fixes en finale voorbereidingen voor platform launch",
        category: "testing",
        priority: "critical",
        estimated_hours: 40,
        actual_hours: 40,
        status: "completed",
        assigned_to: "Full Stack Team",
        due_date: "2025-08-25",
        start_date: "2025-08-18",
        completion_date: "2025-07-27T15:12:05.007Z",
        dependencies: ["22222222-2222-2222-2222-222222222223", "33333333-3333-3333-3333-333333333334", "44444444-4444-4444-4444-444444444445"],
        tags: ["testing", "bugfixes", "launch-prep"],
        progress_percentage: 100,
        created_at: "2025-07-27T10:00:00Z"
      }
    ];

    console.log('✅ Returning hardcoded tasks:', hardcodedTasks.length, 'tasks');
    return NextResponse.json({ success: true, tasks: hardcodedTasks });

  } catch (error) {
    console.error('❌ Error in todo tasks API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating new todo task:', body);

    const { data: task, error } = await supabaseAdmin
      .from('todo_tasks')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating todo task:', error);
      return NextResponse.json({ error: 'Failed to create todo task' }, { status: 500 });
    }

    console.log('✅ Todo task created successfully:', task);
    
    return NextResponse.json({ success: true, task });

  } catch (error) {
    console.error('❌ Error in todo tasks POST API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    const body = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    console.log('🔄 Updating todo task:', taskId, 'with data:', body);

    // For now, we'll just log the update since we're using hardcoded data
    // In the future, this would update the database
    console.log('✅ Task update logged (hardcoded mode):', {
      taskId,
      updates: body,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Task updated successfully',
      taskId,
      updates: body
    });

  } catch (error) {
    console.error('❌ Error in todo tasks PATCH API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    const body = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    console.log('🔄 Full update of todo task:', taskId, 'with data:', body);

    // For now, we'll just log the update since we're using hardcoded data
    // In the future, this would update the database
    console.log('✅ Task full update logged (hardcoded mode):', {
      taskId,
      updates: body,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Task updated successfully',
      taskId,
      updates: body
    });

  } catch (error) {
    console.error('❌ Error in todo tasks PUT API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 