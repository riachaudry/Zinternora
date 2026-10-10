-- Zinternora: enforce the fixed 1-month / 4-week program on an existing database.
-- Run after the original schema has been created.
ALTER TABLE public.roadmap_weeks DROP CONSTRAINT IF EXISTS roadmap_weeks_duration_check;
ALTER TABLE public.roadmap_weeks DROP CONSTRAINT IF EXISTS roadmap_weeks_week_number_check;
ALTER TABLE public.batches DROP CONSTRAINT IF EXISTS batches_duration_check;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_duration_check;
ALTER TABLE public.internships DROP CONSTRAINT IF EXISTS internships_duration_check;

ALTER TABLE public.roadmap_weeks
  ADD CONSTRAINT roadmap_weeks_duration_check CHECK (duration = 4),
  ADD CONSTRAINT roadmap_weeks_week_number_check CHECK (week_number BETWEEN 1 AND 4);

ALTER TABLE public.batches
  ADD CONSTRAINT batches_duration_check CHECK (duration = 4);

ALTER TABLE public.applications
  ADD CONSTRAINT applications_duration_check CHECK (duration = 4);

ALTER TABLE public.internships
  ADD CONSTRAINT internships_duration_check CHECK (duration = 4);
