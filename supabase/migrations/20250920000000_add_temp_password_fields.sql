-- Add temporary password tracking fields to users table
ALTER TABLE users 
ADD COLUMN is_temp_password BOOLEAN DEFAULT FALSE,
ADD COLUMN temp_password_created_at TIMESTAMP NULL;

-- Add index for better performance on temp password queries
CREATE INDEX idx_users_temp_password ON users(is_temp_password, temp_password_created_at);