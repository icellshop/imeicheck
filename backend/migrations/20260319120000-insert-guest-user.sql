-- Create a guest user for all guest orders/payments
-- Run this SQL in your PostgreSQL database (adjust user_id if 1 is taken)

INSERT INTO users (user_id, username, email, password_hash, user_type, balance, full_name, country, createdAt, updatedAt)
VALUES (1, 'guest', 'guest@imeicheck2.com', '', 'guest', 0, 'Guest User', NULL, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;
