-- Drop existing function if it exists
DROP FUNCTION IF EXISTS exec_sql(text);

-- Create a proper exec_sql function that returns query results
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

-- Test the function
SELECT exec_sql('SELECT 1 as test'); 