-- Fix Training Schema Policies
-- This script safely handles existing policies by dropping them first

-- Drop existing policies for training_schemas
DROP POLICY IF EXISTS "Allow all users to select published training schemas" ON training_schemas;
DROP POLICY IF EXISTS "Allow authenticated users to select all training schemas" ON training_schemas;
DROP POLICY IF EXISTS "Allow authenticated users to insert training schemas" ON training_schemas;
DROP POLICY IF EXISTS "Allow authenticated users to update training schemas" ON training_schemas;
DROP POLICY IF EXISTS "Allow authenticated users to delete training schemas" ON training_schemas;

-- Drop existing policies for training_schema_days
DROP POLICY IF EXISTS "Allow all users to select training schema days" ON training_schema_days;
DROP POLICY IF EXISTS "Allow authenticated users to insert training schema days" ON training_schema_days;
DROP POLICY IF EXISTS "Allow authenticated users to update training schema days" ON training_schema_days;
DROP POLICY IF EXISTS "Allow authenticated users to delete training schema days" ON training_schema_days;

-- Drop existing policies for training_schema_exercises
DROP POLICY IF EXISTS "Allow all users to select training schema exercises" ON training_schema_exercises;
DROP POLICY IF EXISTS "Allow authenticated users to insert training schema exercises" ON training_schema_exercises;
DROP POLICY IF EXISTS "Allow authenticated users to update training schema exercises" ON training_schema_exercises;
DROP POLICY IF EXISTS "Allow authenticated users to delete training schema exercises" ON training_schema_exercises;

-- Drop existing policies for user_training_schema_progress
DROP POLICY IF EXISTS "Allow users to select their own training schema progress" ON user_training_schema_progress;
DROP POLICY IF EXISTS "Allow users to insert their own training schema progress" ON user_training_schema_progress;
DROP POLICY IF EXISTS "Allow users to update their own training schema progress" ON user_training_schema_progress;
DROP POLICY IF EXISTS "Allow users to delete their own training schema progress" ON user_training_schema_progress;

-- Drop existing policies for user_training_day_progress
DROP POLICY IF EXISTS "Allow users to select their own training day progress" ON user_training_day_progress;
DROP POLICY IF EXISTS "Allow users to insert their own training day progress" ON user_training_day_progress;
DROP POLICY IF EXISTS "Allow users to update their own training day progress" ON user_training_day_progress;
DROP POLICY IF EXISTS "Allow users to delete their own training day progress" ON user_training_day_progress;

-- Recreate RLS Policies for training_schemas
CREATE POLICY "Allow all users to select published training schemas" ON training_schemas
FOR SELECT
USING (status = 'published');

CREATE POLICY "Allow authenticated users to select all training schemas" ON training_schemas
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert training schemas" ON training_schemas
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update training schemas" ON training_schemas
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete training schemas" ON training_schemas
FOR DELETE
USING (auth.role() = 'authenticated');

-- Recreate RLS Policies for training_schema_days
CREATE POLICY "Allow all users to select training schema days" ON training_schema_days
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert training schema days" ON training_schema_days
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update training schema days" ON training_schema_days
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete training schema days" ON training_schema_days
FOR DELETE
USING (auth.role() = 'authenticated');

-- Recreate RLS Policies for training_schema_exercises
CREATE POLICY "Allow all users to select training schema exercises" ON training_schema_exercises
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert training schema exercises" ON training_schema_exercises
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update training schema exercises" ON training_schema_exercises
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete training schema exercises" ON training_schema_exercises
FOR DELETE
USING (auth.role() = 'authenticated');

-- Recreate RLS Policies for user_training_schema_progress
CREATE POLICY "Allow users to select their own training schema progress" ON user_training_schema_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own training schema progress" ON user_training_schema_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own training schema progress" ON user_training_schema_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own training schema progress" ON user_training_schema_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Recreate RLS Policies for user_training_day_progress
CREATE POLICY "Allow users to select their own training day progress" ON user_training_day_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own training day progress" ON user_training_day_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own training day progress" ON user_training_day_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own training day progress" ON user_training_day_progress
FOR DELETE
USING (auth.uid() = user_id); 