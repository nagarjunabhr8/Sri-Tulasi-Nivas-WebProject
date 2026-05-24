# Admin User Setup Guide - Nagarjuna Behara

## Current Status

✅ User **nagarjunabhr8@gmail.com** exists in the database  
⚠️ Current role is not ADMIN  
🔄 Need to update role to ADMIN

---

## Quick Setup (H2 Console Method)

### Step 1: Access H2 Console

Open your browser and go to:
```
http://localhost:8080/h2-console
```

### Step 2: Login to H2 Console

Fill in these details:
```
Driver Class: org.h2.Driver
JDBC URL: jdbc:h2:mem:sri_tulasi_nivas
User Name: sa
Password: (leave empty)
```

Click **"Connect"**

### Step 3: Run Update SQL

Copy and paste this SQL command into the query editor:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'nagarjunabhr8@gmail.com';
```

Click **"Run"** button

Expected result: `1 row(s) updated`

### Step 4: Verify the Update

Run this verification query:

```sql
SELECT id, email, first_name, last_name, role, is_active 
FROM users 
WHERE email = 'nagarjunabhr8@gmail.com';
```

Expected result:
```
ID  | EMAIL                      | FIRST_NAME | LAST_NAME | ROLE  | IS_ACTIVE
----|----------------------------|------------|-----------|-------|----------
?   | nagarjunabhr8@gmail.com    | Nagarjuna  | Behara    | ADMIN | true
```

✅ **Done! User is now ADMIN**

---

## Password Reset (Optional)

If you need to reset the password, use this SQL:

```sql
-- Update password to: AdminPassword123
UPDATE users 
SET password = '$2a$12$YOUR_BCRYPT_HASH_HERE' 
WHERE email = 'nagarjunabhr8@gmail.com';
```

**Note**: You'll need a BCrypt hash. To generate one:
1. Use an online BCrypt tool
2. Or register a new admin user and copy its password hash

---

## Login After Admin Update

Once the role is updated, login with:

```
Email: nagarjunabhr8@gmail.com
Password: (the password they originally set)
```

You should now have ADMIN permissions to:
- View all user details
- Update user information
- Delete users
- Manage apartments
- Manage events

---

## Additional Admin Operations

### View All Users (Admin Query)

```sql
SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at
FROM users 
ORDER BY created_at DESC;
```

### View Users by Role

```sql
-- All admins
SELECT * FROM users WHERE role = 'ADMIN';

-- All owners
SELECT * FROM users WHERE role = 'OWNER';

-- All tenants
SELECT * FROM users WHERE role = 'TENANT';
```

### Deactivate a User (Disable Account)

```sql
UPDATE users SET is_active = false WHERE email = 'user@example.com';
```

### Delete a User

```sql
DELETE FROM users WHERE id = ?;
```

---

## Admin Roles Explanation

| Role | Permissions |
|------|------------|
| **ADMIN** | ✓ Manage all users ✓ Delete users ✓ View apartments ✓ Manage events |
| **OWNER** | ✓ List own apartments ✓ Edit own apartment ✓ View tenants |
| **TENANT** | ✓ View apartments ✓ View events ✓ Make contributions |
| **GUEST** | ✓ View public apartments ✓ View public events |

---

## Troubleshooting

### Issue: Can't connect to H2 Console

**Solution**: 
- Make sure backend is running: `mvn spring-boot:run`
- Check that port 8080 is not blocked
- Try: `http://localhost:8080/h2-console`

### Issue: User not found in H2 Console

**Solution**:
- Run: `SELECT * FROM users;` to see all users
- Check email spelling
- User might have been created with different email

### Issue: "Table 'users' not found"

**Solution**:
- Backend may not have initialized database
- Restart backend with local profile
- Try registering a new user first

### Issue: 403 Forbidden on H2 Console

**Solution**:
- Check `application-local.yml` - H2 console should be enabled
- Verify: `h2.console.enabled: true`

---

## Verification After Update

Run these queries to confirm admin access is working:

```sql
-- 1. Check admin user exists
SELECT * FROM users WHERE role = 'ADMIN' AND email = 'nagarjunabhr8@gmail.com';

-- 2. Count admins
SELECT COUNT(*) as admin_count FROM users WHERE role = 'ADMIN';

-- 3. View admin users
SELECT id, email, first_name, last_name FROM users WHERE role = 'ADMIN';
```

All should show the user as ADMIN.

---

## Backend Code Reference

The backend checks the ADMIN role in these locations:

- `@PreAuthorize("hasRole('ADMIN')")` - Method-level security
- `SecurityConfiguration.java` - Global security rules
- `User.java` entity - Role enum (ADMIN, OWNER, TENANT, GUEST)

Any endpoint annotated with `@PreAuthorize("hasRole('ADMIN')")` will now be accessible to this user.

---

## Next Steps

1. ✅ Update role to ADMIN via H2 Console
2. ✅ Verify login with admin account
3. ✅ Test admin features in frontend
4. ✅ Add other admin users if needed

---

## Emergency: Create New Admin from Scratch

If all else fails, create a brand new admin user:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"neoadmin@example.com",
    "password":"SecurePassword123",
    "firstName":"Admin",
    "lastName":"User",
    "phone":"+919999999999",
    "role":"ADMIN"
  }'
```

Then login with:
- Email: `neoadmin@example.com`
- Password: `SecurePassword123`

---

**Status**: Ready for admin role update  
**Method**: H2 Console SQL Update  
**Expected Result**: Admin access for Nagarjuna Behara
