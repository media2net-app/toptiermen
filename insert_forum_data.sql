-- Insert forum dummy data
-- This script populates the forum with realistic data

-- Insert forum categories
INSERT INTO forum_categories (name, description, emoji, slug, order_index) VALUES
('Fitness & Gezondheid', 'Alles over trainingsschema''s, voeding, herstel en blessurepreventie.', '💪', 'fitness-gezondheid', 1),
('Finance & Business', 'Discussies over investeren, ondernemen, budgetteren en financiële onafhankelijkheid.', '💰', 'finance-business', 2),
('Mind & Focus', 'Mindset, productiviteit, focus en mentale kracht.', '🧠', 'mind-focus', 3),
('Boekenkamer Discussies', 'Boekentips, samenvattingen en leeservaringen.', '📚', 'boekenkamer', 4),
('Successen & Mislukkingen', 'Deel je overwinningen en leer van tegenslagen.', '🏆', 'successen-mislukkingen', 5)
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs
DO $$
DECLARE
    fitness_id INTEGER;
    finance_id INTEGER;
    mind_id INTEGER;
    boeken_id INTEGER;
    success_id INTEGER;
BEGIN
    SELECT id INTO fitness_id FROM forum_categories WHERE slug = 'fitness-gezondheid';
    SELECT id INTO finance_id FROM forum_categories WHERE slug = 'finance-business';
    SELECT id INTO mind_id FROM forum_categories WHERE slug = 'mind-focus';
    SELECT id INTO boeken_id FROM forum_categories WHERE slug = 'boekenkamer';
    SELECT id INTO success_id FROM forum_categories WHERE slug = 'successen-mislukkingen';

    -- Insert pinned topics for Fitness & Gezondheid
    INSERT INTO forum_topics (category_id, title, content, author_id, is_pinned, reply_count, like_count) VALUES
    (fitness_id, '📌 Categorie Regels', 'Welkom in de Fitness & Gezondheid sectie! Hier zijn de regels:\n\n1. Wees respectvol naar elkaar\n2. Deel alleen betrouwbare informatie\n3. Geen spam of reclame\n4. Help elkaar vooruit\n\nVeel succes met je fitness journey! 💪', 
     (SELECT id FROM auth.users WHERE email = 'rick@toptiermen.com' LIMIT 1), TRUE, 12, 34),
    (fitness_id, '📌 Lees dit eerst: Trainingsgids voor Beginners', 'Nieuwe in de fitness wereld? Start hier!\n\nDeze gids helpt je:\n- De juiste oefeningen kiezen\n- Veilig trainen\n- Voeding basics\n- Herstel en rust\n\nLees dit eerst voordat je vragen stelt!', 
     (SELECT id FROM auth.users WHERE email = 'jeroen@toptiermen.com' LIMIT 1), TRUE, 8, 21);

    -- Insert regular topics for Fitness & Gezondheid
    INSERT INTO forum_topics (category_id, title, content, author_id, reply_count, like_count) VALUES
    (fitness_id, 'Beste eiwitshake?', 'Ik ben op zoek naar een goede eiwitshake. Wat raden jullie aan? Ik train 4x per week en wil spieren opbouwen.', 
     (SELECT id FROM auth.users WHERE email = 'mark@toptiermen.com' LIMIT 1), 23, 15),
    (fitness_id, 'Hoe herstel je sneller na een zware training?', 'Ik heb gisteren een zware legsessie gedaan en voel me vandaag echt gesloopt. Wat zijn jullie beste tips voor sneller herstel? Denk aan voeding, supplementen, slaap, etc.', 
     (SELECT id FROM auth.users WHERE email = 'rick@toptiermen.com' LIMIT 1), 18, 12),
    (fitness_id, 'Cardio vs krachttraining - wat is belangrijker?', 'Ik heb maar 3 uur per week om te trainen. Moet ik me focussen op cardio of krachttraining? Of een combinatie?', 
     (SELECT id FROM auth.users WHERE email = 'sven@toptiermen.com' LIMIT 1), 14, 8),
    (fitness_id, 'Blessurepreventie tips', 'Ik heb al 2x een blessure gehad. Wat zijn jullie beste tips om blessures te voorkomen?', 
     (SELECT id FROM auth.users WHERE email = 'teun@toptiermen.com' LIMIT 1), 9, 6);

    -- Insert topics for Finance & Business
    INSERT INTO forum_topics (category_id, title, content, author_id, reply_count, like_count) VALUES
    (finance_id, 'Risico''s van crypto?', 'Ik overweeg om in crypto te investeren. Wat zijn de risico''s en hoe begin je veilig?', 
     (SELECT id FROM auth.users WHERE email = 'jeroen@toptiermen.com' LIMIT 1), 19, 11),
    (finance_id, 'Eerste stappen in beleggen', 'Ik wil beginnen met beleggen maar weet niet waar te starten. Tips voor beginners?', 
     (SELECT id FROM auth.users WHERE email = 'mark@toptiermen.com' LIMIT 1), 16, 9),
    (finance_id, 'Passief inkomen opbouwen', 'Hoe bouw je passief inkomen op? Welke strategieën werken het beste?', 
     (SELECT id FROM auth.users WHERE email = 'rick@toptiermen.com' LIMIT 1), 12, 7);

    -- Insert topics for Mind & Focus
    INSERT INTO forum_topics (category_id, title, content, author_id, reply_count, like_count) VALUES
    (mind_id, 'Morning routine tips', 'Wat is jullie ochtendroutine? Ik wil productiever worden en vroeg opstaan.', 
     (SELECT id FROM auth.users WHERE email = 'rick@toptiermen.com' LIMIT 1), 15, 13),
    (mind_id, 'Focus verbeteren', 'Ik kan me moeilijk concentreren. Wat zijn jullie beste tips voor betere focus?', 
     (SELECT id FROM auth.users WHERE email = 'sven@toptiermen.com' LIMIT 1), 11, 8),
    (mind_id, 'Stress management', 'Hoe gaan jullie om met stress? Ik voel me vaak overweldigd.', 
     (SELECT id FROM auth.users WHERE email = 'teun@toptiermen.com' LIMIT 1), 8, 5);

    -- Insert topics for Boekenkamer
    INSERT INTO forum_topics (category_id, title, content, author_id, reply_count, like_count) VALUES
    (boeken_id, 'Top 3 mindset boeken', 'Wat zijn jullie top 3 boeken voor mindset en persoonlijke ontwikkeling?', 
     (SELECT id FROM auth.users WHERE email = 'sven@toptiermen.com' LIMIT 1), 13, 10),
    (boeken_id, 'Boekentips voor ondernemers', 'Ik ben net begonnen als ondernemer. Welke boeken moet ik lezen?', 
     (SELECT id FROM auth.users WHERE email = 'jeroen@toptiermen.com' LIMIT 1), 9, 6);

    -- Insert topics for Successen & Mislukkingen
    INSERT INTO forum_topics (category_id, title, content, author_id, reply_count, like_count) VALUES
    (success_id, 'Mijn grootste les', 'Ik heb een grote fout gemaakt in mijn bedrijf. Hier is wat ik heb geleerd...', 
     (SELECT id FROM auth.users WHERE email = 'teun@toptiermen.com' LIMIT 1), 7, 4),
    (success_id, 'Eerste 10k verdient!', 'Na 2 jaar hard werken heb ik mijn eerste 10k verdient. Hier is mijn verhaal...', 
     (SELECT id FROM auth.users WHERE email = 'mark@toptiermen.com' LIMIT 1), 5, 12);

