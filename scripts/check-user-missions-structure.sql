-- Check the actual structure of user_missions table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_missions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the table exists and show its structure
\d user_missions;
