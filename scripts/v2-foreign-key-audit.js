const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// V2.0: Foreign Key Constraint Audit Script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ V2.0: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditForeignKeys() {
  console.log('🔍 V2.0: Starting Foreign Key Constraint Audit...\n');

  // V2.0: Expected foreign key relationships
  const expectedFKs = [
    {
      table: 'user_badges',
      column: 'user_id',
      references: 'users(id)',
      description: 'User badges must reference valid user'
    },
    {
      table: 'user_module_progress',
      column: 'user_id',
      references: 'users(id)',
      description: 'Module progress must reference valid user'
    },
    {
      table: 'push_subscriptions',
      column: 'user_id',
      references: 'users(id)',
      description: 'Push subscriptions must reference valid user'
    },
    {
      table: 'chat_messages',
      column: 'sender_id',
      references: 'users(id)',
      description: 'Chat messages must reference valid sender'
    },
    {
      table: 'workout_sessions',
      column: 'user_id',
      references: 'users(id)',
      description: 'Workout sessions must reference valid user'
    },
    {
      table: 'todo_tasks',
      column: 'created_by',
      references: 'users(id)',
      description: 'Tasks must reference valid creator'
    },
    {
      table: 'todo_tasks',
      column: 'updated_by',
      references: 'users(id)',
      description: 'Tasks must reference valid updater'
    },
    {
      table: 'training_schema_exercises',
      column: 'schema_id',
      references: 'training_schemas(id)',
      description: 'Exercises must reference valid training schema'
    },
    {
      table: 'training_schema_days',
      column: 'schema_id',
      references: 'training_schemas(id)',
      description: 'Training days must reference valid schema'
    },
    {
      table: 'academy_lessons',
      column: 'module_id',
      references: 'academy_modules(id)',
      description: 'Lessons must reference valid module'
    },
    {
      table: 'academy_ebooks',
      column: 'module_id',
      references: 'academy_modules(id)',
      description: 'Ebooks must reference valid module'
    }
  ];

  const auditResults = {
    totalExpected: expectedFKs.length,
    existingFKs: 0,
    missingFKs: [],
    recommendations: []
  };

  console.log(`📋 Checking ${expectedFKs.length} expected foreign key relationships\n`);

  for (const fk of expectedFKs) {
    try {
      // V2.0: Check if foreign key constraint exists
      const { data: constraints, error } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name')
        .eq('table_name', fk.table)
        .eq('constraint_type', 'FOREIGN KEY');

      if (error) {
        console.log(`⚠️  Could not check ${fk.table}.${fk.column}: ${error.message}`);
        continue;
      }

      // V2.0: Check if specific foreign key exists
      const hasFK = constraints.some(constraint => 
        constraint.constraint_name.includes(fk.column) || 
        constraint.constraint_name.includes(fk.table)
      );

      if (hasFK) {
        console.log(`✅ ${fk.table}.${fk.column} → ${fk.references} (EXISTS)`);
        auditResults.existingFKs++;
      } else {
        console.log(`❌ ${fk.table}.${fk.column} → ${fk.references} (MISSING)`);
        auditResults.missingFKs.push(fk);
      }

    } catch (err) {
      console.log(`⚠️  Error checking ${fk.table}.${fk.column}: ${err.message}`);
    }
  }

  // Generate recommendations
  console.log('\n📊 V2.0: Foreign Key Audit Results:');
  console.log('=====================================');
  console.log(`Total Expected: ${auditResults.totalExpected}`);
  console.log(`Existing FKs: ${auditResults.existingFKs}`);
  console.log(`Missing FKs: ${auditResults.missingFKs.length}`);

  if (auditResults.missingFKs.length > 0) {
    console.log('\n🚨 V2.0: Missing Foreign Key Constraints:');
    console.log('==========================================');
    auditResults.missingFKs.forEach(fk => {
      console.log(`\n❌ ${fk.table}.${fk.column} → ${fk.references}`);
      console.log(`   Description: ${fk.description}`);
    });

    // Generate SQL to add missing foreign keys
    console.log('\n🔧 V2.0: SQL to Add Missing Foreign Keys:');
    console.log('==========================================');
    console.log('-- Execute this in Supabase SQL Editor');
    console.log('-- https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql\n');

    auditResults.missingFKs.forEach(fk => {
      const [refTable, refColumn] = fk.references.split('(');
      const refCol = refColumn.replace(')', '');
      
      console.log(`-- Add FK: ${fk.table}.${fk.column} → ${fk.references}`);
      console.log(`ALTER TABLE ${fk.table} ADD CONSTRAINT fk_${fk.table}_${fk.column} FOREIGN KEY (${fk.column}) REFERENCES ${refTable}(${refCol}) ON DELETE CASCADE;`);
      console.log('');
    });
  }

  // V2.0: Data integrity check
  console.log('\n🔍 V2.0: Data Integrity Check:');
  console.log('==============================');
  
  const integrityChecks = [
    {
      name: 'Orphaned User Badges',
      query: 'SELECT COUNT(*) FROM user_badges ub LEFT JOIN users u ON ub.user_id = u.id WHERE u.id IS NULL'
    },
    {
      name: 'Orphaned Module Progress',
      query: 'SELECT COUNT(*) FROM user_module_progress ump LEFT JOIN users u ON ump.user_id = u.id WHERE u.id IS NULL'
    },
    {
      name: 'Orphaned Push Subscriptions',
      query: 'SELECT COUNT(*) FROM push_subscriptions ps LEFT JOIN users u ON ps.user_id = u.id WHERE u.id IS NULL'
    },
    {
      name: 'Orphaned Chat Messages',
      query: 'SELECT COUNT(*) FROM chat_messages cm LEFT JOIN users u ON cm.sender_id = u.id WHERE u.id IS NULL'
    }
  ];

  for (const check of integrityChecks) {
    try {
      const { data, error } = await supabase.rpc('execute_sql', { sql: check.query });
      
      if (error) {
        console.log(`⚠️  ${check.name}: Could not check (${error.message})`);
      } else {
        const count = data?.[0]?.count || 0;
        if (count > 0) {
          console.log(`🚨 ${check.name}: ${count} orphaned records found`);
        } else {
          console.log(`✅ ${check.name}: No orphaned records`);
        }
      }
    } catch (err) {
      console.log(`⚠️  ${check.name}: Error during check (${err.message})`);
    }
  }

  return auditResults;
}

// Run the audit
auditForeignKeys().then(results => {
  if (results) {
    console.log('\n✅ V2.0: Foreign Key Audit completed successfully!');
    console.log(`Found ${results.missingFKs.length} missing foreign key constraints.`);
    
    if (results.missingFKs.length > 0) {
      console.log('\n🎯 V2.0: Next Steps:');
      console.log('1. Execute the generated SQL in Supabase SQL Editor');
      console.log('2. Run data integrity checks after adding FKs');
      console.log('3. Test application functionality');
    }
  } else {
    console.log('\n❌ V2.0: Foreign Key Audit failed!');
  }
  process.exit(0);
});
