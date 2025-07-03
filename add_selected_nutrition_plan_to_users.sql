-- Add selected_nutrition_plan column to users table
-- Hiermee kan het gekozen voedingsplan van de gebruiker worden opgeslagen

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS selected_nutrition_plan TEXT;

CREATE INDEX IF NOT EXISTS idx_users_selected_nutrition_plan ON users(selected_nutrition_plan);

COMMENT ON COLUMN users.selected_nutrition_plan IS 'De voedingsaanpak die de gebruiker heeft gekozen (bijv. balanced, low_carb, carnivore, high_protein)'; 