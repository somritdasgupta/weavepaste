-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '6 hours'),
  content TEXT DEFAULT '',
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'code')),
  active_users INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create session_users table for tracking connected users
CREATE TABLE public.session_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  color TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_users ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions (public access for demo)
CREATE POLICY "Sessions are viewable by everyone" 
ON public.sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Sessions can be created by everyone" 
ON public.sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sessions can be updated by everyone" 
ON public.sessions 
FOR UPDATE 
USING (true);

-- Create policies for session_users (public access for demo)
CREATE POLICY "Session users are viewable by everyone" 
ON public.session_users 
FOR SELECT 
USING (true);

CREATE POLICY "Session users can be created by everyone" 
ON public.session_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Session users can be updated by everyone" 
ON public.session_users 
FOR UPDATE 
USING (true);

CREATE POLICY "Session users can be deleted by everyone" 
ON public.session_users 
FOR DELETE 
USING (true);

-- Create function to generate session codes
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
$$ LANGUAGE plpgsql;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sessions 
  WHERE expires_at < now() OR (active_users = 0 AND last_activity < now() - interval '30 minutes');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_activity on content changes
CREATE OR REPLACE FUNCTION public.update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_activity
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_session_activity();

-- Enable realtime for tables
ALTER publication supabase_realtime ADD TABLE public.sessions;
ALTER publication supabase_realtime ADD TABLE public.session_users;