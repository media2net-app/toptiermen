-- Create Introduction Forum Topic for New Members
-- This script creates a dedicated forum topic for new members to introduce themselves

-- First, ensure we have the forum_categories table with an introductions category
INSERT INTO forum_categories (name, description, emoji, slug, order_index)
VALUES (
  'Leden Introducties',
  'Stel je voor aan de community en maak kennis met andere leden',
  '👋',
  'leden-introducties',
  1
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  order_index = EXCLUDED.order_index;

-- Create the main introduction topic
INSERT INTO forum_topics (
  title,
  content,
  category_id,
  author_id,
  is_pinned,
  is_locked,
  created_at
)
SELECT 
  '👋 Welkom! Stel je voor aan de Community',
  'Welkom bij Top Tier Men! 

Dit is de plek waar nieuwe leden zich kunnen voorstellen aan de community. 

**Waarom een introductie?**
- Maak kennis met andere leden
- Deel je doelen en motivatie
- Bouw connecties op
- Word onderdeel van de community

**Wat kun je delen:**
- Je naam en waar je vandaan komt
- Je hoofddoel en motivatie
- Wat je hoopt te bereiken
- Je interesses en passies
- Een korte video introductie (optioneel maar aanbevolen)

**Video introductie tips:**
- Houd het kort (30-60 seconden)
- Wees authentiek en natuurlijk
- Deel je passie en motivatie
- Nodig anderen uit om te reageren

**Voorbeeld introductie:**
"Hallo allemaal! Ik ben [Naam] uit [Plaats]. Mijn hoofddoel is [doel] en ik ben hier omdat [motivatie]. Ik ben vooral geïnteresseerd in [interesses] en hoop hier [wat je wilt bereiken] te bereiken. Ik kijk ernaar uit om jullie allemaal te leren kennen!"

Laten we een sterke, ondersteunende community bouwen! 💪

*Dit topic blijft open voor nieuwe introducties van alle leden.*',
  fc.id,
  NULL, -- No specific author, this is a system topic
  true, -- Pin this topic
  false, -- Don''t lock it
  NOW()
FROM forum_categories fc
WHERE fc.slug = 'leden-introducties'
ON CONFLICT DO NOTHING;

-- Create a user task tracking table for introduction completion
CREATE TABLE IF NOT EXISTS user_introduction_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL DEFAULT 'forum_introduction',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  forum_post_id INTEGER REFERENCES forum_posts(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_type)
);

-- Enable RLS on the new table
ALTER TABLE user_introduction_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_introduction_tasks
CREATE POLICY "Users can view their own introduction tasks" ON user_introduction_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own introduction tasks" ON user_introduction_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own introduction tasks" ON user_introduction_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_introduction_tasks_user_id ON user_introduction_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_introduction_tasks_status ON user_introduction_tasks(status);

-- Insert default task for existing users who haven''t completed onboarding
INSERT INTO user_introduction_tasks (user_id, task_type, status)
SELECT 
  p.id,
  'forum_introduction',
  'pending'
FROM profiles p
LEFT JOIN user_introduction_tasks uit ON p.id = uit.user_id AND uit.task_type = 'forum_introduction'
WHERE uit.id IS NULL
  AND p.created_at > NOW() - INTERVAL '30 days' -- Only for recent users
ON CONFLICT (user_id, task_type) DO NOTHING;

-- Create a function to automatically create introduction task for new users
CREATE OR REPLACE FUNCTION create_introduction_task_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_introduction_tasks (user_id, task_type, status)
  VALUES (NEW.id, 'forum_introduction', 'pending')
  ON CONFLICT (user_id, task_type) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create introduction task for new users
DROP TRIGGER IF EXISTS trigger_create_introduction_task ON auth.users;
CREATE TRIGGER trigger_create_introduction_task
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_introduction_task_for_new_user();

-- Verify the setup
SELECT 
  'Forum topic created successfully' as status,
  ft.title,
  fc.name as category_name,
  ft.is_pinned,
  ft.is_locked
FROM forum_topics ft
JOIN forum_categories fc ON ft.category_id = fc.id
WHERE fc.slug = 'leden-introducties'
ORDER BY ft.created_at DESC
LIMIT 1;

-- Show introduction tasks count
SELECT 
  'Introduction tasks created' as status,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks
FROM user_introduction_tasks
WHERE task_type = 'forum_introduction';
