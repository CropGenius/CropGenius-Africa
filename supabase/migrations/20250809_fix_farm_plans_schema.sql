-- Fix farm_plans table schema to match the latest definition
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farm_plans' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.farm_plans 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Set a default user_id for existing records (you may need to update this)
        UPDATE public.farm_plans 
        SET user_id = (SELECT id FROM auth.users LIMIT 1)
        WHERE user_id IS NULL;
        
        -- Make the column NOT NULL after populating
        ALTER TABLE public.farm_plans 
        ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farm_plans' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.farm_plans 
        ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
        
        -- Add check constraint
        ALTER TABLE public.farm_plans 
        ADD CONSTRAINT farm_plans_status_check 
        CHECK (status IN ('draft', 'active', 'completed'));
    END IF;
    
    -- Add created_at and updated_at if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farm_plans' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.farm_plans 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farm_plans' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.farm_plans 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Create a function to update the updated_at column
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create a trigger to update the updated_at column
        DROP TRIGGER IF EXISTS update_farm_plans_updated_at ON public.farm_plans;
        CREATE TRIGGER update_farm_plans_updated_at
        BEFORE UPDATE ON public.farm_plans
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
