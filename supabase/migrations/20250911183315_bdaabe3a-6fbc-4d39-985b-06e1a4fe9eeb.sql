-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.generate_session_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..7 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sessions 
  WHERE expires_at < now() OR (active_users = 0 AND last_activity < now() - interval '30 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update activity function
CREATE OR REPLACE FUNCTION public.update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;