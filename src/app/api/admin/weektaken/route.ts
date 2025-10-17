import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching weektaken...');
    
    // Try to fetch from database first
    const { data: dbTasks, error: dbError } = await supabaseAdmin
      .from('todo_tasks')
      .select('*')
      .eq('category', 'weektaken')
      .order('day_order', { ascending: true })
      .order('task_order', { ascending: true });

    if (dbError) {
      console.log('⚠️ Database error, using hardcoded data:', dbError.message);
      // Fallback to hardcoded data
      return NextResponse.json({
        success: true,
        tasks: getHardcodedWeektaken(),
        source: 'hardcoded'
      });
    }

    if (dbTasks && dbTasks.length > 0) {
      console.log('✅ Returning database weektaken:', dbTasks.length);
      return NextResponse.json({
        success: true,
        tasks: dbTasks,
        source: 'database'
      });
    }

    // If no database tasks, return hardcoded data
    console.log('✅ Returning hardcoded weektaken');
    return NextResponse.json({
      success: true,
      tasks: getHardcodedWeektaken(),
      source: 'hardcoded'
    });

  } catch (error) {
    console.error('❌ Error fetching weektaken:', error);
    return NextResponse.json({
      success: false, 
      error: `Failed to fetch weektaken: ${error}`,
      tasks: getHardcodedWeektaken(),
      source: 'hardcoded-fallback'
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Updating weektaak completion status:', body);

    const { taskId, completed } = body;

    if (!taskId || typeof completed !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: taskId, completed' 
      });
    }

    // Update the task completion status
    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('todo_tasks')
      .update({ 
        completed: completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update failed:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to update task: ${updateError.message}` 
      });
    }

    console.log('✅ Task completion status updated:', updatedTask.id);
    
    return NextResponse.json({
      success: true,
      task: updatedTask
    });

  } catch (error) {
    console.error('❌ Error updating weektaak:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update weektaak: ${error}` 
    });
  }
}

