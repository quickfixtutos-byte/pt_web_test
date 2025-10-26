# 🧪 Authentication Testing Guide

## ✅ **Quick Test Checklist**

### **1. Environment Setup Test**
```bash
# Check if your .env file has the required variables
cat .env | grep VITE_SUPABASE
```

**Expected output:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### **2. Supabase Connection Test**
1. **Open browser console** (F12)
2. **Go to your app** (http://localhost:5173)
3. **Check for errors** in the console
4. **Look for Supabase connection messages**

### **3. Email/Password Authentication Test**

#### **Test Registration:**
1. Go to `/register` page
2. Fill in the form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"
4. **Expected:** Success message and redirect to dashboard

#### **Test Login:**
1. Go to `/login` page
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign In"
4. **Expected:** Redirect to dashboard

### **4. Google OAuth Test**

#### **Before Testing:**
1. **Follow the Google OAuth setup guide** (`GOOGLE_OAUTH_SETUP.md`)
2. **Ensure Google provider is enabled** in Supabase
3. **Verify redirect URIs** are configured correctly

#### **Test Google Sign-In:**
1. Click "Sign in with Google" button
2. **Expected:** Redirect to Google OAuth page
3. **Complete Google authorization**
4. **Expected:** Redirect back to your app
5. **Expected:** User created in Supabase Auth

### **5. Error Handling Test**

#### **Test Invalid Credentials:**
1. Try logging in with wrong password
2. **Expected:** Error message displayed
3. **Expected:** Form remains on login page

#### **Test Google OAuth Errors:**
1. If Google OAuth is not configured:
   - **Expected:** "Google login is not configured" message
2. If Google OAuth fails:
   - **Expected:** "Google sign-in failed" message

### **6. Database Verification**

#### **Check Supabase Dashboard:**
1. Go to **Authentication > Users**
2. **Expected:** See test users created
3. Go to **Table Editor > students**
4. **Expected:** See student profiles created automatically

#### **Check User Roles:**
1. In **students** table, verify:
   - `is_admin` is `false` for regular users
   - `full_name` matches registration data
   - `email` matches registration data

### **7. Protected Routes Test**

#### **Test Student Dashboard:**
1. Login as regular user
2. Navigate to dashboard
3. **Expected:** Access granted to student dashboard
4. **Expected:** No admin features visible

#### **Test Admin Access:**
1. **Manually set admin role** in Supabase:
   ```sql
   UPDATE students SET is_admin = true WHERE email = 'your-email@example.com';
   ```
2. Login with that account
3. Navigate to admin panel
4. **Expected:** Access granted to admin features

### **8. Logout Test**
1. Click logout button
2. **Expected:** Redirect to home page
3. **Expected:** Cannot access protected routes
4. **Expected:** Login required message

## 🐛 **Common Issues & Solutions**

### **Issue: "Invalid login credentials"**
**Solutions:**
- Check if user exists in Supabase Auth
- Verify email/password are correct
- Check Supabase logs for detailed errors

### **Issue: "Google OAuth not working"**
**Solutions:**
- Follow `GOOGLE_OAUTH_SETUP.md` guide
- Check redirect URIs in Google Console
- Verify Google provider is enabled in Supabase
- Clear browser cache and try again

### **Issue: "User not created in students table"**
**Solutions:**
- Check if RLS policies are correct
- Verify the signup function creates student profile
- Check Supabase logs for errors

### **Issue: "Cannot access dashboard"**
**Solutions:**
- Check if user is authenticated
- Verify ProtectedRoute component is working
- Check if user has student profile

## 📊 **Success Indicators**

### **✅ Authentication Working When:**
- Users can register with email/password
- Users can login with email/password
- Google OAuth redirects and creates users
- Users can access their dashboard
- Users are logged out properly
- Error messages are displayed clearly
- Student profiles are created automatically

### **✅ Security Working When:**
- Unauthenticated users cannot access protected routes
- Admin-only features are hidden from regular users
- Passwords are validated (minimum 6 characters)
- Email format is validated
- Input is sanitized properly

## 🔧 **Debug Commands**

### **Check Environment Variables:**
```bash
# In your terminal
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### **Check Supabase Connection:**
```javascript
// In browser console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### **Test Supabase Connection:**
```javascript
// In browser console
import { supabase } from './src/lib/supabase';
supabase.auth.getSession().then(console.log);
```

## 📞 **Need Help?**

If you're still having issues:

1. **Check the browser console** for error messages
2. **Check Supabase logs** in the dashboard
3. **Verify your environment variables** are loaded
4. **Test with a fresh browser session**
5. **Follow the setup guides** step by step

---

**🎉 Once all tests pass, your authentication system is working perfectly!**
