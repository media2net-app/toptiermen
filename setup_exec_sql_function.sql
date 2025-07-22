-- Setup SQL Execution Function voor AI Assistant
-- Voer dit uit in je Supabase SQL Editor

-- Maak een functie voor SQL uitvoering (alleen voor development!)
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Voer de SQL uit
  EXECUTE sql_query;
  RETURN json_build_object('success', true, 'message', 'SQL executed successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Geef rechten aan de service role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- Test de functie
SELECT exec_sql('SELECT 1 as test'); 