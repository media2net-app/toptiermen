-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  primary_muscle VARCHAR(100) NOT NULL,
  secondary_muscles TEXT[], -- Array of secondary muscles
  equipment VARCHAR(100) NOT NULL,
  video_url TEXT,
  instructions TEXT NOT NULL,
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscle ON exercises(primary_muscle);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Allow all users to read exercises (for social features)
CREATE POLICY "Allow all users to select exercises" ON exercises
FOR SELECT
USING (true);

-- Allow authenticated users to insert exercises (for admins)
CREATE POLICY "Allow authenticated users to insert exercises" ON exercises
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update exercises (for admins)
CREATE POLICY "Allow authenticated users to update exercises" ON exercises
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete exercises (for admins)
CREATE POLICY "Allow authenticated users to delete exercises" ON exercises
FOR DELETE
USING (auth.role() = 'authenticated');

-- Insert the 35 exercises we created
INSERT INTO exercises (name, primary_muscle, secondary_muscles, equipment, video_url, instructions, difficulty) VALUES
-- BORST - 5 meest populaire oefeningen
('Bench Press', 'Borst', ARRAY['Triceps', 'Voorste Deltavleugel'], 'Barbell', '/video-placeholder.jpg', 'Ga liggen op de bank, pak de stang op schouderbreedte, laat zakken naar borst en duw omhoog.', 'Intermediate'),
('Dumbbell Press', 'Borst', ARRAY['Triceps', 'Voorste Deltavleugel'], 'Dumbbell', '/video-placeholder.jpg', 'Ga liggen met dumbbells op schouderhoogte, duw beide dumbbells gelijktijdig omhoog.', 'Beginner'),
('Push-ups', 'Borst', ARRAY['Triceps', 'Voorste Deltavleugel', 'Core'], 'Bodyweight', '/video-placeholder.jpg', 'Start in plank positie, laat je lichaam zakken en duw jezelf omhoog.', 'Beginner'),
('Incline Bench Press', 'Borst', ARRAY['Triceps', 'Voorste Deltavleugel'], 'Barbell', '/video-placeholder.jpg', 'Bench press op een hellende bank (30-45 graden) voor focus op bovenste borst.', 'Intermediate'),
('Cable Flyes', 'Borst', ARRAY['Voorste Deltavleugel'], 'Cable', '/video-placeholder.jpg', 'Sta tussen de kabels, trek beide kabels naar elkaar toe in een vloeiende beweging.', 'Intermediate'),

-- RUG - 5 meest populaire oefeningen
('Pull-up', 'Rug', ARRAY['Biceps', 'Onderarmen'], 'Bodyweight', '/video-placeholder.jpg', 'Hang aan de pull-up bar, trek jezelf omhoog tot je kin over de stang is.', 'Advanced'),
('Deadlift', 'Rug', ARRAY['Benen', 'Glutes', 'Core'], 'Barbell', '/video-placeholder.jpg', 'Pak de stang op, houd je rug recht en til de stang op door je heupen te strekken.', 'Advanced'),
('Barbell Row', 'Rug', ARRAY['Biceps', 'Onderarmen'], 'Barbell', '/video-placeholder.jpg', 'Buig voorover, trek de stang naar je onderbuik terwijl je je ellebogen dicht bij je lichaam houdt.', 'Intermediate'),
('Lat Pulldown', 'Rug', ARRAY['Biceps', 'Onderarmen'], 'Machine', '/video-placeholder.jpg', 'Trek de stang naar je borst terwijl je je schouderbladen naar elkaar toe trekt.', 'Beginner'),
('Seated Cable Row', 'Rug', ARRAY['Biceps', 'Onderarmen'], 'Cable', '/video-placeholder.jpg', 'Zit rechtop, trek de handgrepen naar je buik terwijl je je rug recht houdt.', 'Beginner'),

-- BENEN - 5 meest populaire oefeningen
('Squat', 'Benen', ARRAY['Glutes', 'Core'], 'Barbell', '/video-placeholder.jpg', 'Plaats de stang op je schouders, zak door je knieën tot je dijen parallel zijn aan de grond.', 'Beginner'),
('Leg Press', 'Benen', ARRAY['Glutes'], 'Machine', '/video-placeholder.jpg', 'Zit in de machine, duw het platform weg met je voeten en laat gecontroleerd zakken.', 'Beginner'),
('Lunges', 'Benen', ARRAY['Glutes', 'Core'], 'Dumbbell', '/video-placeholder.jpg', 'Stap naar voren, zak door beide knieën en duw jezelf terug naar de startpositie.', 'Beginner'),
('Romanian Deadlift', 'Benen', ARRAY['Rug', 'Glutes'], 'Barbell', '/video-placeholder.jpg', 'Houd je benen recht, buig voorover en laat de stang langs je benen zakken.', 'Intermediate'),

