-- Add end_date column to farm_plans table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farm_plans' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE public.farm_plans 
        ADD COLUMN end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days');
        
        -- Update existing records to have a default end_date 30 days from now
        UPDATE public.farm_plans 
        SET end_date = COALESCE(end_date, start_date + INTERVAL '30 days')
        WHERE end_date IS NULL;
        
        -- Remove the default after populating existing data
        ALTER TABLE public.farm_plans 
        ALTER COLUMN end_date DROP DEFAULT;
    END IF;
END $$;
