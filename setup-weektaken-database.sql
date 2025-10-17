-- Setup Weektaken Database
-- Run this in your Supabase SQL editor

-- First, ensure the todo_tasks table has the required columns for weektaken
-- Add columns if they don't exist
DO $$ 
BEGIN
    -- Add completed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'todo_tasks' AND column_name = 'completed') THEN
        ALTER TABLE todo_tasks ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add day column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'todo_tasks' AND column_name = 'day') THEN
        ALTER TABLE todo_tasks ADD COLUMN day TEXT;
    END IF;
    
    -- Add day_order column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'todo_tasks' AND column_name = 'day_order') THEN
        ALTER TABLE todo_tasks ADD COLUMN day_order INTEGER;
    END IF;
    
    -- Add task_order column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'todo_tasks' AND column_name = 'task_order') THEN
        ALTER TABLE todo_tasks ADD COLUMN task_order INTEGER;
    END IF;
END $$;

-- Clear existing weektaken tasks
DELETE FROM todo_tasks WHERE category = 'weektaken';

-- Insert weektaken tasks
INSERT INTO todo_tasks (
    id, title, description, category, priority, estimated_hours, 
    status, assigned_to, due_date, start_date, completed, day, day_order, task_order,
    created_at, updated_at
) VALUES 
-- Woensdag
('11111111-1111-1111-1111-111111111111', 'Test users toevoegen', 'Test users toevoegen voor development', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 1, NOW(), NOW()),
('11111111-1111-1111-1111-111111111112', 'Hotmail probleem oplossen', 'Hotmail probleem oplossen', 'weektaken', 'high', 1, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 2, NOW(), NOW()),
('11111111-1111-1111-1111-111111111113', '2 leden die nog niet onboard zijn persoonlijk mailen', '2 leden die nog niet onboard zijn persoonlijk mailen', 'weektaken', 'high', 1, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 3, NOW(), NOW()),
('11111111-1111-1111-1111-111111111114', 'Plan van aanpak maken 30 leads', 'Plan van aanpak maken 30 leads', 'weektaken', 'medium', 3, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 4, NOW(), NOW()),
('11111111-1111-1111-1111-111111111115', 'Rick helpen met mail / contact Cross Internet', 'Rick helpen met mail / contact Cross Internet', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 5, NOW(), NOW()),
('11111111-1111-1111-1111-111111111116', 'Admin dashboard inrichten om huidige status leden te checken', 'Admin dashboard inrichten om huidige status leden te checken', 'weektaken', 'high', 4, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 6, NOW(), NOW()),
('11111111-1111-1111-1111-111111111117', 'Leden pagina opschonen, enkel echte gebruikers tonen + test gebruikers', 'Leden pagina opschonen, enkel echte gebruikers tonen + test gebruikers, nu toont hij nog rickkggg@hotmail.com en joost@joost.nl', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 7, NOW(), NOW()),
('11111111-1111-1111-1111-111111111118', 'Forum nalopen', 'Forum nalopen', 'weektaken', 'medium', 1, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 8, NOW(), NOW()),
('11111111-1111-1111-1111-111111111119', 'Social wall vullen Rick en Chiel, dagelijks posten om leden aan te moedigen', 'Social wall vullen Rick en Chiel, dagelijks posten om leden aan te moedigen om ook te posten', 'weektaken', 'medium', 1, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 9, NOW(), NOW()),
('11111111-1111-1111-1111-11111111111a', 'Boks op reacties mogelijk maken', 'Boks op reacties mogelijk maken', 'weektaken', 'low', 3, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 10, NOW(), NOW()),
('11111111-1111-1111-1111-11111111111b', 'Reactie op reactie mogelijk maken', 'Reactie op reactie mogelijk maken', 'weektaken', 'low', 2, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 11, NOW(), NOW()),
('11111111-1111-1111-1111-11111111111c', 'Voedingsschema en trainingsschema admin dashboard inzichtelijk', 'Voedingsschema en trainingsschema admin dashboard inzichtelijk maken', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 12, NOW(), NOW()),
('11111111-1111-1111-1111-11111111111d', 'Clone gereed maken zodat we kunnen door ontwikkelen', 'Clone gereed maken zodat we kunnen door ontwikkelen', 'weektaken', 'high', 4, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 13, NOW(), NOW()),
('11111111-1111-1111-1111-11111111111e', 'Affiliate testen', 'Affiliate testen', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 14, NOW(), NOW()),
('11111111-1111-1111-1111-11111111111f', 'Trainingsschemas controleren schema 3 is niet zichtbaar', 'Trainingsschemas controleren - schema 3 is niet zichtbaar', 'weektaken', 'medium', 1, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 15, NOW(), NOW()),
('11111111-1111-1111-1111-111111111120', 'Print layout zowel trainingsschema als voedingsplan', 'Print layout voor trainingsschema en voedingsplan', 'weektaken', 'low', 3, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 16, NOW(), NOW()),
('11111111-1111-1111-1111-111111111121', '1:1 platform functies inzichtelijk maken', '1:1 platform functies inzichtelijk maken', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 17, NOW(), NOW()),
('11111111-1111-1111-1111-111111111122', '1:1 platform offerte', '1:1 platform offerte', 'weektaken', 'medium', 1, 'pending', 'Chiel', '2025-01-22', '2025-01-22', false, 'woensdag', 1, 18, NOW(), NOW()),

