-- =====================================================
-- O&B Apparel - Forgot Password Database Update Script
-- Supabase SQL Editor Compatible Version
-- Date: September 21, 2025
-- Description: Adds temporary password tracking fields to users table
-- =====================================================

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

-- =====================================================
-- Cleanup Function (Run this separately if needed)
-- =====================================================
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