-- Add selected_schema_id column to profiles table
ALTER TABLE profiles 
ADD COLUMN selected_schema_id UUID REFERENCES training_schemas(id);

-- Add comment to explain the column
COMMENT ON COLUMN profiles.selected_schema_id IS 'References the currently selected training schema for this user';

-- Update RLS policies to allow users to update their own selected_schema_id
CREATE POLICY "Users can update their own selected_schema_id" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Show the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'selected_schema_id';
