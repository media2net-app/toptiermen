-- Add nutrition_profile column to users table
-- Hiermee kan de stap 1 voedingsinvoer per gebruiker als JSON worden opgeslagen

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nutrition_profile JSONB;

COMMENT ON COLUMN users.nutrition_profile IS 'De persoonlijke voedingsinvoer van de gebruiker (leeftijd, lengte, gewicht, activiteit, doel) als JSON'; 