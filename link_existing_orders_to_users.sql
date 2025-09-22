-- =====================================================
-- Link Existing Orders to Users by Email
-- Run this to connect existing orders to their users
-- =====================================================

-- Update existing orders to link them with users based on email
UPDATE orders 
SET user_id = users.id
FROM users 
WHERE orders.email = users.email 
AND orders.user_id IS NULL;

-- Check how many orders were linked
SELECT 
    COUNT(*) as linked_orders,
    'Orders successfully linked to users' as status
FROM orders 
WHERE user_id IS NOT NULL;

-- Show unlinked orders (orders without user_id)
SELECT 
    id,
    email,
    phone,
    reference,
    created_at,
    'No matching user found' as reason
FROM orders 
WHERE user_id IS NULL 
AND email IS NOT NULL;

-- Summary report
SELECT 
    'Total Orders' as metric,
    COUNT(*) as count
FROM orders

UNION ALL

SELECT 
    'Orders with User ID' as metric,
    COUNT(*) as count
FROM orders 
WHERE user_id IS NOT NULL

UNION ALL

SELECT 
    'Orders without User ID' as metric,
    COUNT(*) as count
FROM orders 
WHERE user_id IS NULL;

-- =====================================================
-- Verification: Check user orders
-- =====================================================

-- Show users and their order count
SELECT 
    u.id,
    u.full_name,
    u.email,
    COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.full_name, u.email
ORDER BY order_count DESC;