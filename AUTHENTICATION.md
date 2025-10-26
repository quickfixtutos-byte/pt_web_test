# PathTech Academy - Authentication System Documentation

## Overview

PathTech Academy uses **Supabase Auth** for a complete, secure authentication system with JWT-based token validation, role-based access control, and protected routes.

## Features

### ✅ Authentication Methods
- **Email/Password Authentication** - Traditional sign-up and login
- **Google OAuth** - Social login integration (ready to configure)
- **Password Reset** - Secure password recovery via email
- **Email Verification** - Optional account verification

### ✅ Security Features
- JWT token-based authentication
- Automatic token refresh
- Row Level Security (RLS) policies in database
- Protected routes with middleware
- Admin role management
- Secure session management

### ✅ User Flows
- Sign Up → Create account → Auto-login → Dashboard
- Sign In → Authenticate → Dashboard
- Forgot Password → Email link → Reset password
- Google Sign-In → OAuth flow → Dashboard

---

## Getting Started

### 1. Environment Variables

The `.env` file already contains your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

Three migrations are included:

1. **`create_pathtech_schema.sql`** - Base tables (courses, instructors, testimonials)
2. **`create_student_dashboard.sql`** - Student dashboard tables (students, enrollments, certificates, etc.)
3. **`add_admin_role.sql`** - Admin role management and RLS policies

These migrations are automatically applied to your Supabase database.

### 3. Google OAuth Setup (Optional)

To enable Google sign-in:

1. Go to your Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials (Client ID & Secret)
4. Add authorized redirect URL: `http://localhost:5173` (development) or your production URL

---

## User Roles

### Student (Default)
- Access to personal dashboard
- View enrolled courses
- Track progress
- Download resources
- View certificates

### Admin
- Full student access PLUS:
- Manage all courses (add, edit, delete)
- View all students
- Manage resources
- Issue certificates
- Platform settings

### Making a User Admin

To grant admin access to a user:

```sql
UPDATE students
SET is_admin = true
WHERE email = 'admin@example.com';
```

---

## Authentication Flow

### Sign Up Process
1. User fills registration form (name, email, password)
2. System creates auth user in Supabase
3. System creates student profile linked to auth user
4. User is automatically logged in
5. Redirect to dashboard

### Sign In Process
1. User enters email and password
2. Supabase validates credentials
3. JWT token is generated and stored
4. Session is created
5. User role is checked (student/admin)
6. Redirect to appropriate dashboard

### Protected Routes
All protected pages use the `<ProtectedRoute>` component:

```tsx
<ProtectedRoute onUnauthorized={() => navigate('login')}>
  <StudentDashboardPage />
</ProtectedRoute>

// For admin-only pages:
<ProtectedRoute requireAdmin={true} onUnauthorized={() => navigate('login')}>
  <AdminDashboardPage />
</ProtectedRoute>
```

---

## API Integration

### Using Auth Context

The auth context provides all authentication methods:

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAdmin, signIn, signOut } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return <p>Please sign in</p>;
  }

  // Check if user is admin
  if (isAdmin) {
    return <AdminPanel />;
  }

  return <StudentDashboard />;
}
```

### Available Auth Methods

```tsx
const {
  user,              // Current user object
  session,           // Current session
  loading,           // Auth state loading
  isAdmin,           // Is user an admin?
  signUp,            // Create new account
  signIn,            // Sign in with email/password
  signInWithGoogle,  // Sign in with Google
  signOut,           // Sign out
  resetPassword,     // Send password reset email
  updatePassword,    // Update user password
} = useAuth();
```

---

## Database Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

1. **Students** can only access their own data
2. **Admins** can access all data
3. **Anonymous users** can only view published courses
4. **Authenticated users** can view their enrollments, certificates, etc.

### Example Policy

```sql
-- Students can view own enrollments
CREATE POLICY "Students can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.user_id = auth.uid()
    )
  );
