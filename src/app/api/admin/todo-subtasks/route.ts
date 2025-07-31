import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    console.log('📊 Fetching todo subtasks...', taskId ? `for task: ${taskId}` : 'all subtasks');
    
    // Return hardcoded subtasks for now while we fix the table creation issue
    const hardcodedSubtasks = [
      // Subtasks for Boekenkamer Frontend Database Integratie
      {
        id: "subtask-1",
        task_id: "11111111-1111-1111-1111-111111111111",
        title: "Database Schema Analyse",
        description: "Analyseren van bestaande books, book_categories en book_reviews tabellen",
        estimated_hours: 2,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "high",
        order_index: 1,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "subtask-2",
        task_id: "11111111-1111-1111-1111-111111111111",
        title: "API Routes Implementatie",
        description: "Maken van API routes voor boekenkamer data fetching",
        estimated_hours: 4,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "high",
        order_index: 2,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "subtask-3",
        task_id: "11111111-1111-1111-1111-111111111111",
        title: "Frontend Componenten Migratie",
        description: "Migreren van mock data naar echte database data in React componenten",
        estimated_hours: 6,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "high",
        order_index: 3,
        created_at: "2025-07-27T10:00:00Z"
      },
      // Subtasks for Mijn Missies Volledige Database Integratie
      {
        id: "subtask-4",
        task_id: "22222222-2222-2222-2222-222222222222",
        title: "User Missions API Routes",
        description: "Maken van API routes voor user_missions tabel",
        estimated_hours: 2,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "high",
        order_index: 1,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "subtask-5",
        task_id: "22222222-2222-2222-2222-222222222222",
        title: "Progress Tracking Implementatie",
        description: "Implementeren van real-time progress tracking",
        estimated_hours: 3,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "high",
        order_index: 2,
        created_at: "2025-07-27T10:00:00Z"
      },
      // Subtasks for Challenges Database Schema Design
      {
        id: "subtask-6",
        task_id: "33333333-3333-3333-3333-333333333333",
        title: "Challenges Tabel Design",
        description: "Design van challenges tabel met alle benodigde velden",
        estimated_hours: 3,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "high",
        order_index: 1,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "subtask-7",
        task_id: "33333333-3333-3333-3333-333333333333",
        title: "User Challenges Tabel Design",
        description: "Design van user_challenges tabel voor progress tracking",
        estimated_hours: 3,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "high",
        order_index: 2,
        created_at: "2025-07-27T10:00:00Z"
      },
      // Subtasks for Payment Wall & Abonnement Systeem
      {
        id: "subtask-8",
        task_id: "22222222-2222-2222-2222-222222222223",
        title: "Stripe Account Setup",
        description: "Setup van Stripe account en configuratie",
        estimated_hours: 2,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "critical",
        order_index: 1,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "subtask-9",
        task_id: "22222222-2222-2222-2222-222222222223",
        title: "Payment Intent API",
        description: "Implementeren van Stripe Payment Intent API",
        estimated_hours: 6,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "critical",
        order_index: 2,
        created_at: "2025-07-27T10:00:00Z"
      },
      {
        id: "subtask-10",
        task_id: "22222222-2222-2222-2222-222222222223",
        title: "Subscription Management",
        description: "Implementeren van subscription creation en management",
        estimated_hours: 8,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        priority: "critical",
        order_index: 3,
        created_at: "2025-07-27T10:00:00Z"
      }
    ];

    // Filter subtasks by taskId if provided
    const filteredSubtasks = taskId 
      ? hardcodedSubtasks.filter(subtask => subtask.task_id === taskId)
      : hardcodedSubtasks;

    console.log('✅ Returning hardcoded subtasks:', filteredSubtasks.length, 'subtasks');
    return NextResponse.json({ success: true, subtasks: filteredSubtasks });

  } catch (error) {
    console.error('❌ Error in todo subtasks API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating new todo subtask:', body);

    const { data: subtask, error } = await supabaseAdmin
      .from('todo_subtasks')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating todo subtask:', error);
      return NextResponse.json({ error: 'Failed to create todo subtask' }, { status: 500 });
    }

    console.log('✅ Todo subtask created successfully:', subtask);
    
    return NextResponse.json({ success: true, subtask });

  } catch (error) {
    console.error('❌ Error in todo subtasks POST API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 