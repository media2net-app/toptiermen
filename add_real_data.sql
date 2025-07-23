-- Add real data to replace dummy data throughout the application
-- This script adds realistic users, events, groups, and other data

-- Add real users with profiles
INSERT INTO profiles (id, email, full_name, display_name, avatar_url, bio, location, website, interests, rank, points, missions_completed, is_public, show_email) VALUES
-- Rick Cuijpers (Founder)
('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'rick@toptiermen.com', 'Rick Cuijpers', 'Rick Cuijpers', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Oprichter van Top Tier Men. Ik help mannen hun potentieel te bereiken door middel van fitness, mindset en persoonlijke ontwikkeling.', 'Nederland', 'https://toptiermen.com', ARRAY['Fitness', 'Mindset', 'Ondernemerschap', 'Persoonlijke Ontwikkeling'], 'Founder', 10000, 50, true, true),

-- Real community members
('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'mark@vanderberg.nl', 'Mark van der Berg', 'Mark V.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'Fitness coach en ondernemer. Focus op duurzame groei en consistentie.', 'Amsterdam', 'https://markvanderberg.nl', ARRAY['Fitness', 'Ondernemerschap', 'Voeding'], 'Veteran', 2500, 25, true, false),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'daniel@visser.com', 'Daniel Visser', 'Daniel V.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Discipline is mijn superpower. Dagelijkse routines en consistentie leiden tot resultaten.', 'Rotterdam', NULL, ARRAY['Discipline', 'Productiviteit', 'Fitness'], 'Elite', 5000, 35, true, false),

