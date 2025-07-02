-- Controleer de exacte structuur van de exercises tabel
-- Dit helpt ons om te zien welke kolommen daadwerkelijk bestaan

-- Toon alle kolommen in de exercises tabel
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'exercises'
ORDER BY ordinal_position;

-- Toon een voorbeeld van bestaande data
SELECT * FROM exercises LIMIT 3; 