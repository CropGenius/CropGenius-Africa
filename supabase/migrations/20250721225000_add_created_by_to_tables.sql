ALTER TABLE public.fields
ADD COLUMN created_by UUID REFERENCES auth.users(id);

ALTER TABLE public.farms
ADD COLUMN created_by UUID REFERENCES auth.users(id);