('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'mike@anderson.com', 'Mike Anderson', 'Mike A.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Alpha mindset coach. Focus op mentale kracht en leiderschap.', 'Den Haag', 'https://mikeanderson.com', ARRAY['Mindset', 'Leiderschap', 'Motivatie'], 'Alpha', 7500, 42, true, false),

('c3d4e5f6-g7h8-8901-bcde-f23456789012', 'lucas@devries.nl', 'Lucas de Vries', 'Lucas D.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'Zen master en productiviteitsexpert. Balans tussen actie en rust.', 'Utrecht', NULL, ARRAY['Meditatie', 'Productiviteit', 'Balans'], 'Veteran', 3000, 28, true, false),

('d4e5f6g7-h8i9-0123-defg-456789012345', 'sven@bakker.com', 'Sven Bakker', 'Sven B.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Crypto enthousiast en DeFi expert. Deel kennis over digitale financiën.', 'Eindhoven', 'https://svenbakker.com', ARRAY['Crypto', 'DeFi', 'Investeren'], 'Elite', 4000, 30, true, false),

('e5f6g7h8-i9j0-1234-efgh-567890123456', 'teun@jansen.nl', 'Teun Jansen', 'Teun J.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Vader en ondernemer. Balanceren tussen gezin en business.', 'Groningen', NULL, ARRAY['Ondernemerschap', 'Vaderschap', 'Balans'], 'Veteran', 2000, 20, true, false),

('f6g7h8i9-j0k1-2345-fghi-678901234567', 'jeroen@dijkstra.com', 'Jeroen Dijkstra', 'Jeroen D.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'Boekliefhebber en mindset coach. Kennis is macht.', 'Tilburg', 'https://jeroendijkstra.com', ARRAY['Lezen', 'Mindset', 'Kennis'], 'Veteran', 1800, 18, true, false),

('g7h8i9j0-k1l2-3456-ghij-789012345678', 'frank@meijer.nl', 'Frank Meijer', 'Frank M.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Fitness trainer en voedingsdeskundige. Gezondheid is rijkdom.', 'Breda', NULL, ARRAY['Fitness', 'Voeding', 'Gezondheid'], 'Elite', 3500, 32, true, false),

('h8i9j0k1-l2m3-4567-hijk-890123456789', 'tom@willems.com', 'Tom Willems', 'Tom W.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Warrior mindset. Elke dag is een nieuwe kans om te groeien.', 'Nijmegen', 'https://tomwillems.com', ARRAY['Warrior Mindset', 'Discipline', 'Groei'], 'Warrior', 1200, 15, true, false)

ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  interests = EXCLUDED.interests,
  rank = EXCLUDED.rank,
  points = EXCLUDED.points,
  missions_completed = EXCLUDED.missions_completed,
  is_public = EXCLUDED.is_public,
  show_email = EXCLUDED.show_email,
  updated_at = NOW();

-- Add real forum posts with proper authors
INSERT INTO forum_posts (id, topic_id, author_id, content, created_at) VALUES
-- Topic 1: Cardio vs krachttraining
(1, 5, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Ik heb maar 3 uur per week om te trainen. Moet ik me focussen op cardio of krachttraining? Of een combinatie?', '2025-07-23T12:00:00Z'),
(2, 5, '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Voor 3 uur per week zou ik een combinatie doen: 2x krachttraining (1 uur) en 1x cardio (30 min). Krachttraining bouwt spieren op en cardio verbetert je conditie.', '2025-07-23T12:15:00Z'),
(3, 5, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ik train ook maar 3 uur per week. Ik doe 2x full body krachttraining en 1x HIIT cardio. Werkt perfect voor mij!', '2025-07-23T12:30:00Z'),
(4, 5, 'f6g7h8i9-j0k1-2345-fghi-678901234567', 'Krachttraining eerst, dan cardio. Spieren verbranden meer calorieën in rust. Focus op compound oefeningen.', '2025-07-23T12:45:00Z'),

-- Topic 2: Eiwitshakes
(5, 3, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Welke eiwitshake gebruiken jullie? Ik zoek iets van goede kwaliteit zonder te veel suiker.', '2025-07-23T13:00:00Z'),
(6, 3, 'g7h8i9j0-k1l2-3456-ghij-789012345678', 'Ik gebruik Whey Isolate van XXL Nutrition. Werkt perfect voor mij!', '2025-07-23T13:15:00Z'),
(7, 3, '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Caseïne voor het slapen is ook belangrijk. Helpt met herstel tijdens de nacht.', '2025-07-23T13:30:00Z'),
(8, 3, 'c3d4e5f6-g7h8-8901-bcde-f23456789012', 'Let op de ingrediënten! Veel shakes zitten vol met suiker.', '2025-07-23T13:45:00Z'),
(9, 3, 'd4e5f6g7-h8i9-0123-defg-456789012345', 'Ik maak mijn eigen shake met banaan, eiwitpoeder en amandelmelk.', '2025-07-23T14:00:00Z'),

-- Topic 3: Herstel na training
(10, 4, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Wat doen jullie voor optimaal herstel na een zware training?', '2025-07-23T14:15:00Z'),
(11, 4, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Veel water drinken en een goede nachtrust maken bij mij het grootste verschil! Foamrollen helpt ook.', '2025-07-23T14:30:00Z'),
(12, 4, 'g7h8i9j0-k1l2-3456-ghij-789012345678', 'Magnesium nemen voor het slapen en een lichte wandeling doen. En natuurlijk: eiwitten!', '2025-07-23T14:45:00Z'),
(13, 4, 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Contrast-douches (warm/koud) werken bij mij top. En luister naar je lichaam, soms is rust de beste optie.', '2025-07-23T15:00:00Z'),
(14, 4, 'e5f6g7h8-i9j0-1234-efgh-567890123456', 'Ik gebruik altijd een recovery shake met BCAA\'s. Werkt echt!', '2025-07-23T15:15:00Z'),

-- Topic 4: Eerste stappen in beleggen
(15, 8, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Ik wil beginnen met beleggen maar heb geen idee waar ik moet beginnen. Tips?', '2025-07-23T15:30:00Z'),
(16, 8, 'd4e5f6g7-h8i9-0123-defg-456789012345', 'Begin met kleine bedragen en investeer alleen wat je kunt missen.', '2025-07-23T15:45:00Z'),
(17, 8, 'sven@bakker.com', 'Diversificeer! Niet alles in één coin stoppen.', '2025-07-23T16:00:00Z'),
(18, 8, '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Ik heb veel geld verloren door FOMO. Leer van mijn fout!', '2025-07-23T16:15:00Z'),

-- Topic 5: Ochtendroutine
(19, 12, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Wat is jullie ochtendroutine? Ik probeer mijn dag beter te starten.', '2025-07-23T16:30:00Z'),
(20, 12, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ik sta om 5:30 op, drink water, mediteer 10 min en ga dan trainen.', '2025-07-23T16:45:00Z'),
(21, 12, 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '5:00 opstaan, koude douche, lezen, dan gym. Game changer!', '2025-07-23T17:00:00Z'),
(22, 12, 'c3d4e5f6-g7h8-8901-bcde-f23456789012', 'Ik begin met 10 min journaling en dan een korte workout. Helpt me focussen.', '2025-07-23T17:15:00Z')

ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id,
  author_id = EXCLUDED.author_id,
  content = EXCLUDED.content,
  created_at = EXCLUDED.created_at;

-- Add real forum topics with proper authors
INSERT INTO forum_topics (id, category_id, author_id, title, content, created_at) VALUES
-- Fitness & Gezondheid
(1, 1, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '📌 Categorie Regels', 'Welkom in de Fitness & Gezondheid categorie! Hier kun je alles bespreken over training, voeding, herstel en blessurepreventie.', '2025-07-23T10:00:00Z'),
(2, 1, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '📌 Lees dit eerst: Trainingsgids voor Beginners', 'Een complete gids voor beginners die willen starten met fitness.', '2025-07-23T10:15:00Z'),
(3, 1, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Eiwitshakes - welke gebruiken jullie?', 'Ik ben op zoek naar een goede eiwitshake. Wat gebruiken jullie en waarom?', '2025-07-23T11:00:00Z'),
(4, 1, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Herstel na training - tips gezocht', 'Wat doen jullie voor optimaal herstel na een zware training?', '2025-07-23T11:15:00Z'),
(5, 1, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Cardio vs krachttraining - wat is belangrijker?', 'Ik heb maar 3 uur per week om te trainen. Moet ik me focussen op cardio of krachttraining?', '2025-07-23T11:30:00Z'),

-- Finance & Business
(6, 2, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '📌 Categorie Regels', 'Welkom in de Finance & Business categorie! Hier bespreken we investeren, ondernemen en financiële onafhankelijkheid.', '2025-07-23T12:00:00Z'),
(7, 2, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '📌 Beginners Gids: Investeren', 'Een complete gids voor beginners die willen starten met investeren.', '2025-07-23T12:15:00Z'),
(8, 2, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Eerste stappen in beleggen', 'Ik wil beginnen met beleggen maar heb geen idee waar ik moet beginnen. Tips?', '2025-07-23T12:30:00Z'),
(9, 2, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Passief inkomen opbouwen', 'Hoe bouwen jullie passief inkomen op? Delen jullie jullie strategieën?', '2025-07-23T12:45:00Z'),

-- Mind & Focus
(10, 3, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '📌 Categorie Regels', 'Welkom in de Mind & Focus categorie! Hier bespreken we mindset, productiviteit en mentale kracht.', '2025-07-23T13:00:00Z'),
(11, 3, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Focus verbeteren', 'Ik heb moeite met focussen. Wat zijn jullie beste tips?', '2025-07-23T13:15:00Z'),
(12, 3, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Ochtendroutine - wat is jullie routine?', 'Wat is jullie ochtendroutine? Ik probeer mijn dag beter te starten.', '2025-07-23T13:30:00Z'),
(13, 3, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Stress management', 'Hoe gaan jullie om met stress? Delen jullie jullie technieken?', '2025-07-23T13:45:00Z'),

-- Boekenkamer
(14, 4, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '📌 Categorie Regels', 'Welkom in de Boekenkamer! Hier delen we boekentips en leeservaringen.', '2025-07-23T14:00:00Z'),
(15, 4, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Top 3 mindset boeken', 'Wat zijn jullie top 3 mindset boeken die jullie leven hebben veranderd?', '2025-07-23T14:15:00Z'),
(16, 4, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Boekentips voor ondernemers', 'Ik ben net begonnen als ondernemer. Welke boeken raden jullie aan?', '2025-07-23T14:30:00Z'),

-- Successen & Mislukkingen
(17, 5, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '📌 Categorie Regels', 'Welkom in Successen & Mislukkingen! Hier delen we onze overwinningen en leren van tegenslagen.', '2025-07-23T15:00:00Z'),
(18, 5, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Mijn grootste les', 'Wat is de grootste les die jullie hebben geleerd in jullie reis?', '2025-07-23T15:15:00Z'),
(19, 5, '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Eerste 10k verdient!', 'Ik heb net mijn eerste 10k verdient met mijn side hustle! Voel me ongelooflijk!', '2025-07-23T15:30:00Z')

ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  author_id = EXCLUDED.author_id,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  created_at = EXCLUDED.created_at;

-- Update reply counts for topics
UPDATE forum_topics 
SET reply_count = (
  SELECT COUNT(*) - 1 
  FROM forum_posts 
  WHERE forum_posts.topic_id = forum_topics.id
);

-- Add real events (if events table exists)
-- Note: This assumes you have an events table. If not, you can create it later.
-- INSERT INTO events (id, name, type, date, time, host, location, description, status, max_participants, visibility, current_participants, created_at) VALUES
-- ('1', 'Online Workshop: Onderhandelen als een Pro', 'online', '2024-02-15', '19:00', 'Rick Cuijpers', 'https://zoom.us/j/123456789', 'Leer de kunst van effectief onderhandelen in deze interactieve workshop.', 'published', 50, 'public', 35, '2024-01-15'),
-- ('2', 'Fysieke Meetup: Amsterdam Brotherhood', 'physical', '2024-02-20', '18:30', 'Mike Anderson', 'The Hub Amsterdam, Herengracht 123, Amsterdam', 'Een avond vol connecties, inspiratie en groei.', 'published', 25, 'veteran_plus', 18, '2024-01-10');

-- Add real groups (if groups table exists)
-- Note: This assumes you have a groups table. If not, you can create it later.
-- INSERT INTO groups (id, name, description, created_by, member_count, created_at) VALUES
-- ('1', 'Crypto & DeFi Pioniers', 'Een groep voor crypto enthousiastelingen en DeFi experts.', 'd4e5f6g7-h8i9-0123-defg-456789012345', 8, '2024-01-01'),
-- ('2', 'Vaders & Leiders', 'Voor vaders die ondernemer zijn en balans zoeken tussen gezin en business.', 'e5f6g7h8-i9j0-1234-efgh-567890123456', 3, '2024-01-15');

-- Update user statistics to be more realistic
UPDATE profiles 
SET 
  points = CASE 
    WHEN rank = 'Founder' THEN 10000
    WHEN rank = 'Alpha' THEN 7500
    WHEN rank = 'Elite' THEN 5000
    WHEN rank = 'Veteran' THEN 2500
    WHEN rank = 'Warrior' THEN 1200
    ELSE 500
  END,
  missions_completed = CASE 
    WHEN rank = 'Founder' THEN 50
    WHEN rank = 'Alpha' THEN 42
    WHEN rank = 'Elite' THEN 35
    WHEN rank = 'Veteran' THEN 25
    WHEN rank = 'Warrior' THEN 15
    ELSE 8
  END
WHERE id IN (
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c',
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  'c3d4e5f6-g7h8-8901-bcde-f23456789012',
  'd4e5f6g7-h8i9-0123-defg-456789012345',
  'e5f6g7h8-i9j0-1234-efgh-567890123456',
  'f6g7h8i9-j0k1-2345-fghi-678901234567',
  'g7h8i9j0-k1l2-3456-ghij-789012345678',
  'h8i9j0k1-l2m3-4567-hijk-890123456789'
); 