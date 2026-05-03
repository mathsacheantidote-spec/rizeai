
-- Mentors table
CREATE TABLE public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'Technical',
  avatar_color TEXT DEFAULT 'bg-primary',
  available BOOLEAN DEFAULT true,
  match_score INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mentors" ON public.mentors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mentors can update own profile" ON public.mentors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Mentors can insert own profile" ON public.mentors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Mentor availability slots
CREATE TABLE public.mentor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view availability" ON public.mentor_availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mentors manage own availability" ON public.mentor_availability FOR ALL TO authenticated USING (
  mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid())
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  jitsi_room_id TEXT NOT NULL DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (
  auth.uid() = student_id OR mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid())
);
CREATE POLICY "Mentor can update booking status" ON public.bookings FOR UPDATE TO authenticated USING (
  mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid())
);
CREATE POLICY "Students can cancel own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = student_id);

-- Session feedback
CREATE TABLE public.session_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can create feedback" ON public.session_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Participants can view feedback" ON public.session_feedback FOR SELECT TO authenticated USING (
  booking_id IN (SELECT id FROM public.bookings WHERE student_id = auth.uid() OR mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()))
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
