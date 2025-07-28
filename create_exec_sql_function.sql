-- Create exec_sql function for programmatic SQL execution
-- This function allows the service role to execute SQL statements programmatically
-- WARNING: Only use this in development environments!

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS exec_sql(text);

-- Create the exec_sql function
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json AS $$
DECLARE
    result json;
    error_msg text;
    query_type text;
BEGIN
    -- Determine if this is a SELECT query or other type
    query_type := upper(trim(split_part(sql_query, ' ', 1)));
    
    IF query_type = 'SELECT' THEN
        -- For SELECT queries, return results as JSON
        EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
        
        -- If no results, return empty array
        IF result IS NULL THEN
            result := '[]'::json;
        END IF;
        
        RETURN json_build_object(
            'success', true,
            'data', result,
            'type', 'select'
        );
    ELSE
        -- For non-SELECT queries (INSERT, UPDATE, DELETE, CREATE, etc.)
        EXECUTE sql_query;
        
        RETURN json_build_object(
            'success', true,
            'data', 'Query executed successfully',
            'type', 'other'
        );
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error information
    error_msg := SQLERRM;
    RETURN json_build_object(
        'success', false,
        'error', error_msg,
        'type', 'error'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- Test the function
SELECT exec_sql('SELECT 1 as test, NOW() as current_time');

-- Add comment for documentation
COMMENT ON FUNCTION exec_sql(text) IS 'Allows programmatic SQL execution for development purposes. Use with caution!'; 