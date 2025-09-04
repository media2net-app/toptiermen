-- Create custom_training_schemas table for user-modified training plans

CREATE TABLE IF NOT EXISTS custom_training_schemas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
  custom_name VARCHAR(255),
  custom_description TEXT,
  custom_data JSONB NOT NULL, -- Store the full customized schema data
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, base_schema_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_training_schemas_user_id ON custom_training_schemas(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_training_schemas_base_schema_id ON custom_training_schemas(base_schema_id);
CREATE INDEX IF NOT EXISTS idx_custom_training_schemas_active ON custom_training_schemas(user_id, is_active);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_custom_training_schemas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_custom_training_schemas_updated_at ON custom_training_schemas;
CREATE TRIGGER trigger_update_custom_training_schemas_updated_at
  BEFORE UPDATE ON custom_training_schemas
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_training_schemas_updated_at();

-- Enable Row Level Security
ALTER TABLE custom_training_schemas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own custom training schemas" ON custom_training_schemas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom training schemas" ON custom_training_schemas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom training schemas" ON custom_training_schemas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom training schemas" ON custom_training_schemas
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON custom_training_schemas TO authenticated;
GRANT ALL ON custom_training_schemas TO service_role;
