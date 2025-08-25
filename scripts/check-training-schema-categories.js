require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTrainingSchemaCategories() {
  try {
    console.log('🔍 Checking training schema categories...\n');

    // 1. Check existing categories
    console.log('📋 Checking existing categories...');
    const { data: existingCategories, error: categoriesError } = await supabase
      .from('training_schemas')
      .select('category')
      .not('category', 'is', null);

    if (categoriesError) {
      console.log('❌ Error fetching categories:', categoriesError.message);
      return;
    }

    const uniqueCategories = [...new Set(existingCategories.map(item => item.category))];
    console.log('✅ Existing categories:', uniqueCategories);

    // 2. Check table constraints
    console.log('\n🔧 Checking table constraints...');
    const { data: constraints, error: constraintsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          conname as constraint_name,
          pg_get_constraintdef(oid) as constraint_definition
        FROM pg_constraint 
        WHERE conrelid = 'training_schemas'::regclass
        AND contype = 'c';
      `
    });

    if (constraintsError) {
      console.log('⚠️ Could not check constraints via RPC, trying alternative method...');
      
      // Try to get sample data to understand the structure
      const { data: sampleSchema, error: sampleError } = await supabase
        .from('training_schemas')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.log('❌ Error fetching sample schema:', sampleError.message);
        return;
      }

      if (sampleSchema && sampleSchema.length > 0) {
        console.log('📊 Sample schema structure:');
        console.log(JSON.stringify(sampleSchema[0], null, 2));
      }
    } else {
      console.log('✅ Table constraints:');
      constraints?.forEach(constraint => {
        console.log(`- ${constraint.constraint_name}: ${constraint.constraint_definition}`);
      });
    }

    // 3. Try to create a test schema with different categories
    console.log('\n🧪 Testing category values...');
    
    const testCategories = ['progression', 'specialized', 'advanced', 'intermediate', 'beginner', 'custom'];
    
    for (const testCategory of testCategories) {
      console.log(`Testing category: ${testCategory}`);
      
      const { data: testSchema, error: testError } = await supabase
        .from('training_schemas')
        .insert({
          name: `Test Schema - ${testCategory}`,
          description: 'Test schema to check category constraint',
          category: testCategory,
          difficulty: 'Beginner',
          status: 'draft',
          training_goal: 'spiermassa',
          rep_range: '8-12',
          rest_time_seconds: 90,
          equipment_type: 'gym'
        })
        .select()
        .single();

      if (testError) {
        console.log(`❌ Category '${testCategory}' failed:`, testError.message);
        
        // Try to delete the test schema if it was created
        if (testSchema) {
          await supabase
            .from('training_schemas')
            .delete()
            .eq('id', testSchema.id);
        }
      } else {
        console.log(`✅ Category '${testCategory}' works!`);
        
        // Clean up test schema
        await supabase
          .from('training_schemas')
          .delete()
          .eq('id', testSchema.id);
      }
    }

    console.log('\n🎉 Category check completed!');

  } catch (error) {
    console.error('❌ Error checking categories:', error);
  }
}

checkTrainingSchemaCategories();
