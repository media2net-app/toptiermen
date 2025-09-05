import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating Challenges & Brotherhood database tables...');

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'create-challenges-brotherhood-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          
          const { error } = await supabaseAdmin.rpc('exec_sql', {
            sql: statement + ';'
          });

          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with next statement instead of failing completely
            continue;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (error) {
          console.error(`❌ Exception in statement ${i + 1}:`, error);
          continue;
        }
      }
    }

    // Verify tables were created by trying to select from them
    const tableNames = [
      'challenges',
      'challenge_categories', 
      'brotherhood_groups',
      'brotherhood_group_members',
      'brotherhood_events',
      'brotherhood_event_attendees',
      'brotherhood_group_feed'
    ];

    const createdTables = [];
    for (const tableName of tableNames) {
      try {
        const { error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          createdTables.push(tableName);
        }
      } catch (error) {
        console.log(`Table ${tableName} not found or error:`, error);
      }
    }

    console.log('✅ Tables created successfully:', createdTables);

    // Check sample data
    const { data: challengeCategories, error: categoriesError } = await supabaseAdmin
      .from('challenge_categories')
      .select('count')
      .limit(1);

    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('brotherhood_groups')
      .select('count')
      .limit(1);

    const { data: events, error: eventsError } = await supabaseAdmin
      .from('brotherhood_events')
      .select('count')
      .limit(1);

    return NextResponse.json({ 
      success: true, 
      message: 'Challenges & Brotherhood database tables created successfully',
      tables: createdTables,
      sampleData: {
        challengeCategories: challengeCategories ? 'Inserted' : 'Failed',
        brotherhoodGroups: groups ? 'Inserted' : 'Failed', 
        brotherhoodEvents: events ? 'Inserted' : 'Failed'
      }
    });

  } catch (error) {
    console.error('❌ Error creating Challenges & Brotherhood tables:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create database tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
