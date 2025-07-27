-- =============================================
-- Fix Rob's XP Tracking Issues
-- Execute this in Supabase SQL Editor
-- =============================================

-- Step 1: Find Rob's user ID
DO $$
DECLARE
    rob_user_id UUID;
BEGIN
    -- Get Rob's user ID
    SELECT id INTO rob_user_id FROM auth.users WHERE email = 'rob@media2net.nl';
    
    IF rob_user_id IS NULL THEN
        RAISE NOTICE '❌ Rob user not found';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Found Rob with ID: %', rob_user_id;
    
    -- Step 2: Check if user_xp table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_xp') THEN
        RAISE NOTICE '❌ user_xp table does not exist';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ user_xp table exists';
    
    -- Step 3: Check if Rob has an XP record
    IF NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = rob_user_id) THEN
        RAISE NOTICE '⚠️  Rob has no XP record - creating one...';
        
        INSERT INTO user_xp (user_id, total_xp, current_rank_id, created_at, updated_at)
        VALUES (rob_user_id, 0, 1, NOW(), NOW());
        
        RAISE NOTICE '✅ Created XP record for Rob';
    ELSE
        RAISE NOTICE '✅ Rob already has an XP record';
    END IF;
    
    -- Step 4: Show Rob's current XP status
    RAISE NOTICE '📊 Rob''s current XP status:';
    FOR xp_record IN 
        SELECT total_xp, current_rank_id, updated_at 
        FROM user_xp 
        WHERE user_id = rob_user_id
    LOOP
        RAISE NOTICE '   Total XP: %, Rank ID: %, Last Updated: %', 
            xp_record.total_xp, xp_record.current_rank_id, xp_record.updated_at;
    END LOOP;
    
    -- Step 5: Check XP transactions
    RAISE NOTICE '📝 Checking XP transactions...';
    FOR tx_record IN 
        SELECT xp_amount, source_type, description, created_at
        FROM xp_transactions 
        WHERE user_id = rob_user_id 
        ORDER BY created_at DESC 
        LIMIT 5
    LOOP
        RAISE NOTICE '   % XP - % - % (%)', 
            tx_record.xp_amount, tx_record.source_type, tx_record.description, tx_record.created_at;
    END LOOP;
    
    -- Step 6: Check missions
    RAISE NOTICE '🎯 Checking missions...';
    FOR mission_record IN 
        SELECT title, xp_reward, status, created_at
        FROM user_missions 
        WHERE user_id = rob_user_id
    LOOP
        RAISE NOTICE '   % (% XP) - Status: % (%)', 
            mission_record.title, mission_record.xp_reward, mission_record.status, mission_record.created_at;
    END LOOP;
    
    -- Step 7: Test XP update
    RAISE NOTICE '🧪 Testing XP update...';
    UPDATE user_xp 
    SET total_xp = total_xp + 100, updated_at = NOW() 
    WHERE user_id = rob_user_id;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Successfully added 100 XP to Rob';
        
        -- Log the test transaction
        INSERT INTO xp_transactions (user_id, xp_amount, source_type, source_id, description)
        VALUES (rob_user_id, 100, 'test_fix', 0, 'XP fix test - added 100 XP');
        
        RAISE NOTICE '✅ Logged test transaction';
    ELSE
        RAISE NOTICE '❌ Failed to update XP';
    END IF;
    
    -- Step 8: Show final XP status
    RAISE NOTICE '💰 Final XP status:';
    FOR final_xp IN 
        SELECT total_xp, current_rank_id, updated_at 
        FROM user_xp 
        WHERE user_id = rob_user_id
    LOOP
        RAISE NOTICE '   Total XP: %, Rank ID: %, Last Updated: %', 
            final_xp.total_xp, final_xp.current_rank_id, final_xp.updated_at;
    END LOOP;
    
END $$;

-- Step 9: Check RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'user_xp';

-- Step 10: Check if exec_sql function exists
SELECT 
    routine_name, 
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'exec_sql';

-- Step 11: Show all users and their XP status
SELECT 
    u.email,
    ux.total_xp,
    ux.current_rank_id,
    ux.updated_at,
    COUNT(xt.id) as transaction_count
FROM auth.users u
LEFT JOIN user_xp ux ON u.id = ux.user_id
LEFT JOIN xp_transactions xt ON u.id = xt.user_id
GROUP BY u.email, ux.total_xp, ux.current_rank_id, ux.updated_at
ORDER BY ux.total_xp DESC NULLS LAST; 