-- SCHOUDERS - 5 meest populaire oefeningen
('Overhead Press', 'Schouders', ARRAY['Triceps', 'Core'], 'Barbell', '/video-placeholder.jpg', 'Duw de stang van schouderhoogte omhoog tot je armen volledig gestrekt zijn.', 'Intermediate'),
('Dumbbell Shoulder Press', 'Schouders', ARRAY['Triceps'], 'Dumbbell', '/video-placeholder.jpg', 'Duw beide dumbbells gelijktijdig omhoog vanaf schouderhoogte.', 'Beginner'),
('Lateral Raises', 'Schouders', ARRAY['Trapezius'], 'Dumbbell', '/video-placeholder.jpg', 'Hef beide dumbbells zijwaarts omhoog tot schouderhoogte.', 'Beginner'),
('Front Raises', 'Schouders', ARRAY['Voorste Deltavleugel'], 'Dumbbell', '/video-placeholder.jpg', 'Hef beide dumbbells voorwaarts omhoog tot schouderhoogte.', 'Beginner'),
('Upright Rows', 'Schouders', ARRAY['Trapezius', 'Biceps'], 'Barbell', '/video-placeholder.jpg', 'Trek de stang omhoog langs je lichaam tot onder je kin.', 'Intermediate'),

-- ARMEN - 5 meest populaire oefeningen
('Bicep Curl', 'Armen', ARRAY['Onderarmen'], 'Dumbbell', '/video-placeholder.jpg', 'Hef de dumbbells omhoog door je ellebogen te buigen, houd je bovenarmen stil.', 'Beginner'),
('Tricep Dip', 'Armen', ARRAY['Borst', 'Schouders'], 'Bodyweight', '/video-placeholder.jpg', 'Laat je lichaam zakken door je ellebogen te buigen en duw jezelf omhoog.', 'Intermediate'),
('Hammer Curl', 'Armen', ARRAY['Onderarmen'], 'Dumbbell', '/video-placeholder.jpg', 'Hef de dumbbells omhoog met je handpalmen naar elkaar toe gericht.', 'Beginner'),
('Tricep Pushdown', 'Armen', ARRAY[]::text[], 'Cable', '/video-placeholder.jpg', 'Duw de kabel naar beneden door je ellebogen te strekken.', 'Beginner'),
('Preacher Curl', 'Armen', ARRAY['Onderarmen'], 'Barbell', '/video-placeholder.jpg', 'Voer bicep curls uit met je armen ondersteund op de preacher bank.', 'Intermediate'),

-- CORE - 5 meest populaire oefeningen
('Plank', 'Core', ARRAY['Schouders', 'Glutes'], 'Bodyweight', '/video-placeholder.jpg', 'Houd je lichaam in een rechte lijn, ondersteund door je onderarmen en tenen.', 'Beginner'),
('Crunches', 'Core', ARRAY[]::text[], 'Bodyweight', '/video-placeholder.jpg', 'Krul je bovenlichaam omhoog terwijl je je voeten op de grond houdt.', 'Beginner'),
('Russian Twist', 'Core', ARRAY['Obliques'], 'Dumbbell', '/video-placeholder.jpg', 'Draai je bovenlichaam van links naar rechts terwijl je je voeten van de grond houdt.', 'Intermediate'),
('Mountain Climbers', 'Core', ARRAY['Schouders', 'Benen'], 'Bodyweight', '/video-placeholder.jpg', 'Wissel snel je knieën af terwijl je in plank positie blijft.', 'Intermediate'),
('Leg Raises', 'Core', ARRAY['Heupflexoren'], 'Bodyweight', '/video-placeholder.jpg', 'Hef je benen omhoog terwijl je op je rug ligt, houd je onderrug op de grond.', 'Intermediate'),

-- GLUTES - 5 meest populaire oefeningen
('Hip Thrust', 'Glutes', ARRAY['Benen', 'Core'], 'Barbell', '/video-placeholder.jpg', 'Leun tegen een bank, plaats de stang op je heupen en duw je heupen omhoog.', 'Intermediate'),
('Glute Bridge', 'Glutes', ARRAY['Benen', 'Core'], 'Bodyweight', '/video-placeholder.jpg', 'Lig op je rug, buig je knieën en duw je heupen omhoog.', 'Beginner'),
('Donkey Kicks', 'Glutes', ARRAY['Benen'], 'Bodyweight', '/video-placeholder.jpg', 'Op handen en knieën, schop je been omhoog en naar achteren.', 'Beginner'),
('Bulgarian Split Squat', 'Glutes', ARRAY['Benen', 'Core'], 'Dumbbell', '/video-placeholder.jpg', 'Plaats je achterste voet op een verhoging en voer squats uit met je voorste been.', 'Advanced'),
('Cable Kickback', 'Glutes', ARRAY['Benen'], 'Cable', '/video-placeholder.jpg', 'Schop je been naar achteren terwijl je voorover buigt en de kabel vasthoudt.', 'Beginner');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_exercises_updated_at 
    BEFORE UPDATE ON exercises 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 