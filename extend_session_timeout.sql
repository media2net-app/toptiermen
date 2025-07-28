-- Extend Session Timeout voor Top Tier Men
-- Voer dit script uit in je Supabase SQL Editor om automatisch uitloggen te voorkomen

-- 1. Update JWT expiry time (standaard is 1 uur, nu naar 30 dagen)
-- Dit moet worden gedaan via Supabase Dashboard, niet via SQL

-- 2. Maak een functie om sessies te verlengen
CREATE OR REPLACE FUNCTION extend_user_session(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update last_login om sessie actief te houden
  UPDATE users 
  SET last_login = NOW() 
  WHERE id = user_uuid;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Maak een trigger om sessies automatisch te verlengen bij activiteit
CREATE OR REPLACE FUNCTION auto_extend_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Verleng sessie bij elke database activiteit
  PERFORM extend_user_session(NEW.user_id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error maar faal niet
    RAISE WARNING 'Error extending session: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Voeg trigger toe aan workout_sessions tabel
DROP TRIGGER IF EXISTS auto_extend_session_trigger ON workout_sessions;
CREATE TRIGGER auto_extend_session_trigger
  AFTER INSERT OR UPDATE ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_extend_session();

-- 5. Voeg trigger toe aan forum_posts tabel (als deze bestaat)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts') THEN
    DROP TRIGGER IF EXISTS auto_extend_session_forum_trigger ON forum_posts;
    CREATE TRIGGER auto_extend_session_forum_trigger
      AFTER INSERT OR UPDATE ON forum_posts
      FOR EACH ROW
      EXECUTE FUNCTION auto_extend_session();
  END IF;
END $$;

-- 6. Voeg trigger toe aan user_missions tabel (als deze bestaat)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_missions') THEN
    DROP TRIGGER IF EXISTS auto_extend_session_missions_trigger ON user_missions;
    CREATE TRIGGER auto_extend_session_missions_trigger
      AFTER INSERT OR UPDATE ON user_missions
      FOR EACH ROW
      EXECUTE FUNCTION auto_extend_session();
  END IF;
END $$;

-- 7. Maak een functie om alle actieve sessies te verlengen
CREATE OR REPLACE FUNCTION refresh_all_active_sessions()
RETURNS INTEGER AS $$
DECLARE
  session_count INTEGER := 0;
BEGIN
  -- Verleng sessies van gebruikers die in de afgelopen 24 uur actief waren
  UPDATE users 
  SET last_login = NOW() 
  WHERE last_login > NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS session_count = ROW_COUNT;
  RETURN session_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Maak een cron job om sessies dagelijks te verlengen (optioneel)
-- Dit vereist pg_cron extensie die mogelijk niet beschikbaar is in Supabase
-- SELECT cron.schedule('extend-sessions', '0 2 * * *', 'SELECT refresh_all_active_sessions();');

-- 9. Voeg commentaar toe voor documentatie
COMMENT ON FUNCTION extend_user_session(UUID) IS 'Verlengt de sessie van een gebruiker door last_login bij te werken';
COMMENT ON FUNCTION auto_extend_session() IS 'Automatische trigger om sessies te verlengen bij gebruikersactiviteit';
COMMENT ON FUNCTION refresh_all_active_sessions() IS 'Verlengt alle actieve sessies van de afgelopen 24 uur';

-- 10. Toon huidige sessie instellingen
SELECT 
  'Session Configuration' as info,
  'JWT expiry moet handmatig worden aangepast in Supabase Dashboard' as note
UNION ALL
SELECT 
  'Auto-extend triggers' as info,
  'Triggers toegevoegd aan workout_sessions, forum_posts, user_missions' as note
UNION ALL
SELECT 
  'Functions created' as info,
  'extend_user_session, auto_extend_session, refresh_all_active_sessions' as note; 