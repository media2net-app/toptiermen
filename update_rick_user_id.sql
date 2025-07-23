-- Update all forum content to use Rick's real user ID
-- Replace the demo UUID with Rick's actual user ID

UPDATE forum_topics 
SET author_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid
WHERE author_id = '00000000-0000-0000-0000-000000000001'::uuid;

UPDATE forum_posts 
SET author_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid
WHERE author_id = '00000000-0000-0000-0000-000000000001'::uuid;

UPDATE forum_likes 
SET user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid;

UPDATE forum_views 
SET user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid; 