# 🔧 Admin Login Troubleshooting Guide

## 🚨 **"Invalid admin credentials" Error - Step by Step Fix**

### **Step 1: Use the Diagnostic Tool**

1. **Go to the admin login page**: `http://localhost:5174/admin`
2. **Click the "🔧 Diagnostic Tool" button** (bottom right corner)
3. **Click "Run Diagnostics"** to see exactly what's wrong
4. **Follow the specific instructions** based on the diagnostic results

### **Step 2: Manual Setup (If Diagnostic Tool Shows Issues)**

#### **A. Create Admin User in Supabase Auth**

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Navigate to Authentication**
   - Click **"Authentication"** in left sidebar
   - Click **"Users"** tab

3. **Create New User**
   - Click **"Add user"** button
   - **Email:** `pathtechacademy@gmail.com`
   - **Password:** `admin`
   - **✅ IMPORTANT:** Check **"Auto Confirm User"**
   - Click **"Create user"**

4. **Copy the User ID**
   - After creating, copy the **User ID** (UUID format)
   - You'll need this for the next step

#### **B. Create Admin Profile in Database**

1. **Go to SQL Editor in Supabase**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**

2. **Run this SQL** (replace `YOUR_USER_ID_HERE` with the actual User ID):

```sql
INSERT INTO students (
    user_id,
    full_name,
    email,
    is_admin,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with actual user_id from Supabase Auth
    'PathTech Admin',
    'pathtechacademy@gmail.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_admin = true,
    updated_at = NOW();
```

3. **Verify the setup** by running:

```sql
SELECT id, user_id, full_name, email, is_admin, created_at 
FROM students 
WHERE email = 'pathtechacademy@gmail.com';
```

You should see:
- `is_admin = true`
- Valid `user_id` matching your Supabase Auth user
- Recent `created_at` timestamp

### **Step 3: Test Login**

1. **Go to**: `http://localhost:5174/admin`
2. **Login with**:
   - **Email:** `pathtechacademy@gmail.com`
   - **Password:** `admin`
3. **You should now access the admin dashboard!**

## 🔍 **Common Issues & Solutions**

### **Issue 1: "Invalid login credentials"**
**Cause:** User doesn't exist in Supabase Auth or wrong password
**Solution:** 
- Create the user in Supabase Auth with correct email/password
- Make sure "Auto Confirm User" is checked

### **Issue 2: "Email not confirmed"**
**Cause:** User exists but email is not confirmed
**Solution:**
- Check "Auto Confirm User" when creating the user
- Or manually confirm the user in Supabase Auth

### **Issue 3: "Access denied" after login**
**Cause:** User exists in Auth but not in database, or `is_admin = false`
**Solution:**
- Create the admin profile in the database
- Make sure `is_admin = true`

### **Issue 4: "User not found in database"**
**Cause:** Admin profile doesn't exist in the `students` table
**Solution:**
- Run the SQL INSERT query to create the admin profile
- Make sure the `user_id` matches the Supabase Auth user ID

### **Issue 5: "Wrong user_id"**
**Cause:** The `user_id` in database doesn't match the Supabase Auth user ID
**Solution:**
- Copy the correct User ID from Supabase Auth
- Update the database record with the correct `user_id`

## 🛠️ **Quick Fixes**

### **Fix 1: Reset Admin User**
If you want to start fresh:

1. **Delete from database:**
```sql
DELETE FROM students WHERE email = 'pathtechacademy@gmail.com';
```

2. **Delete from Supabase Auth:**
   - Go to Authentication → Users
   - Find the user and delete it

3. **Recreate following Step 2 above**

### **Fix 2: Update Existing User**
If the user exists but `is_admin = false`:

```sql
UPDATE students 
SET is_admin = true, updated_at = NOW() 
WHERE email = 'pathtechacademy@gmail.com';
```

### **Fix 3: Fix User ID Mismatch**
If you have the wrong `user_id`:

1. **Get correct User ID** from Supabase Auth
2. **Update the database:**
```sql
UPDATE students 
SET user_id = 'CORRECT_USER_ID_HERE', updated_at = NOW() 
WHERE email = 'pathtechacademy@gmail.com';
```

## 📋 **Verification Checklist**

Before testing login, verify:

- [ ] **Supabase Auth**: User exists with email `pathtechacademy@gmail.com`
- [ ] **Supabase Auth**: Password is `admin`
- [ ] **Supabase Auth**: User is confirmed/active
- [ ] **Database**: Admin profile exists in `students` table
- [ ] **Database**: `is_admin = true`
- [ ] **Database**: `user_id` matches Supabase Auth User ID
- [ ] **Environment**: `.env` file has correct Supabase credentials
- [ ] **Server**: Development server is running on correct port

## 🎯 **Expected Result**

After completing the setup:

1. **Go to**: `http://localhost:5174/admin`
2. **See**: Admin login page
3. **Login with**: `pathtechacademy@gmail.com` / `admin`
4. **Access**: Full admin dashboard with analytics and course management

## 🆘 **Still Having Issues?**

1. **Use the Diagnostic Tool** - It will tell you exactly what's wrong
2. **Check Browser Console** - Look for error messages (F12 → Console)
3. **Check Supabase Logs** - Go to Supabase Dashboard → Logs
4. **Verify Environment Variables** - Make sure `.env` file is correct
5. **Restart Development Server** - Sometimes needed after `.env` changes

## 📞 **Need More Help?**

If you're still stuck:

1. **Run the diagnostic tool** and share the results
2. **Check the browser console** for any error messages
3. **Verify your Supabase project** is active and accessible
4. **Make sure your `.env` file** has the correct credentials

---

**🎉 Once you complete these steps, your admin dashboard will be fully functional!**
