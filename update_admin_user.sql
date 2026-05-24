-- Update Nagarjuna Behara to ADMIN role
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'nagarjunabhr8@gmail.com'
   OR (first_name = 'Nagarjuna' AND last_name = 'Behara');

-- Verify the update
SELECT id, email, first_name, last_name, role, is_active 
FROM users 
WHERE email = 'nagarjunabhr8@gmail.com' 
   OR (first_name = 'Nagarjuna' AND last_name = 'Behara');
