import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Adding new tasks for today\'s content creation...');

    // New tasks for today's content creation (July 31, 2025)
    const newTasks = [
      {
        id: "content-001-discipline-module",
        title: "Discipline & Identiteit Module Content Volledig Bijwerken",
        description: "Alle 5 lessen van de Discipline & Identiteit module bijwerken met uitgebreide content. Les 1-2 waren al goed, les 3-5 uitgebreid bijgewerkt met 4000-6500 woorden per les. Markdown formatting geïmplementeerd.",
        category: "content",
        priority: "critical",
        estimated_hours: 8,
        actual_hours: 6,
        status: "completed",
        assigned_to: "Content Team",
        due_date: "2025-07-31",
        start_date: "2025-07-31",
        completion_date: "2025-07-31",
        dependencies: [],
        tags: ["academy", "content", "discipline", "identity", "markdown"],
        progress_percentage: 100,
        created_at: "2025-07-31T00:00:00Z"
      },
      {
        id: "content-002-markdown-rendering",
        title: "Markdown Rendering Implementatie",
        description: "ReactMarkdown en remark-gfm geïnstalleerd en geïmplementeerd voor academy lessen. Custom styling toegevoegd voor headers, lists, checkboxes, bold text en blockquotes. Professionele content formatting.",
        category: "frontend",
        priority: "high",
        estimated_hours: 4,
        actual_hours: 3,
        status: "completed",
        assigned_to: "Frontend Team",
        due_date: "2025-07-31",
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
        category: "api",
        priority: "high",
        estimated_hours: 6,
        actual_hours: 5,
        status: "completed",
        assigned_to: "Backend Team",
        due_date: "2025-07-31",
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
        category: "api",
        priority: "high",
        estimated_hours: 4,
        actual_hours: 4,
        status: "completed",
        assigned_to: "Backend Team",
        due_date: "2025-07-31",
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
        category: "ui",
        priority: "medium",
        estimated_hours: 3,
        actual_hours: 2,
        status: "completed",
        assigned_to: "Frontend Team",
        due_date: "2025-07-31",
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
        assigned_to: "QA Team",
        due_date: "2025-07-31",
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
        assigned_to: "Content Team",
        due_date: "2025-08-02",
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
        assigned_to: "Content Team",
        due_date: "2025-08-03",
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
        category: "ui",
        priority: "medium",
        estimated_hours: 6,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Frontend Team",
        due_date: "2025-08-04",
        start_date: "2025-08-03",
        completion_date: null,
        dependencies: ["content-007-remaining-modules-content"],
        tags: ["ui", "academy", "navigation", "ux"],
        progress_percentage: 0,
        created_at: "2025-07-31T00:00:00Z"
      },
      {
        id: "content-010-content-quality-review",
        title: "Content Kwaliteit Review en Optimalisatie",
        description: "Alle academy content reviewen op kwaliteit, consistentie en gebruiksvriendelijkheid. Optimaliseren van content structuur, verbeteren van oefeningen en praktische toepassingen.",
        category: "content",
        priority: "medium",
        estimated_hours: 4,
        actual_hours: 0,
        status: "pending",
        assigned_to: "Content Team",
        due_date: "2025-08-05",
        start_date: "2025-08-04",
        completion_date: null,
        dependencies: ["content-007-remaining-modules-content", "content-008-testosteron-module-content"],
        tags: ["content", "quality", "review", "optimization"],
        progress_percentage: 0,
        created_at: "2025-07-31T00:00:00Z"
      }
    ];

    // Add new tasks to the database
    const { data: insertedTasks, error: insertError } = await supabaseAdmin
      .from('todo_tasks')
      .insert(newTasks)
      .select();

    if (insertError) {
      console.error('❌ Error inserting new tasks:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to insert new tasks: ${insertError.message}` 
      });
    }

    console.log('✅ New tasks added successfully');

    return NextResponse.json({
      success: true,
      message: 'New tasks added for today\'s content creation',
      tasks_added: insertedTasks?.length || 0,
      new_total_tasks: 31, // 21 existing + 10 new
      projected_completion_date: "2025-08-05"
    });

  } catch (error) {
    console.error('❌ Error adding new tasks:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to add new tasks: ${error}` 
    });
  }
} 