END $$;

-- Insert posts (replies) for topics
DO $$
DECLARE
    topic_id INTEGER;
    user_rick UUID;
    user_sven UUID;
    user_jeroen UUID;
    user_teun UUID;
    user_mark UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO user_rick FROM auth.users WHERE email = 'rick@toptiermen.com' LIMIT 1;
    SELECT id INTO user_sven FROM auth.users WHERE email = 'sven@toptiermen.com' LIMIT 1;
    SELECT id INTO user_jeroen FROM auth.users WHERE email = 'jeroen@toptiermen.com' LIMIT 1;
    SELECT id INTO user_teun FROM auth.users WHERE email = 'teun@toptiermen.com' LIMIT 1;
    SELECT id INTO user_mark FROM auth.users WHERE email = 'mark@toptiermen.com' LIMIT 1;

    -- Get topic ID for "Beste eiwitshake?"
    SELECT id INTO topic_id FROM forum_topics WHERE title = 'Beste eiwitshake?' LIMIT 1;

    -- Insert replies for "Beste eiwitshake?"
    INSERT INTO forum_posts (topic_id, content, author_id) VALUES
    (topic_id, 'Ik gebruik al 2 jaar Whey Isolate van XXL Nutrition. Werkt perfect voor mij!', user_sven),
    (topic_id, 'Caseïne voor het slapen is ook belangrijk. Helpt met herstel tijdens de nacht.', user_jeroen),
    (topic_id, 'Let op de ingrediënten! Veel shakes zitten vol met suiker.', user_teun),
    (topic_id, 'Ik maak mijn eigen shake met banaan, eiwitpoeder en amandelmelk.', user_rick);

    -- Get topic ID for "Hoe herstel je sneller na een zware training?"
    SELECT id INTO topic_id FROM forum_topics WHERE title = 'Hoe herstel je sneller na een zware training?' LIMIT 1;

    -- Insert replies for recovery topic
    INSERT INTO forum_posts (topic_id, content, author_id) VALUES
    (topic_id, 'Veel water drinken en een goede nachtrust maken bij mij het grootste verschil! Foamrollen helpt ook.', user_sven),
    (topic_id, 'Magnesium nemen voor het slapen en een lichte wandeling doen. En natuurlijk: eiwitten!', user_jeroen),
    (topic_id, 'Contrast-douches (warm/koud) werken bij mij top. En luister naar je lichaam, soms is rust de beste optie.', user_teun),
    (topic_id, 'Ik gebruik altijd een recovery shake met BCAA''s. Werkt echt!', user_mark);

    -- Get topic ID for "Risico''s van crypto?"
    SELECT id INTO topic_id FROM forum_topics WHERE title = 'Risico''s van crypto?' LIMIT 1;

    -- Insert replies for crypto topic
    INSERT INTO forum_posts (topic_id, content, author_id) VALUES
    (topic_id, 'Begin met kleine bedragen en investeer alleen wat je kunt missen.', user_rick),
    (topic_id, 'Diversificeer! Niet alles in één coin stoppen.', user_sven),
    (topic_id, 'Ik heb veel geld verloren door FOMO. Leer van mijn fout!', user_teun);

    -- Get topic ID for "Morning routine tips"
    SELECT id INTO topic_id FROM forum_topics WHERE title = 'Morning routine tips' LIMIT 1;

    -- Insert replies for morning routine topic
    INSERT INTO forum_posts (topic_id, content, author_id) VALUES
    (topic_id, 'Ik sta om 5:30 op, drink water, mediteer 10 min en ga dan trainen.', user_rick),
    (topic_id, 'Koude douche in de ochtend geeft me energie voor de hele dag!', user_sven),
    (topic_id, 'Geen telefoon de eerste 30 min na het opstaan. Game changer!', user_jeroen);

