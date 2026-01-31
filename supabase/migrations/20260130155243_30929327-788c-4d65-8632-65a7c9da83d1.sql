-- Create profiles table for user onboarding data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Academic Background (Section A)
  education_level TEXT, -- high_school, bachelors, masters, other
  degree_major TEXT,
  graduation_year INTEGER,
  gpa_percentage DECIMAL(5,2),
  
  -- Study Goals (Section B)
  intended_degree TEXT, -- bachelors, masters, mba, phd
  field_of_study TEXT,
  target_intake_year INTEGER,
  target_intake_term TEXT, -- fall, spring, summer
  preferred_countries TEXT[], -- array of country codes
  
  -- Budget (Section C)
  budget_min INTEGER,
  budget_max INTEGER,
  funding_plan TEXT, -- self_funded, scholarship_dependent, loan_dependent
  
  -- Exams & Readiness (Section D)
  ielts_toefl_status TEXT, -- not_planned, planned, taken
  ielts_toefl_score DECIMAL(3,1),
  gre_gmat_status TEXT, -- not_planned, planned, taken
  gre_gmat_score INTEGER,
  sop_status TEXT, -- not_started, draft, ready
  
  -- Meta
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER NOT NULL DEFAULT 1,
  current_stage TEXT NOT NULL DEFAULT 'onboarding',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();