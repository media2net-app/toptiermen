-- Add selected_schema_id column to users table
-- This allows users to save their preferred training schema

-- Add the column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS selected_schema_id UUID REFERENCES training_schemas(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_selected_schema_id ON users(selected_schema_id);

-- Add comment for documentation
COMMENT ON COLUMN users.selected_schema_id IS 'The training schema that the user has selected as their preferred/active schema'; 