-- Setup Admin User for PathTech Academy
-- This script creates the admin user in the database

-- First, create the admin user in Supabase Auth (this needs to be done manually in Supabase Dashboard)
-- Then run this script to set up the admin profile

-- Insert admin user profile
INSERT INTO students (
    user_id,
    full_name,
    email,
    is_admin,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- This will be replaced with actual user_id from Supabase Auth
    'PathTech Admin',
    'pathtechacademy@gmail.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_admin = true,
    updated_at = NOW();

-- Verify the admin user was created
SELECT 
    id,
    full_name,
    email,
    is_admin,
    created_at
FROM students 
WHERE email = 'pathtechacademy@gmail.com';
