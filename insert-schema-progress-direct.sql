-- Insereren van schema progress records voor Chiel (bypassing RLS)

-- Schema 1 - COMPLETED
INSERT INTO user_training_schema_progress (
  user_id,
  schema_id,
  current_day,
  total_days,
  completed_days,
  started_at,
  completed_at,
  is_active
)
VALUES (
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
  'db20b8ec-6c13-405f-acb3-5d8a3796c8c7',
  32,
  32,
  32,
  '2025-08-01T00:00:00Z',
  '2025-09-26T00:00:00Z',
  false
)
ON CONFLICT (user_id, schema_id) DO UPDATE SET
  completed_days = 32,
  total_days = 32,
  completed_at = '2025-09-26T00:00:00Z',
  is_active = false;

-- Schema 2 - COMPLETED
INSERT INTO user_training_schema_progress (
  user_id,
  schema_id,
  current_day,
  total_days,
  completed_days,
  started_at,
  completed_at,
  is_active
)
VALUES (
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
  '2f1d7476-5cd2-4d99-9c44-a0a2bc135e87',
  32,
  32,
  32,
  '2025-09-27T00:00:00Z',
  '2025-10-11T00:00:00Z',
  false
)
ON CONFLICT (user_id, schema_id) DO UPDATE SET
  completed_days = 32,
  total_days = 32,
  completed_at = '2025-10-11T00:00:00Z',
  is_active = false;

-- Schema 3 - ACTIVE
INSERT INTO user_training_schema_progress (
  user_id,
  schema_id,
  current_day,
  total_days,
  completed_days,
  started_at,
  completed_at,
  is_active
)
VALUES (
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
  '04662e88-a229-4a17-9e1e-adabe301ca91',
  4,
  32,
  4,
  '2025-10-12T00:00:00Z',
  NULL,
  true
)
ON CONFLICT (user_id, schema_id) DO UPDATE SET
  current_day = 4,
  completed_days = 4,
  total_days = 32,
  started_at = '2025-10-12T00:00:00Z',
  is_active = true,
  completed_at = NULL;

-- Verificatie
SELECT 
  utsp.user_id,
  ts.name,
  ts.schema_nummer,
  utsp.completed_days,
  utsp.total_days,
  utsp.completed_at,
  utsp.is_active
FROM user_training_schema_progress utsp
JOIN training_schemas ts ON ts.id = utsp.schema_id
WHERE utsp.user_id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'
ORDER BY ts.schema_nummer;

