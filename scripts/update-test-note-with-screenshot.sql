-- Update the latest test note with a screenshot URL
UPDATE test_notes 
SET screenshot_url = 'https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/bug-screenshots/screenshots/1754403928627-test-screenshot.png'
WHERE id = '4a68a305-60cf-42d0-aa14-3cb2d708c24e';

-- Verify the update
SELECT id, description, screenshot_url, created_at 
FROM test_notes 
WHERE screenshot_url IS NOT NULL 
ORDER BY created_at DESC; 