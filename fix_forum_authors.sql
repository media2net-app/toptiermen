-- Fix forum authors by setting Rick as the author for all content
-- This script updates all forum content to have a consistent author

-- Use a demo UUID for Rick (in a real app, you'd get this from auth.users)
UPDATE forum_topics 
SET author_id = '00000000-0000-0000-0000-000000000001'::uuid;

UPDATE forum_posts 
SET author_id = '00000000-0000-0000-0000-000000000001'::uuid;

UPDATE forum_likes 
SET user_id = '00000000-0000-0000-0000-000000000001'::uuid;

UPDATE forum_views 
SET user_id = '00000000-0000-0000-0000-000000000001'::uuid; 