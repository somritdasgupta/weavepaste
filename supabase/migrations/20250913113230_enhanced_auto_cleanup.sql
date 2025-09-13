
-- 1. Cleanup function with better logic
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete sessions that meet any of these criteria:
  -- 1. Expired (past 6 hours)
  -- 2. No active users and inactive for 30 minutes
  -- 3. No users joined and created more than 1 hour ago (abandoned sessions)
  DELETE FROM public.sessions 
  WHERE 
    expires_at < now() 
    OR (active_users = 0 AND last_activity < now() - interval '30 minutes')
    OR (active_users = 0 AND created_at < now() - interval '1 hour');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup activity (optional - for monitoring)
  RAISE NOTICE 'Cleaned up % expired sessions at %', deleted_count, now();
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Function to update active user count based on session_users table
CREATE OR REPLACE FUNCTION public.update_active_user_count()
RETURNS void AS $$
BEGIN
  UPDATE public.sessions 
  SET active_users = (
    SELECT COUNT(*) 
    FROM public.session_users 
    WHERE session_users.session_id = sessions.id 
    AND session_users.is_active = true 
    AND session_users.last_seen > now() - interval '5 minutes'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Function to mark inactive users and update counts
CREATE OR REPLACE FUNCTION public.mark_inactive_users()
RETURNS void AS $$
BEGIN
  -- Mark users as inactive if they haven't been seen for 5 minutes
  UPDATE public.session_users 
  SET is_active = false 
  WHERE last_seen < now() - interval '5 minutes' AND is_active = true;
  
  -- Remove users who have been inactive for 30 minutes
  DELETE FROM public.session_users 
  WHERE last_seen < now() - interval '30 minutes';
  
  -- Update active user counts after cleanup
  PERFORM public.update_active_user_count();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Comprehensive cleanup function that runs all cleanup tasks
CREATE OR REPLACE FUNCTION public.run_comprehensive_cleanup()
RETURNS TABLE(
  sessions_deleted INTEGER,
  users_cleaned INTEGER
) AS $$
DECLARE
  deleted_sessions INTEGER := 0;
  cleaned_users INTEGER := 0;
BEGIN
  -- First, clean up inactive users
  PERFORM public.mark_inactive_users();
  
  -- Count users that will be affected
  SELECT COUNT(*) INTO cleaned_users 
  FROM public.session_users 
  WHERE last_seen < now() - interval '30 minutes';
  
  -- Then clean up expired sessions
  SELECT public.cleanup_expired_sessions() INTO deleted_sessions;
  
  RETURN QUERY SELECT deleted_sessions, cleaned_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Function to heartbeat user activity (call this from frontend)
CREATE OR REPLACE FUNCTION public.user_heartbeat(
  p_session_id UUID,
  p_user_name TEXT
)
RETURNS void AS $$
BEGIN
  -- Update user's last_seen timestamp
  UPDATE public.session_users 
  SET 
    last_seen = now(),
    is_active = true
  WHERE session_id = p_session_id AND user_name = p_user_name;
  
  -- Update session's last_activity
  UPDATE public.sessions 
  SET last_activity = now()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Auto-cleanup trigger when session content is updated
CREATE OR REPLACE FUNCTION public.trigger_session_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity
  NEW.last_activity = now();
  
  -- Trigger cleanup of old sessions (async-style)
  PERFORM public.cleanup_expired_sessions();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Replace the old trigger
DROP TRIGGER IF EXISTS update_sessions_activity ON public.sessions;
CREATE TRIGGER update_sessions_activity
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_session_update();

-- 7. Create a view for monitoring session health
CREATE OR REPLACE VIEW public.session_health AS
SELECT 
  s.session_code,
  s.created_at,
  s.expires_at,
  s.last_activity,
  s.active_users,
  COUNT(su.id) as total_users,
  COUNT(su.id) FILTER (WHERE su.is_active = true) as active_users_detailed,
  EXTRACT(EPOCH FROM (now() - s.last_activity))/60 as minutes_since_activity,
  EXTRACT(EPOCH FROM (s.expires_at - now()))/3600 as hours_until_expiry,
  CASE 
    WHEN s.expires_at < now() THEN 'EXPIRED'
    WHEN s.active_users = 0 AND s.last_activity < now() - interval '30 minutes' THEN 'INACTIVE'
    WHEN s.active_users = 0 AND s.created_at < now() - interval '1 hour' THEN 'ABANDONED'
    ELSE 'ACTIVE'
  END as status
FROM public.sessions s
LEFT JOIN public.session_users su ON s.id = su.session_id
GROUP BY s.id, s.session_code, s.created_at, s.expires_at, s.last_activity, s.active_users
ORDER BY s.last_activity DESC;

-- Grant permissions for the view
GRANT SELECT ON public.session_health TO authenticated, anon;

COMMENT ON FUNCTION public.cleanup_expired_sessions() IS 'Deletes expired, inactive, or abandoned sessions and returns count of deleted sessions';
COMMENT ON FUNCTION public.run_comprehensive_cleanup() IS 'Runs complete cleanup of users and sessions, returns statistics';
COMMENT ON FUNCTION public.user_heartbeat(UUID, TEXT) IS 'Updates user activity timestamp - call this from frontend every 30 seconds';
COMMENT ON VIEW public.session_health IS 'Monitoring view showing session status and health metrics';