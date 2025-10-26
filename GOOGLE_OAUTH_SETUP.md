# 🔧 Google OAuth Setup Guide

## 🚨 **Error Fix: "Unsupported provider: provider is not enabled"**

This error occurs because Google OAuth is not configured in your Supabase project. Follow these steps to fix it:

## 📋 **Step-by-Step Setup**

### **1. Enable Google Provider in Supabase**

1. **Go to your Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in to your account
   - Select your project

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Click the toggle to enable it
   - You'll see configuration fields appear

### **2. Create Google OAuth Credentials**

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create or Select Project**
   - Click "Select a project" at the top
   - Click "New Project" if you don't have one
   - Name it "PathTech Academy" or similar
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name it "PathTech Academy OAuth"

5. **Configure Authorized Redirect URIs**
   Add these URIs (replace `your-project-ref` with your actual Supabase project reference):
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:5173
   https://yourdomain.com (for production)
   ```

6. **Get Your Credentials**
   - Copy the "Client ID"
   - Copy the "Client Secret"

### **3. Configure Supabase with Google Credentials**

1. **Back in Supabase Dashboard**
   - Go to Authentication > Providers > Google
   - Paste your Google Client ID
   - Paste your Google Client Secret
   - Click "Save"

2. **Test the Configuration**
   - The Google provider should now show as "Enabled"
   - You can test it by clicking "Test" button

### **4. Update Your Environment Variables**

1. **Create/Update your `.env` file:**
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

2. **Restart your development server:**
   ```bash
   npm run dev
   ```

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: "Redirect URI mismatch"**
**Solution:** Make sure your redirect URIs in Google Console match exactly:
- `https://your-project-ref.supabase.co/auth/v1/callback`
- No trailing slashes
- Use HTTPS for production

### **Issue 2: "Invalid client"**
**Solution:** 
- Double-check your Client ID and Secret
- Make sure they're copied correctly (no extra spaces)
- Verify the OAuth consent screen is configured

### **Issue 3: "Access blocked"**
**Solution:**
- Go to Google Console > OAuth consent screen
- Make sure the app is published or add test users
- Configure the consent screen with your app details

### **Issue 4: Still getting "provider is not enabled"**
**Solution:**
- Clear your browser cache
- Restart your development server
- Check Supabase dashboard to ensure Google is enabled
- Verify your Supabase URL and anon key are correct

## 🧪 **Testing the Setup**

1. **Test Email/Password Login**
   - Try registering a new account
   - Try logging in with existing account

2. **Test Google OAuth**
   - Click "Sign in with Google"
   - You should be redirected to Google
   - After authorization, you should be redirected back
   - Check if user is created in Supabase Auth

3. **Check Database**
   - Go to Supabase > Authentication > Users
   - You should see new users created
   - Check if student profiles are created automatically

## 🔧 **Advanced Configuration**

### **Custom OAuth Scopes**
If you need additional Google permissions, you can modify the OAuth configuration in your AuthContext:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}`,
    scopes: 'openid email profile', // Add custom scopes here
  },
});
```

### **Production Configuration**
For production deployment:

1. **Update redirect URIs in Google Console:**
   ```
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```

2. **Update Supabase settings:**
   - Go to Authentication > URL Configuration
   - Add your production domain to "Site URL"
   - Add redirect URLs for production

## 📞 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the browser console** for detailed error messages
2. **Check the Supabase logs** in the dashboard
3. **Verify your environment variables** are loaded correctly
4. **Test with a fresh browser session** (incognito mode)

## ✅ **Success Indicators**

You'll know the setup is working when:
- ✅ Google provider shows as "Enabled" in Supabase
- ✅ Clicking "Sign in with Google" redirects to Google
- ✅ After Google authorization, you're redirected back to your app
- ✅ New users appear in Supabase Authentication > Users
- ✅ Student profiles are created automatically
- ✅ Users can access the dashboard after Google sign-in

---

**🎉 Once configured, your users will be able to sign in with Google seamlessly!**
