-- Zet een unieke, oplopende order_index op basis van aanmaakdatum
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM academy_modules
)
UPDATE academy_modules
SET order_index = ordered.rn
FROM ordered
WHERE academy_modules.id = ordered.id;
