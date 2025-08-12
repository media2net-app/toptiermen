import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up todo database...');

    // First, try to create the table by inserting a test record
    const { data: testTask, error: createError } = await supabaseAdmin
      .from('todo_tasks')
      .insert([{
        title: 'Database Setup Test',
        description: 'This is a test task to verify the table exists',
        category: 'testing',
        priority: 'low',
        estimated_hours: 1,
        status: 'pending',
        assigned_to: 'Admin',
        due_date: '2025-12-31',
        start_date: '2025-01-01',
        progress_percentage: 0
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create table:', createError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database table does not exist. Please create it manually in Supabase dashboard.',
        details: createError
      });
    }

    console.log('✅ Table exists, cleaning up test task...');
    
    // Delete the test task
    await supabaseAdmin
      .from('todo_tasks')
      .delete()
      .eq('id', testTask.id);

    // Now populate with the hardcoded data
    const hardcodedTasks = getHardcodedTasks();
    
    console.log(`📝 Inserting ${hardcodedTasks.length} tasks into database...`);
    
    const { data: insertedTasks, error: insertError } = await supabaseAdmin
      .from('todo_tasks')
      .insert(hardcodedTasks)
      .select();

    if (insertError) {
      console.error('❌ Failed to insert tasks:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to insert tasks: ${insertError.message}` 
      });
    }

    console.log(`✅ Successfully inserted ${insertedTasks.length} tasks`);
    
    return NextResponse.json({
      success: true,
      message: `Database setup complete. Inserted ${insertedTasks.length} tasks.`,
      tasksCount: insertedTasks.length
    });

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to setup database: ${error}` 
    });
  }
}

// Helper function to get hardcoded tasks (copied from the API route)
function getHardcodedTasks() {
  return [
    // TEST USERS SYSTEM TASKS - COMPLETED BY CHIEL (August 20, 2024)
    {
      id: "test-users-001",
      title: "Test Gebruikers Admin Pagina Maken",
      description: "Maak een nieuwe admin pagina voor test gebruikers beheer onder het LEDEN menu. Pagina moet test gebruikers tonen die vanaf 22 Augustus het platform gaan testen.",
      assigned_to: "Chiel",
      priority: "high",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 4,
      actual_hours: 4,
      category: "development",
      created_at: "2024-08-20T10:00:00Z"
    },
    {
      id: "test-users-002",
      title: "Test Gebruiker Feedback Component Ontwikkelen",
      description: "Ontwikkel een TestUserFeedback component met floating action buttons rechts in het midden van het scherm. Component moet 'Bug/Verbetering melden' knop hebben en element markering functionaliteit.",
      assigned_to: "Chiel",
      priority: "high",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 6,
      actual_hours: 6,
      category: "development",
      created_at: "2024-08-20T11:00:00Z"
    },
    {
      id: "test-users-003",
      title: "Element Markering Systeem Implementeren",
      description: "Implementeer een systeem waarbij test gebruikers elementen kunnen markeren met een rode highlight. Systeem moet op freeze gaan tijdens markering en automatisch element selectors genereren.",
      assigned_to: "Chiel",
      priority: "high",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 5,
      actual_hours: 5,
      category: "development",
      created_at: "2024-08-20T12:00:00Z"
    },
    {
      id: "test-users-004",
      title: "Test Gebruiker Detectie Hook Maken",
      description: "Maak een useTestUser hook die automatisch detecteert of een gebruiker een test gebruiker is op basis van user.role === 'test'. Hook moet geïntegreerd worden in dashboard layout.",
      assigned_to: "Chiel",
      priority: "medium",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 2,
      actual_hours: 2,
      category: "development",
      created_at: "2024-08-20T13:00:00Z"
    },
    {
      id: "test-users-005",
      title: "Database Schema voor Test Gebruikers",
      description: "Maak database tabellen voor test_users en test_notes. Tabellen moeten alle benodigde velden bevatten voor test gebruiker beheer en feedback notities.",
      assigned_to: "Chiel",
      priority: "high",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 3,
      actual_hours: 3,
      category: "database",
      created_at: "2024-08-20T14:00:00Z"
    },
    // Add a few more sample tasks for testing
    {
      id: "sample-task-001",
      title: "Sample Task voor Chiel",
      description: "Dit is een sample taak om te testen of de database werkt.",
      assigned_to: "Chiel",
      priority: "medium",
      status: "pending",
      due_date: "2025-12-31",
      estimated_hours: 2,
      actual_hours: 0,
      category: "development",
      created_at: new Date().toISOString()
    },
    {
      id: "sample-task-002",
      title: "Test Zoekfunctie",
      description: "Test taak om te controleren of de zoekfunctie werkt.",
      assigned_to: "Chiel",
      priority: "low",
      status: "in_progress",
      due_date: "2025-12-31",
      estimated_hours: 1,
      actual_hours: 0,
      category: "testing",
      created_at: new Date().toISOString()
    }
  ];
} 