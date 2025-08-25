-- V2.0: Database Structure Inspection
-- Execute this in Supabase SQL Editor to see the actual database structure

-- ========================================
-- CHECK ALL TABLES IN PUBLIC SCHEMA
-- ========================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ========================================
-- CHECK COLUMNS FOR EACH TABLE
-- ========================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  )
ORDER BY table_name, ordinal_position;

-- ========================================
-- CHECK EXISTING RLS POLICIES
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- CHECK RLS STATUS FOR ALL TABLES
-- ========================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ========================================
-- CHECK FOREIGN KEY CONSTRAINTS
-- ========================================
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