// Helper function to get hardcoded weektaken as fallback
function getHardcodedWeektaken() {
  return [
    // Woensdag
    { id: '11111111-1111-1111-1111-111111111111', title: 'Test users toevoegen', day: 'woensdag', day_order: 1, task_order: 1, completed: false },
    { id: '11111111-1111-1111-1111-111111111112', title: 'Hotmail probleem oplossen', day: 'woensdag', day_order: 1, task_order: 2, completed: false },
    { id: '11111111-1111-1111-1111-111111111113', title: '2 leden die nog niet onboard zijn persoonlijk mailen', day: 'woensdag', day_order: 1, task_order: 3, completed: false },
    { id: '11111111-1111-1111-1111-111111111114', title: 'Plan van aanpak maken 30 leads', day: 'woensdag', day_order: 1, task_order: 4, completed: false },
    { id: '11111111-1111-1111-1111-111111111115', title: 'Rick helpen met mail / contact Cross Internet', day: 'woensdag', day_order: 1, task_order: 5, completed: false },
    { id: '11111111-1111-1111-1111-111111111116', title: 'Admin dashboard inrichten om huidige status leden te checken', day: 'woensdag', day_order: 1, task_order: 6, completed: false },
    { id: '11111111-1111-1111-1111-111111111117', title: 'Leden pagina opschonen, enkel echte gebruikers tonen + test gebruikers', day: 'woensdag', day_order: 1, task_order: 7, completed: false },
    { id: '11111111-1111-1111-1111-111111111118', title: 'Forum nalopen', day: 'woensdag', day_order: 1, task_order: 8, completed: false },
    { id: '11111111-1111-1111-1111-111111111119', title: 'Social wall vullen Rick en Chiel, dagelijks posten om leden aan te moedigen', day: 'woensdag', day_order: 1, task_order: 9, completed: false },
    { id: '11111111-1111-1111-1111-11111111111a', title: 'Boks op reacties mogelijk maken', day: 'woensdag', day_order: 1, task_order: 10, completed: false },
    { id: '11111111-1111-1111-1111-11111111111b', title: 'Reactie op reactie mogelijk maken', day: 'woensdag', day_order: 1, task_order: 11, completed: false },
    { id: '11111111-1111-1111-1111-11111111111c', title: 'Voedingsschema en trainingsschema admin dashboard inzichtelijk', day: 'woensdag', day_order: 1, task_order: 12, completed: false },
    { id: '11111111-1111-1111-1111-11111111111d', title: 'Clone gereed maken zodat we kunnen door ontwikkelen', day: 'woensdag', day_order: 1, task_order: 13, completed: false },
    { id: '11111111-1111-1111-1111-11111111111e', title: 'Affiliate testen', day: 'woensdag', day_order: 1, task_order: 14, completed: false },
    { id: '11111111-1111-1111-1111-11111111111f', title: 'Trainingsschemas controleren - schema 3 is niet zichtbaar', day: 'woensdag', day_order: 1, task_order: 15, completed: false },
    { id: '11111111-1111-1111-1111-111111111120', title: 'Print layout voor trainingsschema en voedingsplan', day: 'woensdag', day_order: 1, task_order: 16, completed: false },
    { id: '11111111-1111-1111-1111-111111111121', title: '1:1 platform functies inzichtelijk maken', day: 'woensdag', day_order: 1, task_order: 17, completed: false },
    { id: '11111111-1111-1111-1111-111111111122', title: '1:1 platform offerte', day: 'woensdag', day_order: 1, task_order: 18, completed: false },
    
    // Donderdag
    { id: '22222222-2222-2222-2222-222222222221', title: 'Plan van aanpak marketing', day: 'donderdag', day_order: 2, task_order: 1, completed: false },
    { id: '22222222-2222-2222-2222-222222222222', title: 'Pop-up plaatsen over de eerste virtuele bijeenkomst', day: 'donderdag', day_order: 2, task_order: 2, completed: false },
    { id: '22222222-2222-2222-2222-222222222223', title: 'Virtuele bijeenkomst opzetten via systeem of Teams/Zooms', day: 'donderdag', day_order: 2, task_order: 3, completed: false },
    { id: '22222222-2222-2222-2222-222222222224', title: 'Bol.com fixen', day: 'donderdag', day_order: 2, task_order: 4, completed: false },
    { id: '22222222-2222-2222-2222-222222222225', title: 'Boeken fixen', day: 'donderdag', day_order: 2, task_order: 5, completed: false },
    { id: '22222222-2222-2222-2222-222222222226', title: 'Producten fixen', day: 'donderdag', day_order: 2, task_order: 6, completed: false },
    { id: '22222222-2222-2222-2222-222222222227', title: 'Financieel stuk fixen - auto incasso en communicatie naar leden', day: 'donderdag', day_order: 2, task_order: 7, completed: false },
    
    // Vrijdag
    { id: '33333333-3333-3333-3333-333333333331', title: 'Virtuele meeting testen met Rick', day: 'vrijdag', day_order: 3, task_order: 1, completed: false },
    { id: '33333333-3333-3333-3333-333333333332', title: 'Algehele platform check van A tot Z, performance en mobile', day: 'vrijdag', day_order: 3, task_order: 2, completed: false },
    { id: '33333333-3333-3333-3333-333333333333', title: 'Week afsluiting, wat ging goed, wat ging niet goed', day: 'vrijdag', day_order: 3, task_order: 3, completed: false },
    
    // Volgende week
    { id: '44444444-4444-4444-4444-444444444441', title: 'Gram afronding op hele of op 5', day: 'volgendeWeek', day_order: 4, task_order: 1, completed: false },
    { id: '44444444-4444-4444-4444-444444444442', title: 'Logische porties - 100kg en dan 570 skyr is te veel', day: 'volgendeWeek', day_order: 4, task_order: 2, completed: false },
    { id: '44444444-4444-4444-4444-444444444443', title: 'Maximale gram per product invoeren', day: 'volgendeWeek', day_order: 4, task_order: 3, completed: false },
    { id: '44444444-4444-4444-4444-444444444444', title: 'Shopping list', day: 'volgendeWeek', day_order: 4, task_order: 4, completed: false },
    { id: '44444444-4444-4444-4444-444444444445', title: 'Variaties voedingsplannen', day: 'volgendeWeek', day_order: 4, task_order: 5, completed: false },
    { id: '44444444-4444-4444-4444-444444444446', title: 'Customize plan - gebruiker kan ingrediënten wijzigen', day: 'volgendeWeek', day_order: 4, task_order: 6, completed: false },
    { id: '44444444-4444-4444-4444-444444444447', title: 'Notificaties', day: 'volgendeWeek', day_order: 4, task_order: 7, completed: false },
    { id: '44444444-4444-4444-4444-444444444448', title: 'Rangen en badges', day: 'volgendeWeek', day_order: 4, task_order: 8, completed: false },
    { id: '44444444-4444-4444-4444-444444444449', title: 'Rick uitleggen leden toevoegen', day: 'volgendeWeek', day_order: 4, task_order: 9, completed: false },
  ];
}
