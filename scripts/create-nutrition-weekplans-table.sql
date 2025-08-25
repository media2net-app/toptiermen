-- Create nutrition_weekplans table for storing detailed meal plans
CREATE TABLE IF NOT EXISTS nutrition_weekplans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  meal_plan JSONB NOT NULL,
  total_calories INTEGER,
  total_protein DECIMAL(5,2),
  total_carbs DECIMAL(5,2),
  total_fat DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, day_of_week)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nutrition_weekplans_plan_day ON nutrition_weekplans(plan_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_nutrition_weekplans_plan_id ON nutrition_weekplans(plan_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_weekplans_day ON nutrition_weekplans(day_of_week);

-- Enable RLS (Row Level Security)
ALTER TABLE nutrition_weekplans ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read nutrition weekplans" ON nutrition_weekplans
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies for admin users
CREATE POLICY "Allow admins to manage nutrition weekplans" ON nutrition_weekplans
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Grant necessary permissions
GRANT ALL ON nutrition_weekplans TO authenticated;
GRANT ALL ON nutrition_weekplans TO service_role;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_nutrition_weekplans_updated_at ON nutrition_weekplans;
CREATE TRIGGER update_nutrition_weekplans_updated_at
    BEFORE UPDATE ON nutrition_weekplans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample carnivore Monday plan
INSERT INTO nutrition_weekplans (plan_id, day_of_week, meal_plan, total_calories, total_protein, total_carbs, total_fat) 
VALUES (
  'carnivore',
  'monday',
  '{
    "day": "monday",
    "diet_type": "carnivore",
    "nutrition_summary": {
      "total_calories": 2200,
      "total_protein": 180,
      "total_carbs": 15,
      "total_fat": 160,
      "protein_percentage": 33,
      "carbs_percentage": 3,
      "fat_percentage": 64
    },
    "meals": [
      {
        "id": "monday-carnivore-breakfast",
        "name": "Orgaanvlees & Eieren Ontbijt",
        "description": "Traditioneel carnivoor ontbijt met lever, hart en eieren voor maximale voedingsstoffen",
        "time": "08:00",
        "type": "breakfast",
        "calories": 450,
        "protein": 35,
        "carbs": 3,
        "fat": 30,
        "ingredients": [
          {
            "name": "Orgaanvlees (Lever)",
            "amount": 100,
            "unit": "g",
            "calories_per_100g": 130,
            "protein_per_100g": 20,
            "carbs_per_100g": 3,
            "fat_per_100g": 4
          },
          {
            "name": "Orgaanvlees (Hart)",
            "amount": 50,
            "unit": "g",
            "calories_per_100g": 110,
            "protein_per_100g": 18,
            "carbs_per_100g": 0,
            "fat_per_100g": 4
          },
          {
            "name": "Eieren",
            "amount": 3,
            "unit": "stuks",
            "calories_per_100g": 155,
            "protein_per_100g": 13,
            "carbs_per_100g": 1.1,
            "fat_per_100g": 11
          },
          {
            "name": "Talow",
            "amount": 15,
            "unit": "g",
            "calories_per_100g": 900,
            "protein_per_100g": 0,
            "carbs_per_100g": 0,
            "fat_per_100g": 100
          },
          {
            "name": "Zout",
            "amount": 5,
            "unit": "g",
            "calories_per_100g": 0,
            "protein_per_100g": 0,
            "carbs_per_100g": 0,
            "fat_per_100g": 0
          }
        ],
        "instructions": [
          "1. Verwarm een pan op middelhoog vuur",
          "2. Voeg talow toe en laat smelten",
          "3. Bak lever 2-3 minuten per kant (medium-rare)",
          "4. Bak hart 3-4 minuten per kant",
          "5. Bak eieren in dezelfde pan",
          "6. Kruid met zout en serveer warm"
        ],
        "tips": [
          "Lever is rijk aan vitamine A, B12, foliumzuur en ijzer",
          "Hart bevat co-enzym Q10 en creatine",
          "Eieren voorzien in choline en gezonde vetten",
          "Talow is een traditionele carnivoor vetbron"
        ]
      },
      {
        "id": "monday-carnivore-lunch",
        "name": "Gegrilde Ribeye Steak",
        "description": "Premium ribeye steak met boter en zout - de perfecte carnivoor lunch",
        "time": "13:00",
        "type": "lunch",
        "calories": 600,
        "protein": 45,
        "carbs": 0,
        "fat": 45,
        "ingredients": [
          {
            "name": "Ribeye Steak",
            "amount": 250,
            "unit": "g",
            "calories_per_100g": 280,
            "protein_per_100g": 25,
            "carbs_per_100g": 0,
            "fat_per_100g": 20
          },
          {
            "name": "Boter",
            "amount": 30,
            "unit": "g",
            "calories_per_100g": 720,
            "protein_per_100g": 0.9,
            "carbs_per_100g": 0.1,
            "fat_per_100g": 81
          },
          {
            "name": "Zout",
            "amount": 5,
            "unit": "g",
            "calories_per_100g": 0,
            "protein_per_100g": 0,
            "carbs_per_100g": 0,
            "fat_per_100g": 0
          }
        ],
        "instructions": [
          "1. Haal steak 30 minuten voor het koken uit de koelkast",
          "2. Verwarm grill of pan op hoog vuur",
          "3. Kruid steak rijkelijk met zout",
          "4. Grill 4-5 minuten per kant voor medium-rare",
          "5. Laat 10 minuten rusten onder folie",
          "6. Serveer met een klontje boter erop"
        ],
        "tips": [
          "Ribeye is een van de vetste en smaakvolste steaks",
          "Rusttijd is cruciaal voor sappigheid",
          "Boter voegt extra vet en smaak toe",
          "Medium-rare behoudt voedingsstoffen het beste"
        ]
      },
      {
        "id": "monday-carnivore-snack",
        "name": "Gerookte Zalm & Spek",
        "description": "Vette vis gecombineerd met spek voor een perfecte carnivoor snack",
        "time": "16:00",
        "type": "snack",
        "calories": 350,
        "protein": 25,
        "carbs": 0,
        "fat": 28,
        "ingredients": [
          {
            "name": "Zalm (Wild)",
            "amount": 100,
            "unit": "g",
            "calories_per_100g": 200,
            "protein_per_100g": 25,
            "carbs_per_100g": 0,
            "fat_per_100g": 12
          },
          {
            "name": "Spek",
            "amount": 40,
            "unit": "g",
            "calories_per_100g": 400,
            "protein_per_100g": 15,
            "carbs_per_100g": 0,
            "fat_per_100g": 40
          }
        ],
        "instructions": [
          "1. Bak spek knapperig in een pan",
          "2. Serveer gerookte zalm op kamertemperatuur",
          "3. Combineer voor een perfecte vet-eiwit balans"
        ],
        "tips": [
          "Wilde zalm bevat meer omega-3 dan gekweekte",
          "Spek voegt extra vet en smaak toe",
          "Perfect voor het avondeten"
        ]
      },
      {
        "id": "monday-carnivore-dinner",
        "name": "T-Bone Steak met Eendenborst",
        "description": "Luxe carnivoor diner met premium vlees en traditionele vetten",
        "time": "19:00",
        "type": "dinner",
        "calories": 800,
        "protein": 75,
        "carbs": 0,
        "fat": 57,
        "ingredients": [
          {
            "name": "T-Bone Steak",
            "amount": 300,
            "unit": "g",
            "calories_per_100g": 250,
            "protein_per_100g": 26,
            "carbs_per_100g": 0,
            "fat_per_100g": 15
          },
          {
            "name": "Eendenborst",
            "amount": 100,
            "unit": "g",
            "calories_per_100g": 200,
            "protein_per_100g": 25,
            "carbs_per_100g": 0,
            "fat_per_100g": 10
          },
          {
            "name": "Reuzel",
            "amount": 20,
            "unit": "g",
            "calories_per_100g": 900,
            "protein_per_100g": 0,
            "carbs_per_100g": 0,
            "fat_per_100g": 100
          },
          {
            "name": "Zout",
            "amount": 5,
            "unit": "g",
            "calories_per_100g": 0,
            "protein_per_100g": 0,
            "carbs_per_100g": 0,
            "fat_per_100g": 0
          }
        ],
        "instructions": [
          "1. Verwarm oven op 200°C",
          "2. Kruid T-bone en eendenborst met zout",
          "3. Bak T-bone 6-8 minuten per kant",
          "4. Bak eendenborst 8-10 minuten (skin down)",
          "5. Laat vlees 10 minuten rusten",
          "6. Serveer met reuzel als extra vetbron"
        ],
        "tips": [
          "T-bone combineert strip en tenderloin",
          "Eendenborst is rijk aan gezonde vetten",
          "Reuzel is een traditionele carnivoor vetbron",
          "Perfecte combinatie van verschillende vleessoorten"
        ]
      }
    ],
    "carnivore_benefits": [
      "Hoog in essentiële aminozuren",
      "Rijk aan vitamine B12, D, A en K2",
      "Gezonde vetten voor energie en hormonen",
      "Minimale ontstekingsbevorderende stoffen",
      "Stabiele bloedsuikerspiegel",
      "Verbeterde mentale helderheid"
    ],
    "shopping_list": [
      "Orgaanvlees (lever) - 100g",
      "Orgaanvlees (hart) - 50g",
      "Eieren - 3 stuks",
      "Talow - 15g",
      "Ribeye steak - 250g",
      "Boter - 30g",
      "Gerookte zalm - 100g",
      "Spek - 40g",
      "T-bone steak - 300g",
      "Eendenborst - 100g",
      "Reuzel - 20g",
      "Zout"
    ]
  }'::jsonb,
  2200,
  180,
  15,
  160
) ON CONFLICT (plan_id, day_of_week) DO UPDATE SET
  meal_plan = EXCLUDED.meal_plan,
  total_calories = EXCLUDED.total_calories,
  total_protein = EXCLUDED.total_protein,
  total_carbs = EXCLUDED.total_carbs,
  total_fat = EXCLUDED.total_fat,
  updated_at = NOW();

-- Verify the insert
SELECT 
  plan_id, 
  day_of_week, 
  total_calories,
  total_protein,
  total_carbs,
  total_fat,
  jsonb_array_length(meal_plan->'meals') as meal_count
FROM nutrition_weekplans 
WHERE plan_id = 'carnivore' AND day_of_week = 'monday';
