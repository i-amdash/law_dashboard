-- =====================================================
-- O&B Apparel - Forgot Password Database Update Script
-- Date: September 21, 2025
-- Description: Adds temporary password tracking fields to users table
-- =====================================================

-- Start transaction to ensure all changes are applied atomically
BEGIN;

-- Add temporary password tracking fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_temp_password BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS temp_password_created_at TIMESTAMP NULL;

-- Add index for better performance on temp password queries
CREATE INDEX IF NOT EXISTS idx_users_temp_password 
ON users(is_temp_password, temp_password_created_at);

-- Update any existing users to ensure they have the default values
UPDATE users 
SET 
    is_temp_password = FALSE,
    temp_password_created_at = NULL
WHERE 
    is_temp_password IS NULL;

-- Add comments to document the new fields
COMMENT ON COLUMN users.is_temp_password IS 'Indicates if the user is currently using a temporary password';
COMMENT ON COLUMN users.temp_password_created_at IS 'Timestamp when the temporary password was created (used for expiration)';

-- Optional: Create a function to clean up expired temporary passwords
-- This can be run periodically to clean up old temporary password data
CREATE OR REPLACE FUNCTION cleanup_expired_temp_passwords()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update users whose temporary passwords have expired (older than 24 hours)
    UPDATE users 
    SET 
        is_temp_password = FALSE,
        temp_password_created_at = NULL
    WHERE 
        is_temp_password = TRUE 
        AND temp_password_created_at IS NOT NULL
        AND temp_password_created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the cleanup function
COMMENT ON FUNCTION cleanup_expired_temp_passwords() IS 'Cleans up expired temporary passwords (older than 24 hours)';

-- Commit the transaction
COMMIT;

-- =====================================================
-- Verification Queries (Optional - Run these to verify the changes)
-- =====================================================

-- Verify the new columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('is_temp_password', 'temp_password_created_at');

-- Verify the index was created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'users' 
AND indexname = 'idx_users_temp_password';

-- Check current user table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Sample query to check for users with temporary passwords
SELECT 
    id, 
    email, 
    is_temp_password, 
    temp_password_created_at,
    CASE 
        WHEN is_temp_password = TRUE AND temp_password_created_at < NOW() - INTERVAL '24 hours' 
        THEN 'EXPIRED' 
        WHEN is_temp_password = TRUE 
        THEN 'ACTIVE' 
        ELSE 'PERMANENT' 
    END as password_status
FROM users 
WHERE is_temp_password = TRUE;

-- =====================================================
-- Maintenance Commands (Optional - For future use)
-- =====================================================

-- To manually run the cleanup function:
-- SELECT cleanup_expired_temp_passwords();

-- To check how many users have temporary passwords:
-- SELECT COUNT(*) as temp_password_users FROM users WHERE is_temp_password = TRUE;

-- To check for expired temporary passwords:
-- SELECT COUNT(*) as expired_temp_passwords 
-- FROM users 
-- WHERE is_temp_password = TRUE 
-- AND temp_password_created_at < NOW() - INTERVAL '24 hours';

-- =====================================================
-- End of Script
-- =====================================================