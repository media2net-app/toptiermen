-- Create leaderboard function
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  total_xp INTEGER,
  current_rank_id INTEGER,
  rank_name TEXT,
  badge_count BIGINT,
  current_streak INTEGER,
  rank_position BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      ux.user_id,
      COALESCE(p.full_name, 'Unknown User') as full_name,
      ux.total_xp,
      ux.current_rank_id,
      r.name as rank_name,
      COALESCE(badge_counts.badge_count, 0) as badge_count,
      COALESCE(streaks.current_streak, 0) as current_streak,
      ROW_NUMBER() OVER (ORDER BY ux.total_xp DESC) as rank_position
    FROM user_xp ux
    LEFT JOIN profiles p ON ux.user_id = p.id
    LEFT JOIN ranks r ON ux.current_rank_id = r.id
    LEFT JOIN (
      SELECT 
        user_id, 
        COUNT(*) as badge_count
      FROM user_badges 
      WHERE status = 'unlocked'
      GROUP BY user_id
    ) badge_counts ON ux.user_id = badge_counts.user_id
    LEFT JOIN (
      SELECT 
        user_id,
        current_streak
      FROM user_streaks
      WHERE streak_type = 'daily_login'
    ) streaks ON ux.user_id = streaks.user_id
    ORDER BY ux.total_xp DESC
    LIMIT p_limit
  )
  SELECT 
    ru.user_id,
    ru.full_name,
    ru.total_xp,
    ru.current_rank_id,
    ru.rank_name,
    ru.badge_count,
    ru.current_streak,
    ru.rank_position
  FROM ranked_users ru;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 