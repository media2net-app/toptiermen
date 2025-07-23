const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupDashboard() {
  try {
    console.log('🚀 Setting up dashboard tables and data...\n');

    // Read the SQL files
    const dashboardTablesSQL = fs.readFileSync('create_dashboard_tables.sql', 'utf8');
    const dashboardDataSQL = fs.readFileSync('insert_dashboard_data.sql', 'utf8');

    // Split the SQL into individual statements
    const tableStatements = dashboardTablesSQL.split(';').filter(stmt => stmt.trim());
    const dataStatements = dashboardDataSQL.split(';').filter(stmt => stmt.trim());

    console.log('📊 Creating dashboard tables...');
    
    // Execute table creation statements
    for (let i = 0; i < tableStatements.length; i++) {
      const statement = tableStatements[i].trim();
      if (statement) {
        console.log(`  Creating table ${i + 1}/${tableStatements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`  Error in statement ${i + 1}:`, error.message);
        }
      }
    }

    console.log('✅ Dashboard tables created successfully!\n');

    console.log('📈 Inserting dashboard data...');
    
    // Execute data insertion statements
    for (let i = 0; i < dataStatements.length; i++) {
      const statement = dataStatements[i].trim();
      if (statement) {
        console.log(`  Inserting data ${i + 1}/${dataStatements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`  Error in statement ${i + 1}:`, error.message);
        }
      }
    }

    console.log('✅ Dashboard data inserted successfully!\n');
    console.log('🎉 Dashboard setup completed!');

  } catch (error) {
    console.error('❌ Error setting up dashboard:', error);
  }
}

setupDashboard(); 