-- Migration to restructure orders table with proper columns
-- Add new columns for better order management

-- First, add the new columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- Copy email data from the address column (since it currently stores emails)
UPDATE orders 
SET email = address 
WHERE address IS NOT NULL AND address LIKE '%@%';

-- Update customer name from user profile if user_id exists
UPDATE orders 
SET customer_name = COALESCE(
  (SELECT name FROM users WHERE users.id = orders.user_id), 
  'Guest Customer'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- After migration is confirmed working, the address column can be dropped
-- ALTER TABLE orders DROP COLUMN address;