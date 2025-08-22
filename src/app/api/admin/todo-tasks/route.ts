import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching todo tasks...');
    
    // Try to fetch from database first
    const { data: dbTasks, error: dbError } = await supabaseAdmin
      .from('todo_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.log('⚠️ Database error, using hardcoded data:', dbError.message);
      // Fallback to hardcoded data
      return NextResponse.json({
        success: true,
        tasks: getHardcodedTasks(),
        source: 'hardcoded'
      });
    }

    if (dbTasks && dbTasks.length > 0) {
      console.log('✅ Returning database tasks:', dbTasks.length);
      return NextResponse.json({
        success: true,
        tasks: dbTasks,
        source: 'database'
      });
    }

    // If no database tasks, return hardcoded data
    console.log('✅ Returning hardcoded tasks: 37 tasks');
    return NextResponse.json({
      success: true,
      tasks: getHardcodedTasks(),
      source: 'hardcoded'
    });

  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to fetch tasks: ${error}`,
      tasks: getHardcodedTasks(),
      source: 'hardcoded-fallback'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating new task:', body);

    // Validate required fields
    if (!body.title || !body.description || !body.assigned_to || !body.due_date) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: title, description, assigned_to, due_date' 
      });
    }

    // Try to insert into database first
    const { data: newTask, error: dbError } = await supabaseAdmin
      .from('todo_tasks')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database insert failed:', dbError);
      
      // Check if it's a table not found error
      if (dbError.message && typeof dbError.message === 'string' && dbError.message.includes('relation "todo_tasks" does not exist')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Database table "todo_tasks" does not exist. Please create it first using the SQL script.',
          details: 'Run the SQL from scripts/create-todo-table-manual.sql in your Supabase SQL Editor'
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: `Failed to insert new task: ${dbError.message || 'Unknown database error'}`,
        details: dbError
      });
    }

    console.log('✅ Task created in database:', newTask.id);
    
    // Send notification if task is assigned to Chiel
    if (newTask.assigned_to === 'Chiel') {
      try {
        const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/task-notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: newTask.id,
            taskTitle: newTask.title,
            assignedTo: newTask.assigned_to,
            message: `Nieuwe taak toegewezen: ${newTask.title}`
          })
        });

        if (notificationResponse.ok) {
          console.log('✅ Task notification sent to Chiel');
        } else {
          console.log('⚠️ Task notification failed');
        }
      } catch (notificationError) {
        console.log('⚠️ Task notification error:', notificationError);
      }
    }
    
    return NextResponse.json({
      success: true,
      task: newTask,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      success: false, 
      error: `Failed to create task: ${errorMessage}` 
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    console.log('📝 Updating task:', id);

    // Prepare update data
    const updatePayload = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    // If status is being set to completed and completion_date is not provided, set it
    if (updateData.status === 'completed' && !updateData.completion_date) {
      updatePayload.completion_date = new Date().toISOString();
    }

    // If status is being changed from completed to something else, clear completion_date
    if (updateData.status !== 'completed' && updateData.status !== undefined) {
      updatePayload.completion_date = null;
    }

    // Try to update in database first
    const { data: updatedTask, error: dbError } = await supabaseAdmin
      .from('todo_tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database update failed:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to update task: ${dbError.message}` 
      });
    }

    console.log('✅ Task updated in database:', updatedTask.id);
    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating task:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update task: ${error}` 
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Task ID is required' 
      });
    }

    console.log('🗑️ Deleting task:', id);

    // Try to delete from database first
    const { error: dbError } = await supabaseAdmin
      .from('todo_tasks')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('❌ Database delete failed:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to delete task: ${dbError.message}` 
      });
    }

    console.log('✅ Task deleted from database:', id);
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting task:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to delete task: ${error}` 
    });
  }
}

// Helper function to get hardcoded tasks as fallback
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
      created_at: "2024-08-20T10:00:00Z",
      completion_date: "2024-08-20T16:00:00Z"
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
      created_at: "2024-08-20T11:00:00Z",
      completion_date: "2024-08-20T17:00:00Z"
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
    {
      id: "test-users-006",
      title: "Admin Menu Integratie Test Gebruikers",
      description: "Voeg 'Test gebruikers' menu item toe aan het admin dashboard onder de LEDEN sectie. Gebruik UserIcon voor visuele identificatie.",
      assigned_to: "Chiel",
      priority: "medium",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 1,
      actual_hours: 1,
      category: "development",
      created_at: "2024-08-20T15:00:00Z"
    },
    {
      id: "test-users-007",
      title: "Dashboard Layout Integratie Feedback Component",
      description: "Integreer TestUserFeedback component in dashboard layout zodat test gebruikers automatisch toegang krijgen tot feedback functionaliteit. Voeg callback functie toe voor notitie creatie.",
      assigned_to: "Chiel",
      priority: "high",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 3,
      actual_hours: 3,
      category: "development",
      created_at: "2024-08-20T16:00:00Z"
    },
    {
      id: "test-users-008",
      title: "Floating Action Buttons Styling",
      description: "Implementeer floating action buttons rechts in het midden van het scherm met rode (bug), blauwe (markeren) en grijze (notities) knoppen. Zorg voor hover effecten en z-index management.",
      assigned_to: "Chiel",
      priority: "medium",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 2,
      actual_hours: 2,
      category: "ui",
      created_at: "2024-08-20T17:00:00Z"
    },
    {
      id: "test-users-009",
      title: "Feedback Modal Ontwikkeling",
      description: "Ontwikkel een modal voor bug/verbetering meldingen met type selectie, prioriteit, beschrijving veld en element informatie. Modal moet responsive zijn en goede UX hebben.",
      assigned_to: "Chiel",
      priority: "high",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 4,
      actual_hours: 4,
      category: "ui",
      created_at: "2024-08-20T18:00:00Z"
    },
    {
      id: "test-users-010",
      title: "Notities Overzicht Functionaliteit",
      description: "Implementeer notities overzicht modal met lijst van alle feedback, type en prioriteit badges, pagina en element informatie, en datum/tijd weergave.",
      assigned_to: "Chiel",
      priority: "medium",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 3,
      actual_hours: 3,
      category: "development",
      created_at: "2024-08-20T19:00:00Z"
    },
    {
      id: "test-users-011",
      title: "Mock Data voor Test Gebruikers",
      description: "Maak realistische mock data voor test gebruikers dashboard met 3 test gebruikers, verschillende statussen, sample notities en statistieken voor demonstratie doeleinden.",
      assigned_to: "Chiel",
      priority: "low",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 2,
      actual_hours: 2,
      category: "development",
      created_at: "2024-08-20T20:00:00Z"
    },
    {
      id: "test-users-012",
      title: "Test Gebruikers Statistieken Dashboard",
      description: "Implementeer statistieken cards voor test gebruikers overzicht met totaal gebruikers, actieve testers, bugs gerapporteerd en verbeteringen. Voeg zoek en filter functionaliteit toe.",
      assigned_to: "Chiel",
      priority: "medium",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 3,
      actual_hours: 3,
      category: "development",
      created_at: "2024-08-20T21:00:00Z"
    },
    {
      id: "test-users-013",
      title: "Status Beheer voor Test Gebruikers",
      description: "Implementeer status beheer functionaliteit voor test gebruikers (actief, inactief, voltooid) met dropdown selectors en real-time updates in de admin interface.",
      assigned_to: "Chiel",
      priority: "medium",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 2,
      actual_hours: 2,
      category: "development",
      created_at: "2024-08-20T22:00:00Z"
    },
    {
      id: "test-users-014",
      title: "CSS Highlight Effecten voor Element Markering",
      description: "Implementeer CSS styling voor element markering met rode outline, background highlight, crosshair cursor en z-index management voor overlay effecten.",
      assigned_to: "Chiel",
      priority: "medium",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 2,
      actual_hours: 2,
      category: "ui",
      created_at: "2024-08-20T23:00:00Z"
    },
    {
      id: "test-users-015",
      title: "Element Selector Generatie Logica",
      description: "Implementeer logica voor automatische element selector generatie op basis van ID, className of tagName. Selector moet uniek en bruikbaar zijn voor developers.",
      assigned_to: "Chiel",
      priority: "high",
      status: "completed",
      due_date: "2024-08-20",
      estimated_hours: 3,
      actual_hours: 3,
      category: "development",
      created_at: "2024-08-21T00:00:00Z"
    },
    {
      id: "test-users-016",
      title: "Test Gebruikers Systeem Documentatie",
      description: "Documenteer het volledige test gebruikers systeem inclusief componenten, hooks, database schema, admin functionaliteit en gebruiker feedback workflow.",
      assigned_to: "Chiel",
      priority: "low",
      status: "completed",
      due_date: "2024-08-21",
      estimated_hours: 2,
      actual_hours: 2,
      category: "content",
      created_at: "2024-08-21T01:00:00Z"
    },
    // NEW TASKS FOR FALLBACK DATA CONVERSION (July 29, 2025)
          {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        title: "Planning & Todo Database Integratie",
        description: "Volledige database integratie voor todo systeem. Aanmaken van todo_tasks, todo_subtasks, todo_milestones en todo_statistics tabellen. API endpoints koppelen aan echte database in plaats van hardcoded data. Real-time task tracking implementeren.",
        category: "development",
        priority: "critical",
        estimated_hours: 12,
        actual_hours: 8,
        status: "completed",
        assigned_to: "Chiel",
        due_date: "2025-08-05",
        start_date: "2025-07-29",
        completion_date: "2025-07-31",
        dependencies: [],
        tags: ["todo", "database", "api", "fallback-conversion"],
        progress_percentage: 100,
        created_at: "2025-07-28T00:00:00Z"
      },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      title: "Gebruikersbeheer Mock Data Vervangen",
      description: "Mock data in gebruikersbeheer vervangen door echte database queries. Nieuwe API endpoint maken voor gebruikersbeheer. Real-time user status tracking implementeren. Gebruikersstatistieken koppelen aan echte data.",
      category: "frontend",
      priority: "high",
      estimated_hours: 8,
      actual_hours: 8,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-29",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["users", "mock-data", "api", "fallback-conversion"],
      progress_percentage: 100,
      created_at: "2025-07-28T00:00:00Z"
    },
    {
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      title: "Forum Moderatie Database Setup",
      description: "Database tabellen aanmaken voor forum_reports en forum_moderation_logs. API endpoints koppelen aan echte database. Real-time moderation tracking implementeren. Mock data vervangen door echte forum data.",
      category: "database",
      priority: "high",
      estimated_hours: 10,
      actual_hours: 10,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-29",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["forum", "moderation", "database", "fallback-conversion"],
      progress_percentage: 100,
      created_at: "2025-07-28T00:00:00Z"
    },
    {
      id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      title: "Book Reviews Database Integratie",
      description: "Book reviews database tabel aanmaken en API koppelen aan database. Mock data vervangen door echte review data. Review moderation systeem implementeren.",
      category: "database",
      priority: "medium",
      estimated_hours: 6,
      actual_hours: 6,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-29",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["books", "reviews", "database", "fallback-conversion"],
      progress_percentage: 100,
      created_at: "2025-07-28T00:00:00Z"
    },
    {
      id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      title: "Fallback Data Analysis Documentatie",
      description: "Comprehensive documentatie van alle fallback data conversies. Task breakdown en prioriteiten documenteren. Database schema's en API endpoints documenteren. Test procedures opstellen.",
      category: "documentation",
      priority: "medium",
      estimated_hours: 4,
      actual_hours: 4,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-29",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["documentation", "fallback-analysis", "planning"],
      progress_percentage: 100,
      created_at: "2025-07-28T00:00:00Z"
    },
    // ADDITIONAL TASKS FOR PLATFORM ENHANCEMENT (July 28, 2025)
    {
      id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
      title: "Affiliate Marketing Systeem voor Leden",
      description: "Affiliate marketing mogelijkheden voor leden implementeren. Referral tracking, commissie systeem, affiliate dashboard en payout management. Leden kunnen andere leden uitnodigen en commissie verdienen.",
      category: "backend",
      priority: "high",
      estimated_hours: 16,
      actual_hours: 16,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-01",
      completion_date: "2025-08-01",
      dependencies: [],
      tags: ["affiliate", "marketing", "referrals", "commissions", "database", "api"],
      progress_percentage: 100,
      created_at: "2025-07-28T00:00:00Z"
    },
    {
      id: "gggggggg-gggg-gggg-gggg-gggggggggggg",
      title: "Product Pagina & Checkout Systeem",
      description: "Volledige product pagina met Stripe checkout integratie. Product catalogus, winkelwagen functionaliteit, betalingsverwerking en order management. Responsive design en user experience optimalisatie.",
      category: "frontend",
      priority: "high",
      estimated_hours: 12,
      actual_hours: 0,
      status: "pending",
      assigned_to: "Chiel",
      due_date: "2025-08-15",
      start_date: "2025-08-06",
      completion_date: null,
      dependencies: [],
      tags: ["product", "stripe", "checkout", "ecommerce", "frontend"],
      progress_percentage: 0,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh",
      title: "Test Gebruikers Systeem & Live Feedback",
      description: "Test gebruikers klaar zetten met speciale rol 'testers'. Functie om per pagina live feedback te geven. Feedback dashboard voor admins. Test user management en feedback analytics.",
      category: "frontend",
      priority: "medium",
      estimated_hours: 10,
      actual_hours: null,
      status: "pending",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-02",
      completion_date: null,
      dependencies: [],
      tags: ["testing", "feedback", "user-management", "analytics"],
      progress_percentage: 0,
      created_at: "2025-07-28T00:00:00Z"
    },
    {
      id: "iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii",
      title: "Stripe & Google Analytics Keys Configuratie",
      description: "Stripe key toevoegen voor payment processing. Google Analytics key toevoegen voor tracking. Environment variables configureren. Security best practices implementeren voor key management.",
      category: "integration",
      priority: "critical",
      estimated_hours: 4,
      actual_hours: 4,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-29",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["stripe", "google-analytics", "security", "configuration"],
      progress_percentage: 100,
      created_at: "2025-07-28T00:00:00Z"
    },
    {
      id: "jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj",
      title: "Marketingplan Aanpassing (10u/maand, 6 maanden)",
      description: "Marketingplan aanpassen op basis van 10 uur per maand voor 6 maanden. Budget allocatie, KPI's en ROI tracking. Content calendar en campagne planning. Performance monitoring setup.",
      category: "documentation",
      priority: "medium",
      estimated_hours: 6,
      actual_hours: null,
      status: "pending",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-31",
      completion_date: null,
      dependencies: [],
      tags: ["marketing", "planning", "budget", "kpis"],
      progress_percentage: 0,
      created_at: "2025-07-28T00:00:00Z"
    },
    {
      id: "kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk",
      title: "7 Dagen Proefperiode Implementatie",
      description: "7 dagen proefperiode toevoegen met beperkte functies: 1 module van academy, beperkte schemas, geen toegang brotherhood. Trial user management, upgrade prompts en conversion tracking.",
      category: "backend",
      priority: "high",
      estimated_hours: 14,
      actual_hours: 14,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-05",
      completion_date: "2025-08-01",
      dependencies: ["iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii"],
      tags: ["trial", "freemium", "conversion", "user-management", "database", "analytics"],
      progress_percentage: 100,
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
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
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-18",
      completion_date: "2025-07-27T15:12:05.007Z",
      dependencies: ["22222222-2222-2222-2222-222222222223", "33333333-3333-3333-3333-333333333334", "44444444-4444-4444-4444-444444444445"],
      tags: ["testing", "bugfixes", "launch-prep"],
      progress_percentage: 100,
      created_at: "2025-07-27T10:00:00Z"
    },
    {
      id: "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz",
      title: "Final Launch Testing & Bug Fixes",
      description: "Comprehensive final testing of all platform features. Bug fixes and performance optimizations. Security audit and penetration testing. Load testing and performance optimization. Final deployment preparation.",
      category: "testing",
      priority: "critical",
      estimated_hours: 40,
      actual_hours: 40,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-18",
      completion_date: "2025-07-27T15:12:05.007Z",
      dependencies: ["22222222-2222-2222-2222-222222222223", "33333333-3333-3333-3333-333333333334", "44444444-4444-4444-4444-444444444445"],
      tags: ["testing", "bugfixes", "launch-prep"],
      progress_percentage: 100,
      created_at: "2025-07-27T10:00:00Z"
    },
    // NEW TASKS FOR TODAY'S CONTENT CREATION (July 31, 2025)
    {
      id: "content-001-discipline-module",
      title: "Discipline & Identiteit Module Content Volledig Bijwerken",
      description: "Alle 5 lessen van de Discipline & Identiteit module bijwerken met uitgebreide content (1500-6500 woorden per les). Markdown formatting implementeren. Oefeningen en praktische toepassingen toevoegen.",
      category: "content",
      priority: "critical",
      estimated_hours: 8,
      actual_hours: 8,
      status: "completed",
      assigned_to: "Rick",
      due_date: "2025-08-05",
      start_date: "2025-07-31",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["academy", "content", "discipline", "markdown"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-002-markdown-rendering",
      title: "Markdown Rendering Implementatie",
      description: "ReactMarkdown en remark-gfm geïnstalleerd en geïmplementeerd voor academy lessen. Custom styling toegevoegd voor headers, lists, checkboxes, bold text en blockquotes. Professionele content formatting.",
      category: "development",
      priority: "high",
      estimated_hours: 4,
      actual_hours: 3,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-31",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["markdown", "react", "styling", "academy"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-003-all-modules-api",
      title: "All Modules Update API Ontwikkeling",
      description: "Nieuwe API endpoint /api/admin/update-all-modules ontwikkeld voor het bijwerken van alle academy modules. 6 modules bijgewerkt met uitgebreide content: Discipline, Fysieke Kracht, Mentale Kracht, Finance, Brotherhood, Voeding.",
      category: "development",
      priority: "high",
      estimated_hours: 6,
      actual_hours: 5,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-31",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["api", "academy", "modules", "content"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-004-discipline-specific-api",
      title: "Discipline Module Specifieke API",
      description: "Specifieke API endpoint /api/admin/update-discipline-module ontwikkeld voor het volledig bijwerken van de Discipline & Identiteit module. Alle 5 lessen bijgewerkt met 1500-6500 woorden per les.",
      category: "development",
      priority: "high",
      estimated_hours: 4,
      actual_hours: 4,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-31",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["api", "discipline", "content", "academy"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-005-planning-status-update",
      title: "Planning Status Modal Bijwerken",
      description: "PlanningStatusModal bijgewerkt om uren tracking te vervangen door 'Unlimited uren' en focus te verleggen naar perfect platform ontwikkeling. Uren overrun waarschuwingen verwijderd, nieuwe focus op kwaliteit.",
      category: "development",
      priority: "medium",
      estimated_hours: 3,
      actual_hours: 2,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-31",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["planning", "modal", "ui", "unlimited-hours"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-006-academy-content-verification",
      title: "Academy Content Verificatie en Testing",
      description: "Alle academy content getest en geverifieerd. Markdown rendering werkt correct, content wordt mooi opgemaakt weergegeven. Discipline module 100% compleet met uitgebreide content.",
      category: "testing",
      priority: "high",
      estimated_hours: 2,
      actual_hours: 2,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-07-31",
      completion_date: "2025-07-31",
      dependencies: ["content-001-discipline-module", "content-002-markdown-rendering"],
      tags: ["testing", "academy", "content", "markdown"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-007-remaining-modules-content",
      title: "Overige Modules Content Uitbreiden",
      description: "Content uitbreiden voor overige modules: Fysieke Kracht, Mentale Kracht, Finance & Business, Brotherhood, Voeding & Gezondheid. Elke module minimaal 1 les met uitgebreide content (2000+ woorden).",
      category: "content",
      priority: "high",
      estimated_hours: 12,
      actual_hours: 0,
      status: "pending",
      assigned_to: "Rick",
      due_date: "2025-08-05",
      start_date: "2025-08-01",
      completion_date: null,
      dependencies: ["content-003-all-modules-api"],
      tags: ["academy", "content", "modules", "extensive-content"],
      progress_percentage: 0,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-008-testosteron-module-content",
      title: "Testosteron Module Content Ontwikkelen",
      description: "Uitgebreide content ontwikkelen voor de Testosteron module. 5 lessen met gedetailleerde content over testosteron, TRT, natuurlijke verhoging, en gezondheid. 2000+ woorden per les.",
      category: "content",
      priority: "medium",
      estimated_hours: 8,
      actual_hours: 0,
      status: "pending",
      assigned_to: "Rick",
      due_date: "2025-08-05",
      start_date: "2025-08-02",
      completion_date: null,
      dependencies: ["content-007-remaining-modules-content"],
      tags: ["academy", "content", "testosterone", "health"],
      progress_percentage: 0,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-009-academy-navigation-improvement",
      title: "Academy Navigation en UX Verbeteren",
      description: "Academy navigatie verbeteren met betere progress tracking, module overzicht, en gebruikerservaring. Implementeren van progress bars, completion status, en betere les navigatie.",
      category: "development",
      priority: "medium",
      estimated_hours: 6,
      actual_hours: 6,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-03",
      completion_date: "2025-07-31",
      dependencies: ["content-007-remaining-modules-content"],
      tags: ["ui", "academy", "navigation", "ux"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "content-010-content-quality-review",
      title: "Content Kwaliteit Review en Optimalisatie",
      description: "Alle academy content reviewen op kwaliteit, consistentie en gebruiksvriendelijkheid. Optimaliseren van content structuur, verbeteren van oefeningen en praktische toepassingen.",
      category: "content",
      priority: "medium",
      estimated_hours: 4,
      actual_hours: 4,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-04",
      completion_date: "2025-07-31",
      dependencies: ["content-008-testosteron-module-content"],
      tags: ["content", "quality", "review", "optimization"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    // Rick's tasks
    {
      id: "chiel-001-video-upload-fix",
      title: "Video Upload Functionaliteit Fix",
      description: "Video upload systeem repareren en optimaliseren. Ondersteuning voor verschillende video formaten. Progress tracking implementeren. Error handling verbeteren.",
      category: "video",
      priority: "high",
      estimated_hours: 6,
      actual_hours: 6,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-05",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["video", "upload", "fix", "optimization"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "rick-002-nutrition-content",
      title: "Voedingsplannen Content Uitbreiden",
      description: "Uitgebreide voedingsplannen content ontwikkelen. Recepten, maaltijdplannen, supplementen advies. Praktische toepassingen en tracking systemen.",
      category: "nutrition",
      priority: "high",
      estimated_hours: 8,
      actual_hours: 0,
      status: "pending",
      assigned_to: "Rick",
      due_date: "2025-08-05",
      start_date: "2025-08-06",
      completion_date: null,
      dependencies: [],
      tags: ["nutrition", "content", "recipes", "supplements"],
      progress_percentage: 0,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "rick-003-training-videos",
      title: "Training Video's Produceren",
      description: "Professionele training video's produceren voor alle modules. Video editing, voice-over, en kwaliteitscontrole. Upload en integratie in academy systeem.",
      category: "video",
      priority: "medium",
      estimated_hours: 12,
      actual_hours: 0,
      status: "pending",
      assigned_to: "Rick",
      due_date: "2025-08-05",
      start_date: "2025-08-07",
      completion_date: null,
      dependencies: ["chiel-001-video-upload-fix"],
      tags: ["video", "production", "training", "academy"],
      progress_percentage: 0,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "rick-004-brotherhood-content",
      title: "Brotherhood Content en Events",
      description: "Brotherhood module content uitbreiden. Event planning, community features, en exclusieve content. Networking en mentorship programma's.",
      category: "content",
      priority: "medium",
      estimated_hours: 6,
      actual_hours: 0,
      status: "pending",
      assigned_to: "Rick",
      due_date: "2025-08-05",
      start_date: "2025-08-10",
      completion_date: null,
      dependencies: [],
      tags: ["brotherhood", "content", "events", "community"],
      progress_percentage: 0,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "chiel-002-badges-design",
      title: "Badges en Rangen Systeem Ontwerpen",
      description: "Compleet badges en rangen systeem ontwerpen. Visuele badges, progress tracking, achievement system. Gamification elementen implementeren.",
      category: "design",
      priority: "high",
      estimated_hours: 8,
      actual_hours: 8,
      status: "completed",
      assigned_to: "Chiel",
      due_date: "2025-08-05",
      start_date: "2025-08-05",
      completion_date: "2025-07-31",
      dependencies: [],
      tags: ["badges", "ranks", "design", "gamification"],
      progress_percentage: 100,
      created_at: "2025-07-31T00:00:00Z"
    },
    {
      id: "platform-optimization-2025",
      title: "Platform Optimalisatie & Verbeteringen",
      description: "Kritieke platform verbeteringen: Performance optimalisatie (bundle size, loading speed), security hardening (authentication, authorization), mobile responsiveness, accessibility (WCAG), error handling, caching strategieën, SEO optimalisatie, en code kwaliteit verbeteringen. Focus op user experience en platform stabiliteit.",
      category: "fullstack",
      priority: "critical",
      estimated_hours: 24,
      actual_hours: 0,
      status: "pending",
      assigned_to: "Chiel",
      due_date: "2025-08-20",
      start_date: "2025-08-06",
      completion_date: null,
      dependencies: [],
      tags: ["performance", "security", "mobile", "accessibility", "optimization", "ux", "seo", "caching"],
      progress_percentage: 0,
      created_at: "2025-08-03T12:35:00Z"
    }
  ];
} 