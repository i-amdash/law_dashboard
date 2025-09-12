-- Add new columns to users table if they don't exist
DO $$
BEGIN
    -- Check if height column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'height'
    ) THEN
        ALTER TABLE users ADD COLUMN height TEXT;
        RAISE NOTICE 'Added height column to users table';
    ELSE
        RAISE NOTICE 'height column already exists in users table';
    END IF;

    -- Check if cap_size column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'cap_size'
    ) THEN
        ALTER TABLE users ADD COLUMN cap_size TEXT;
        RAISE NOTICE 'Added cap_size column to users table';
    ELSE
        RAISE NOTICE 'cap_size column already exists in users table';
    END IF;

    -- Check if shirt_size column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'shirt_size'
    ) THEN
        ALTER TABLE users ADD COLUMN shirt_size TEXT;
        RAISE NOTICE 'Added shirt_size column to users table';
    ELSE
        RAISE NOTICE 'shirt_size column already exists in users table';
    END IF;

    -- Check if profile_image column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_image'
    ) THEN
        ALTER TABLE users ADD COLUMN profile_image TEXT;
        RAISE NOTICE 'Added profile_image column to users table';
    ELSE
        RAISE NOTICE 'profile_image column already exists in users table';
    END IF;
END $$;
