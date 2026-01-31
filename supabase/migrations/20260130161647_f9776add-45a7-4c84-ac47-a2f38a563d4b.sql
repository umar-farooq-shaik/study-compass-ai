-- Create application_tasks table for storing AI-generated and user tasks
CREATE TABLE public.application_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'document', 'exam', 'application', 'financial', 'other'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  
  -- Status tracking
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Deadline tracking
  due_date DATE,
  
  -- AI vs manual
  is_ai_generated BOOLEAN NOT NULL DEFAULT true,
  
  -- Ordering
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.application_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tasks"
ON public.application_tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
ON public.application_tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.application_tasks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON public.application_tasks
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_application_tasks_updated_at
BEFORE UPDATE ON public.application_tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();