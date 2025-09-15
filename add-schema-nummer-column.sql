-- Add schema_nummer column to training_schemas table
ALTER TABLE training_schemas 
ADD COLUMN IF NOT EXISTS schema_nummer INTEGER;

-- Update Power & Kracht Gym Advanced 6x per week schemas with numbers 1, 2, 3
UPDATE training_schemas 
SET schema_nummer = 1 
WHERE training_goal = 'power_kracht' 
AND equipment_type = 'gym' 
AND difficulty = 'Advanced' 
AND name LIKE '%6 dagen%'
AND id = (
  SELECT id FROM training_schemas 
  WHERE training_goal = 'power_kracht' 
  AND equipment_type = 'gym' 
  AND difficulty = 'Advanced' 
  AND name LIKE '%6 dagen%'
  ORDER BY name 
  LIMIT 1
);

UPDATE training_schemas 
SET schema_nummer = 2 
WHERE training_goal = 'power_kracht' 
AND equipment_type = 'gym' 
AND difficulty = 'Advanced' 
AND name LIKE '%6 dagen%'
AND id = (
  SELECT id FROM training_schemas 
  WHERE training_goal = 'power_kracht' 
  AND equipment_type = 'gym' 
  AND difficulty = 'Advanced' 
  AND name LIKE '%6 dagen%'
  ORDER BY name 
  OFFSET 1 LIMIT 1
);

UPDATE training_schemas 
SET schema_nummer = 3 
WHERE training_goal = 'power_kracht' 
AND equipment_type = 'gym' 
AND difficulty = 'Advanced' 
AND name LIKE '%6 dagen%'
AND id = (
  SELECT id FROM training_schemas 
  WHERE training_goal = 'power_kracht' 
  AND equipment_type = 'gym' 
  AND difficulty = 'Advanced' 
  AND name LIKE '%6 dagen%'
  ORDER BY name 
  OFFSET 2 LIMIT 1
);

-- Verify the updates
SELECT id, name, training_goal, equipment_type, difficulty, schema_nummer 
FROM training_schemas 
WHERE training_goal = 'power_kracht' 
AND equipment_type = 'gym' 
AND difficulty = 'Advanced' 
AND name LIKE '%6 dagen%'
ORDER BY schema_nummer;
