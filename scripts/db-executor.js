const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file for:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class DatabaseExecutor {
  constructor() {
    this.supabase = supabase;
  }

  // Test database connection
  async testConnection() {
    try {
      console.log('🔍 Testing database connection...');
      
      const { data, error } = await this.supabase.rpc('exec_sql', {
        sql_query: 'SELECT NOW() as current_time, version() as db_version'
      });

      if (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }

      // Handle the new response format
      if (data && typeof data === 'object') {
        if (data.success === false) {
          console.error('❌ Connection test failed:', data.error);
          return false;
        }
        
        console.log('✅ Database connection successful');
        console.log('📊 Database info:', data.data);
        return true;
      }

      console.log('✅ Database connection successful');
      console.log('📊 Database info:', data);
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  // Execute a single SQL statement
  async executeSQL(sql) {
    try {
      const { data, error } = await this.supabase.rpc('exec_sql', {
        sql_query: sql
      });

      if (error) {
        console.error('❌ SQL execution error:', error);
        return { success: false, error };
      }

      // Handle direct array response (most common case)
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      // Handle the new response format (object with success/error)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (data.success === false) {
          console.error('❌ SQL execution failed:', data.error);
          return { success: false, error: data.error };
        }
        
        if (data.type === 'select') {
          return { success: true, data: data.data };
        } else if (data.type === 'ddl' || data.type === 'other') {
          return { success: true, data: data.data };
        } else {
          return { success: true, data: data.data };
        }
      }

      // Handle direct object response (for non-SELECT queries)
      if (data && typeof data === 'object' && data.success !== undefined) {
        return { success: data.success, data: data.data, error: data.error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ SQL execution exception:', error);
      return { success: false, error };
    }
  }

  // Execute SQL file
  async executeSQLFile(filePath) {
    try {
      console.log(`📖 Reading SQL file: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // Split into individual statements (handle function definitions properly)
      const statements = [];
      let currentStatement = '';
      let inFunction = false;
      let dollarQuoteLevel = 0;
      
      const lines = sqlContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip comments
        if (trimmedLine.startsWith('--')) {
          continue;
        }
        
        // Check for dollar quotes
        const dollarQuotes = (trimmedLine.match(/\$\$/g) || []).length;
        if (dollarQuotes > 0) {
          dollarQuoteLevel += dollarQuotes;
        }
        
        // Check if we're in a function definition
        if (trimmedLine.toUpperCase().includes('CREATE OR REPLACE FUNCTION') || 
            trimmedLine.toUpperCase().includes('CREATE FUNCTION')) {
          inFunction = true;
        }
        
        currentStatement += line + '\n';
        
        // If we're in a function and see LANGUAGE plpgsql, end the function
        if (inFunction && trimmedLine.toUpperCase().includes('LANGUAGE PLPGSQL')) {
          statements.push(currentStatement.trim());
          currentStatement = '';
          inFunction = false;
          continue;
        }
        
        // If not in function and see semicolon, end statement
        if (!inFunction && !trimmedLine.startsWith('--') && trimmedLine.endsWith(';')) {
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      }
      
      // Add any remaining statement
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      
      // Filter out empty statements
      const filteredStatements = statements
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📝 Found ${filteredStatements.length} SQL statements to execute`);

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < filteredStatements.length; i++) {
        const statement = filteredStatements[i];
        if (statement.trim()) {
                      console.log(`\n🔧 Executing statement ${i + 1}/${filteredStatements.length}...`);
          
          const result = await this.executeSQL(statement);
          
          if (result.success) {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, result.error);
            errorCount++;
          }
          
          results.push({
            statement: i + 1,
            sql: statement.substring(0, 100) + '...',
            success: result.success,
            error: result.error
          });
        }
      }

      console.log(`\n📊 Execution Summary:`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Failed: ${errorCount}`);
      console.log(`📝 Total: ${filteredStatements.length}`);

      return {
        success: errorCount === 0,
        results,
        summary: { successCount, errorCount, total: filteredStatements.length }
      };

    } catch (error) {
      console.error('❌ Error executing SQL file:', error);
      return { success: false, error };
    }
  }

  // Create exec_sql function if it doesn't exist
  async ensureExecSqlFunction() {
    try {
      console.log('🔧 Ensuring exec_sql function exists...');
      
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS json AS $$
        DECLARE
            result json;
            error_msg text;
        BEGIN
            -- Execute the SQL query and return results as JSON
            EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
            
            -- If no results, return empty array
            IF result IS NULL THEN
                result := '[]'::json;
            END IF;
            
            RETURN result;
            
        EXCEPTION WHEN OTHERS THEN
            -- Return error information
            error_msg := SQLERRM;
            RETURN json_build_object(
                'error', error_msg,
                'success', false
            );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Grant execute permission to service_role
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
      `;

      // Try to execute a simple query first to test if function exists
      const testResult = await this.supabase.rpc('exec_sql', {
        sql_query: 'SELECT 1 as test;'
      });

      if (testResult.error) {
        console.log('⚠️ exec_sql function not available, creating it...');
        
        // Since we can't create the function through RPC, we'll use direct SQL
        const { error } = await this.supabase
          .from('_dummy_table_that_doesnt_exist')
          .select('*')
          .limit(1);

        console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
        console.log(createFunctionSQL);
        
        return false;
      } else {
        console.log('✅ exec_sql function is available');
        return true;
      }

    } catch (error) {
      console.error('❌ Error ensuring exec_sql function:', error);
      return false;
    }
  }

  // List all tables
  async listTables() {
    try {
      const result = await this.executeSQL(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      if (result.success) {
        console.log('📋 Available tables:');
        console.log(result.data);
        return result.data;
      } else {
        console.error('❌ Failed to list tables:', result.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Error listing tables:', error);
      return [];
    }
  }

  // Check table structure
  async describeTable(tableName) {
    try {
      const result = await this.executeSQL(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `);

      if (result.success) {
        console.log(`📋 Table structure for '${tableName}':`);
        console.log(result.data);
        return result.data;
      } else {
        console.error(`❌ Failed to describe table '${tableName}':`, result.error);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error describing table '${tableName}':`, error);
      return [];
    }
  }

  // Backup table data
  async backupTable(tableName) {
    try {
      console.log(`💾 Creating backup of table '${tableName}'...`);
      
      const result = await this.executeSQL(`
        SELECT * FROM ${tableName};
      `);

      if (result.success) {
        const backupPath = `backup_${tableName}_${Date.now()}.json`;
        fs.writeFileSync(backupPath, JSON.stringify(result.data, null, 2));
        console.log(`✅ Backup saved to: ${backupPath}`);
        return backupPath;
      } else {
        console.error(`❌ Failed to backup table '${tableName}':`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error backing up table '${tableName}':`, error);
      return null;
    }
  }

  // Execute multiple SQL files
  async executeMultipleFiles(filePaths) {
    console.log(`🚀 Executing ${filePaths.length} SQL files...`);
    
    const results = [];
    
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      console.log(`\n📁 File ${i + 1}/${filePaths.length}: ${filePath}`);
      
      const result = await this.executeSQLFile(filePath);
      results.push({
        file: filePath,
        ...result
      });
    }

    console.log('\n📊 Overall Summary:');
    const totalSuccess = results.filter(r => r.success).length;
    const totalFailed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful files: ${totalSuccess}`);
    console.log(`❌ Failed files: ${totalFailed}`);
    console.log(`📝 Total files: ${filePaths.length}`);

    return results;
  }
}

// Export the class and create a default instance
const dbExecutor = new DatabaseExecutor();

module.exports = {
  DatabaseExecutor,
  dbExecutor,
  // Convenience functions
  executeSQL: (sql) => dbExecutor.executeSQL(sql),
  executeSQLFile: (filePath) => dbExecutor.executeSQLFile(filePath),
  testConnection: () => dbExecutor.testConnection(),
  listTables: () => dbExecutor.listTables(),
  describeTable: (tableName) => dbExecutor.describeTable(tableName),
  backupTable: (tableName) => dbExecutor.backupTable(tableName),
  executeMultipleFiles: (filePaths) => dbExecutor.executeMultipleFiles(filePaths)
};

// If this file is run directly, test the connection
if (require.main === module) {
  (async () => {
    console.log('🧪 Testing Database Executor...\n');
    
    const success = await dbExecutor.testConnection();
    
    if (success) {
      console.log('\n🎉 Database executor is ready to use!');
      console.log('\n📋 Available commands:');
      console.log('- node scripts/db-executor.js test');
      console.log('- node scripts/db-executor.js list-tables');
      console.log('- node scripts/db-executor.js execute <file.sql>');
      console.log('- node scripts/db-executor.js describe <table>');
    } else {
      console.log('\n❌ Database executor setup failed');
      console.log('Please check your environment variables and database connection');
    }
  })();
} 