-- Donderdag
('22222222-2222-2222-2222-222222222221', 'Plan van aanpak marketing', 'Plan van aanpak marketing', 'weektaken', 'high', 4, 'pending', 'Chiel', '2025-01-23', '2025-01-23', false, 'donderdag', 2, 1, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Pop-up plaatsen over de eerste virtuele bijeenkomst', 'Pop-up plaatsen over de eerste virtuele bijeenkomst', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-23', '2025-01-23', false, 'donderdag', 2, 2, NOW(), NOW()),
('22222222-2222-2222-2222-222222222223', 'Virtuele bijeenkomst opzetten via systeem of Teams/Zooms', 'Virtuele bijeenkomst opzetten zodat we via het systeem of via Teams/Zooms kunnen joinen', 'weektaken', 'high', 3, 'pending', 'Chiel', '2025-01-23', '2025-01-23', false, 'donderdag', 2, 3, NOW(), NOW()),
('22222222-2222-2222-2222-222222222224', 'Bol.com fixen', 'Bol.com fixen', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-23', '2025-01-23', false, 'donderdag', 2, 4, NOW(), NOW()),
('22222222-2222-2222-2222-222222222225', 'Boeken fixen', 'Boeken fixen', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-23', '2025-01-23', false, 'donderdag', 2, 5, NOW(), NOW()),
('22222222-2222-2222-2222-222222222226', 'Producten fixen', 'Producten fixen', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-23', '2025-01-23', false, 'donderdag', 2, 6, NOW(), NOW()),
('22222222-2222-2222-2222-222222222227', 'Financieel stuk fixen - auto incasso en communicatie naar leden', 'Financieel stuk fixen, we zijn meer dan maand verder vanaf lancering 10 september, leden hebben nog geen auto incasso gehad, wanneer gaan we die incasseren (deze maand niks gezien platform maand later pas bruikbaar was?) Dit ook melden naar leden later deze maand of in de virtuele meeting', 'weektaken', 'high', 3, 'pending', 'Chiel', '2025-01-23', '2025-01-23', false, 'donderdag', 2, 7, NOW(), NOW()),

-- Vrijdag
('33333333-3333-3333-3333-333333333331', 'Virtuele meeting testen met Rick', 'Virtuele meeting testen met Rick', 'weektaken', 'high', 1, 'pending', 'Chiel', '2025-01-24', '2025-01-24', false, 'vrijdag', 3, 1, NOW(), NOW()),
('33333333-3333-3333-3333-333333333332', 'Algehele platform check van A tot Z, performance, mobile', 'Algehele platform check van A tot Z, performance en mobile', 'weektaken', 'high', 4, 'pending', 'Chiel', '2025-01-24', '2025-01-24', false, 'vrijdag', 3, 2, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Week afsluiting, wat ging goed, wat ging niet goed', 'Week afsluiting, wat ging goed, wat ging niet goed', 'weektaken', 'medium', 1, 'pending', 'Chiel', '2025-01-24', '2025-01-24', false, 'vrijdag', 3, 3, NOW(), NOW()),

-- Volgende week
('44444444-4444-4444-4444-444444444441', 'Gram afronding op hele of op 5', 'Gram afronding op hele of op 5', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 1, NOW(), NOW()),
('44444444-4444-4444-4444-444444444442', 'Logische porties 100kg en dan 570 skyr is te veel', 'Logische porties - 100kg en dan 570 skyr is te veel', 'weektaken', 'medium', 2, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 2, NOW(), NOW()),
('44444444-4444-4444-4444-444444444443', 'Maximale gram per product invoeren', 'Maximale gram per product invoeren', 'weektaken', 'medium', 3, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 3, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Shopping list', 'Shopping list', 'weektaken', 'medium', 4, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 4, NOW(), NOW()),
('44444444-4444-4444-4444-444444444445', 'Variaties voedingsplannen', 'Variaties voedingsplannen', 'weektaken', 'medium', 3, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 5, NOW(), NOW()),
('44444444-4444-4444-4444-444444444446', 'Customize plan - gebruiker kan ingrediënten wijzigen', 'Customize plan, gebruiker kan zelf ingrediënten verwijderen en wijzigen', 'weektaken', 'high', 6, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 6, NOW(), NOW()),
('44444444-4444-4444-4444-444444444447', 'Notificaties', 'Notificaties', 'weektaken', 'medium', 3, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 7, NOW(), NOW()),
('44444444-4444-4444-4444-444444444448', 'Rangen en badges', 'Rangen en badges', 'weektaken', 'medium', 4, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 8, NOW(), NOW()),
('44444444-4444-4444-4444-444444444449', 'Rick uitleggen leden toevoegen', 'Rick uitleggen leden toevoegen', 'weektaken', 'medium', 1, 'pending', 'Chiel', '2025-01-27', '2025-01-27', false, 'volgendeWeek', 4, 9, NOW(), NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todo_tasks_category ON todo_tasks(category);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_day ON todo_tasks(day);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_day_order ON todo_tasks(day_order);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_task_order ON todo_tasks(task_order);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_completed ON todo_tasks(completed);

-- Verify the data
SELECT 
    day,
    day_order,
    COUNT(*) as task_count,
    COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
FROM todo_tasks 
WHERE category = 'weektaken' 
GROUP BY day, day_order
ORDER BY day_order;
