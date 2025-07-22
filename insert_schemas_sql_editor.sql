-- Insert New Training Schemas
-- Run this SQL directly in your Supabase SQL editor to bypass RLS policies

-- Schema 2: 2-Daags Full Body (Intermediate)
INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
VALUES (
  '2-Daags Full Body Intermediate',
  'Gevorderde 2-daags schema voor lifters met ervaring. Intensieve full body workouts voor kracht en massa.',
  'Gym',
  '/images/mind/2.png',
  'published',
  'Intermediate',
  '60 min',
  'Intermediate lifters, 2x per week trainen'
);

-- Schema 3: 3-Daags Full Body (Beginner)
INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
VALUES (
  '3-Daags Full Body Beginner',
  'Perfect voor beginners die 3x per week willen trainen. Complete full body workouts met focus op techniek.',
  'Gym',
  '/images/mind/3.png',
  'published',
  'Beginner',
  '45 min',
  'Beginners, 3x per week trainen'
);

-- Schema 4: 4-Daags Push/Pull/Legs/Full Body
INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
VALUES (
  '4-Daags Push/Pull/Legs/Full Body',
  'Gevarieerd 4-daags schema met Push/Pull/Legs en een full body dag. Perfect voor balans en variatie.',
  'Gym',
  '/images/mind/4.png',
  'published',
  'Intermediate',
  '60 min',
  'Intermediate lifters, 4x per week'
);

-- Schema 5: 5-Daags Upper/Lower/Upper/Lower/Full Body
INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
VALUES (
  '5-Daags Upper/Lower Split',
  'Geavanceerde 5-daags split met Upper/Lower verdeling en een full body dag. Voor serieuze lifters.',
  'Gym',
  '/images/mind/5.png',
  'published',
  'Advanced',
  '75 min',
  'Gevorderde lifters, 5x per week'
);

-- Schema 6: 6-Daags Upper/Lower/Upper/Lower/Upper/Lower
INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
VALUES (
  '6-Daags Upper/Lower Split',
  'Intensieve 6-daags split voor ervaren lifters. Dubbele Upper/Lower cyclus per week voor maximale frequentie.',
  'Gym',
  '/images/mind/1.png',
  'published',
  'Advanced',
  '60 min',
  'Ervaren lifters, 6x per week'
);

-- Schema 7: 2-Daags Bodyweight (Beginner)
INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
VALUES (
  '2-Daags Bodyweight Beginner',
  'Perfect voor beginners die thuis willen trainen. Complete bodyweight workouts voor kracht en conditie.',
  'Bodyweight',
  '/images/mind/2.png',
  'published',
  'Beginner',
  '30 min',
  'Beginners, 2x per week trainen, thuis'
);

-- Schema 8: 3-Daags Bodyweight (Intermediate)
INSERT INTO training_schemas (name, description, category, cover_image, status, difficulty, estimated_duration, target_audience)
VALUES (
  '3-Daags Bodyweight Intermediate',
  'Gevorderde bodyweight training voor thuis. Intensieve workouts voor kracht en conditie.',
  'Bodyweight',
  '/images/mind/3.png',
  'published',
  'Intermediate',
  '45 min',
  'Intermediate lifters, 3x per week trainen, thuis'
);

-- Verify the insertions
SELECT 
  name, 
  category, 
  difficulty, 
  target_audience,
  status
FROM training_schemas 
WHERE status = 'published' 
ORDER BY name; 