```

### Token Validation

- Every API call includes the JWT token in headers
- Supabase automatically validates tokens
- Expired tokens trigger automatic refresh
- Invalid tokens return 401 Unauthorized

---

## Pages & Routes

### Public Pages
- `/` - Home
- `/courses` - Browse courses
- `/instructors` - View instructors
- `/about` - About PathTech
- `/contact` - Contact form
- `/login` - Sign in
- `/register` - Sign up
- `/forgot-password` - Password recovery

### Protected Pages (Authentication Required)
- `/dashboard` - Student dashboard
- `/reset-password` - Password reset (with token)

### Admin-Only Pages
- `/admin` - Admin panel
  - Overview with statistics
  - Course management (CRUD operations)
  - Student management
  - Platform settings

---

## Frontend-Backend Connection

### Course Management Flow

**Admin adds/edits course:**
1. Admin logs in (verified via JWT)
2. Accesses admin panel
3. Creates/updates course in database
4. RLS policies verify admin role
5. Course is saved with `is_published` flag

**Student views courses:**
1. Public courses page fetches published courses
2. RLS policy filters by `is_published = true`
3. Courses display automatically
4. No admin courses shown to non-admins

**Student enrolls in course:**
1. Student clicks enroll button
2. System checks authentication
3. Creates enrollment record
4. Links student_id to course_id
5. Dashboard reflects new enrollment

### Data Synchronization

- All data stored in single Supabase database
- Real-time subscriptions available (optional)
- Admin changes immediately visible on frontend
- Student enrollments sync across dashboard and admin panel

---

## Security Best Practices

### ✅ Implemented

1. **Environment Variables**
   - All sensitive keys in `.env`
   - Never committed to git
   - Validated on startup

2. **Input Validation**
   - All forms validated client-side
   - Database constraints enforce server-side validation
   - SQL injection prevented by Supabase

3. **Password Security**
   - Minimum 6 characters (configurable)
   - Hashed by Supabase (bcrypt)
   - Never stored in plain text

4. **Token Security**
   - JWT tokens with expiration
   - Automatic refresh
   - Secure HttpOnly cookies (Supabase default)

5. **RLS Policies**
   - All tables protected
   - User-specific data isolation
   - Admin-only operations

6. **Error Handling**
   - User-friendly error messages
   - Sensitive errors not exposed
   - Toast notifications for feedback

---

## Notifications

The app uses `react-hot-toast` for user feedback:

```tsx
import toast from 'react-hot-toast';

toast.success('Signed in successfully!');
toast.error('Invalid credentials');
toast.loading('Signing in...');
```

---

## Testing Authentication

### Create Test Accounts

1. **Student Account:**
   - Navigate to `/register`
   - Sign up with email/password
   - Access student dashboard

2. **Admin Account:**
   - Create a student account first
   - Run SQL to grant admin:
     ```sql
     UPDATE students SET is_admin = true WHERE email = 'your@email.com';
     ```
   - Sign out and sign in again
   - Access admin panel via header menu

### Test Flows

✅ **Sign Up** → Should create account and redirect to dashboard
✅ **Sign In** → Should authenticate and redirect to dashboard
✅ **Sign Out** → Should clear session and redirect to home
✅ **Forgot Password** → Should send reset email
✅ **Reset Password** → Should update password
✅ **Protected Route** → Should redirect to login if not authenticated
✅ **Admin Route** → Should show error if not admin
✅ **Course Management** → Admins can CRUD courses
✅ **Course Display** → Public can view published courses

---

## Deployment Checklist

Before deploying to production:

- [ ] Update `.env` with production Supabase credentials
- [ ] Configure Google OAuth redirect URLs for production domain
- [ ] Enable email verification in Supabase (optional)
- [ ] Set up custom email templates (optional)
- [ ] Configure rate limiting in Supabase
- [ ] Set up monitoring and error tracking
- [ ] Test all authentication flows in production
- [ ] Verify RLS policies are working correctly

---

## Troubleshooting

### Common Issues

**Issue:** Google Sign-In not working
- **Solution:** Check OAuth credentials in Supabase dashboard, verify redirect URLs

**Issue:** "Invalid credentials" on sign-in
- **Solution:** Verify email/password, check if account exists, ensure Supabase is running

**Issue:** Can't access admin panel
- **Solution:** Verify `is_admin = true` in database for your user

**Issue:** Protected routes not working
- **Solution:** Clear browser storage, sign out and sign in again

**Issue:** Token expired errors
- **Solution:** Supabase should auto-refresh, check network tab for refresh requests

---

## Support

For issues or questions:
- Check Supabase Dashboard → Authentication logs
- Review browser console for errors
- Check network tab for failed API calls
- Verify database RLS policies in Supabase Dashboard

---

## Future Enhancements

Potential additions:
- [ ] Two-factor authentication (2FA)
- [ ] Social login with more providers (Facebook, GitHub)
- [ ] Remember me functionality
- [ ] Session timeout warnings
- [ ] Login history tracking
- [ ] Email change with verification
- [ ] Account deletion
- [ ] Dark mode toggle

---

**PathTech Academy** - Secure, scalable authentication powered by Supabase 🚀
