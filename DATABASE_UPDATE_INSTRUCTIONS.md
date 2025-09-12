# Database Update Instructions

To add the new required columns to the `users` table, follow these steps:

## Option 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard: https://app.supabase.io/
2. Select your project: `gedpiytpmvcacqrskfvz`
3. Go to the "SQL Editor" section
4. Click "New query"
5. Copy and paste the following SQL script:

```sql
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
```

6. Click "Run" to execute the SQL script
7. Check the results to ensure all columns were added successfully

## Option 2: Using the Database Migration

If you prefer to apply this as a migration:

1. Place the SQL script in your `backend/supabase/migrations` folder with a timestamp prefix
2. Push the migration using the Supabase CLI or dashboard

The SQL script has been saved to: 
`/Users/admin/Desktop/Desktop/Desktop Files/Projects/pp/o_n_b_apparels/backend/supabase/add_columns_to_users.sql`
