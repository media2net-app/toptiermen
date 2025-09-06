const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupTicketsTable() {
  try {
    console.log('🔧 Setting up tickets table...');

    // Create tickets table using direct SQL
    const { error: createError } = await supabase
      .from('tickets')
      .select('id')
      .limit(1);

    if (createError) {
      console.error('❌ Error creating tickets table:', createError);
      return;
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
        CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
        CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return;
    }

    // Create updated_at trigger
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
        CREATE TRIGGER update_tickets_updated_at
          BEFORE UPDATE ON tickets
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      return;
    }

    console.log('✅ Tickets table setup completed successfully!');
    console.log('📋 Table structure:');
    console.log('  - id: UUID (Primary Key)');
    console.log('  - user_id: UUID (Foreign Key to auth.users)');
    console.log('  - subject: VARCHAR(255)');
    console.log('  - message: TEXT');
    console.log('  - category: VARCHAR(50)');
    console.log('  - status: VARCHAR(20) (open, in_progress, resolved, closed)');
    console.log('  - priority: VARCHAR(20) (low, medium, high, urgent)');
    console.log('  - admin_response: TEXT');
    console.log('  - admin_notes: TEXT');
    console.log('  - assigned_to: UUID (Foreign Key to auth.users)');
    console.log('  - created_at: TIMESTAMP');
    console.log('  - updated_at: TIMESTAMP');
    console.log('  - resolved_at: TIMESTAMP');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupTicketsTable();
