-- Create universities table for AI-generated recommendations
CREATE TABLE public.universities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- University details
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  
  -- Program details
  program_name TEXT,
  degree_type TEXT NOT NULL, -- bachelors, masters, mba, phd
  field_of_study TEXT,
  
  -- Costs
  tuition_per_year INTEGER,
  living_cost_per_year INTEGER,
  
  -- Categorization
  category TEXT NOT NULL CHECK (category IN ('dream', 'target', 'safe')),
  acceptance_likelihood TEXT CHECK (acceptance_likelihood IN ('low', 'medium', 'high')),
  
  -- AI-generated insights
  fit_explanation TEXT,
  risk_explanation TEXT,
  requirements_summary TEXT,
  
  -- Status
  is_shortlisted BOOLEAN NOT NULL DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own universities"
  ON public.universities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own universities"
  ON public.universities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own universities"
  ON public.universities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own universities"
  ON public.universities FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_universities_updated_at
  BEFORE UPDATE ON public.universities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_universities_user_id ON public.universities(user_id);
CREATE INDEX idx_universities_category ON public.universities(category);
CREATE INDEX idx_universities_is_locked ON public.universities(is_locked);