END $$;

-- Insert some likes
DO $$
DECLARE
    user_rick UUID;
    user_sven UUID;
    user_jeroen UUID;
    user_teun UUID;
    user_mark UUID;
    topic_id INTEGER;
    post_id INTEGER;
BEGIN
    -- Get user IDs
    SELECT id INTO user_rick FROM auth.users WHERE email = 'rick@toptiermen.com' LIMIT 1;
    SELECT id INTO user_sven FROM auth.users WHERE email = 'sven@toptiermen.com' LIMIT 1;
    SELECT id INTO user_jeroen FROM auth.users WHERE email = 'jeroen@toptiermen.com' LIMIT 1;
    SELECT id INTO user_teun FROM auth.users WHERE email = 'teun@toptiermen.com' LIMIT 1;
    SELECT id INTO user_mark FROM auth.users WHERE email = 'mark@toptiermen.com' LIMIT 1;

    -- Add likes to topics
    INSERT INTO forum_likes (user_id, topic_id) VALUES
    (user_rick, (SELECT id FROM forum_topics WHERE title = 'Beste eiwitshake?' LIMIT 1)),
    (user_sven, (SELECT id FROM forum_topics WHERE title = 'Beste eiwitshake?' LIMIT 1)),
    (user_jeroen, (SELECT id FROM forum_topics WHERE title = 'Beste eiwitshake?' LIMIT 1)),
    (user_rick, (SELECT id FROM forum_topics WHERE title = 'Hoe herstel je sneller na een zware training?' LIMIT 1)),
    (user_sven, (SELECT id FROM forum_topics WHERE title = 'Hoe herstel je sneller na een zware training?' LIMIT 1));

    -- Add likes to posts
    INSERT INTO forum_likes (user_id, post_id) VALUES
    (user_rick, (SELECT id FROM forum_posts WHERE content LIKE '%Whey Isolate%' LIMIT 1)),
    (user_sven, (SELECT id FROM forum_posts WHERE content LIKE '%Whey Isolate%' LIMIT 1)),
    (user_jeroen, (SELECT id FROM forum_posts WHERE content LIKE '%Veel water drinken%' LIMIT 1)),
    (user_teun, (SELECT id FROM forum_posts WHERE content LIKE '%Veel water drinken%' LIMIT 1));

END $$; 