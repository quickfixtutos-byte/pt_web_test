# 🔐 PathTech Academy Admin Setup Guide

## 🚨 **IMPORTANT: Admin User Setup Required**

The admin dashboard requires a specific admin user to be set up in Supabase. Follow these steps to create the admin user:

### **Step 1: Create Admin User in Supabase Auth**

1. **Go to your Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in to your account
   - Select your project

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Create New User**
   - Click "Add user" button
   - **Email:** `pathtechacademy@gmail.com`
   - **Password:** `admin`
   - **Auto Confirm User:** ✅ Check this box
   - Click "Create user"

4. **Get the User ID**
   - Copy the User ID (UUID) of the newly created user
   - You'll need this for the next step

### **Step 2: Update Database with Admin Profile**

1. **Go to SQL Editor in Supabase**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run the Admin Setup Script**
   ```sql
   -- Replace 'YOUR_USER_ID_HERE' with the actual User ID from Step 1
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

3. **Verify Admin User**
   ```sql
   SELECT 
       id,
       user_id,
       full_name,
       email,
       is_admin,
       created_at
   FROM students 
   WHERE email = 'pathtechacademy@gmail.com';
   ```

### **Step 3: Test Admin Access**

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Admin Dashboard**
   - Go to `http://localhost:5173/admin`
   - You should see the admin login page

3. **Login with Admin Credentials**
   - **Email:** `pathtechacademy@gmail.com`
   - **Password:** `admin`
   - Click "Access Admin Dashboard"

4. **Verify Dashboard Access**
   - You should see the admin dashboard with analytics
   - All navigation sections should be accessible

## 🔧 **Troubleshooting**

### **Issue 1: "Invalid email or password" Error**

**Cause:** Admin user not created in Supabase Auth or database profile missing.

**Solution:**
1. Verify the user exists in Supabase Auth
2. Check that the user_id in the database matches the Auth user ID
3. Ensure the user has `is_admin = true` in the database

### **Issue 2: Admin Route Not Working**

**Cause:** URL routing not properly configured.

**Solution:**
1. Make sure you're using the correct URL: `http://localhost:5173/admin`
2. Check that the App.tsx has the URL handling code
3. Verify the AdminRoute component is properly imported

### **Issue 3: Access Denied Error**

**Cause:** User exists but doesn't have admin privileges.

**Solution:**
1. Check the database: `SELECT * FROM students WHERE email = 'pathtechacademy@gmail.com';`
2. Ensure `is_admin = true`
3. Verify the user_id matches the Supabase Auth user ID

### **Issue 4: Database Connection Issues**

**Cause:** Supabase connection not properly configured.

**Solution:**
1. Check your `.env` file has correct Supabase credentials
2. Verify Supabase project is active
3. Check network connection

## 📋 **Quick Setup Checklist**

- [ ] Supabase project is active
- [ ] Environment variables are set in `.env`
- [ ] Admin user created in Supabase Auth
- [ ] Admin profile created in database with `is_admin = true`
- [ ] Development server is running
- [ ] Can access `http://localhost:5173/admin`
- [ ] Can login with admin credentials
- [ ] Admin dashboard loads successfully

## 🎯 **Expected Behavior**

### **Successful Setup:**
1. **URL Access:** `http://localhost:5173/admin` shows admin login page
2. **Login:** Admin credentials work without errors
3. **Dashboard:** Full admin dashboard loads with analytics
4. **Navigation:** All sidebar sections are accessible
5. **Security:** Non-admin users are blocked from access

### **Admin Dashboard Features:**
- ✅ Real-time analytics (courses, students, signups, testimonials)
- ✅ Courses management with full CRUD
- ✅ Students management section
- ✅ Instructors management section
- ✅ Testimonials management section
- ✅ Newsletter subscribers section
- ✅ Admin settings section
- ✅ Responsive design for all devices
- ✅ Dark mode support

## 🚀 **Production Deployment**

### **For Production:**
1. **Change Admin Password:** Use a strong, unique password
2. **Update Email:** Use your actual admin email
3. **Environment Variables:** Set production Supabase credentials
4. **Security:** Enable additional security measures
5. **Backup:** Regular database backups

### **Security Best Practices:**
- Use strong passwords
- Enable 2FA if available
- Regular security updates
- Monitor access logs
- Backup admin data

---

## 🎉 **Admin Dashboard Ready!**

Once you complete the setup steps above, your PathTech Academy admin dashboard will be fully functional with:

- ✅ **Secure Authentication** with admin-only access
- ✅ **Real-time Analytics** and statistics
- ✅ **Complete Course Management** with CRUD operations
- ✅ **Student Management** capabilities
- ✅ **Professional UI/UX** matching your main website
- ✅ **Responsive Design** for all devices
- ✅ **Dark Mode Support** with theme toggle

**Access your admin dashboard at: `http://localhost:5173/admin`**
