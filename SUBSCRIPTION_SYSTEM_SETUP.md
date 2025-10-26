# PathTech Academy Subscription System Setup Guide

This guide will help you set up the complete subscription-based access system for PathTech Academy.

## 🚀 **System Overview**

The subscription system includes:
- **User Categories**: BAC Lettres, BAC Info, BAC Éco, etc.
- **Course Access Model**: Free courses + Paid courses with monthly/yearly plans
- **Payment Flow**: Receipt upload with manual approval
- **Admin Dashboard**: Payment management and analytics
- **Access Control**: Automatic expiration handling
- **Frontend Integration**: Course filtering and subscription UI

## 📋 **Prerequisites**

1. **Supabase Project** with Auth enabled
2. **Google OAuth** configured (optional)
3. **Environment Variables** set up
4. **Admin User** created

## 🗄️ **Database Setup**

### Step 1: Run Database Schema

Execute the SQL scripts in your Supabase SQL Editor:

```sql
-- 1. Run the main subscription schema
-- Copy and paste the content from database/subscription_schema.sql

-- 2. Set up storage for receipts
-- Copy and paste the content from database/storage_setup.sql
```

### Step 2: Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `receipts`
3. Set it as **Private**
4. Configure the bucket with:
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/jpg, application/pdf`

### Step 3: Set Up Admin User

```sql
-- Insert admin user into students table
INSERT INTO students (
    user_id,
    full_name,
    email,
    is_admin,
    subscription_status,
    created_at,
    updated_at
) VALUES (
    'YOUR_ADMIN_USER_ID_HERE', -- Get this from Supabase Auth
    'PathTech Admin',
    'pathtechacademy@gmail.com',
    true,
    'free',
    NOW(),
    NOW()
);
```

## 🔧 **Environment Variables**

Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# App Configuration
VITE_APP_NAME=PathTech Academy
VITE_APP_URL=http://localhost:5173
```

## 🎯 **Features Implementation**

### 1. User Categories During Signup

Users now select their category during registration:
- BAC Lettres
- BAC Info  
- BAC Éco
- BAC Sciences
- BAC Technique
- Professionnel
- Étudiant Universitaire
- Autre

### 2. Course Access Model

**Free Courses**: Accessible to everyone after login
**Paid Courses**: Two subscription plans:
- **Monthly**: 20 TND for 30 days
- **Yearly**: 200 TND for 365 days

### 3. Payment Flow

1. User selects subscription plan
2. Gets payment instructions (Post Office or Bank Transfer)
3. Uploads receipt image/PDF
4. Admin reviews and approves/rejects
5. Access is granted upon approval

### 4. Admin Dashboard Features

**Payment Management**:
- View all pending payments
- Approve/reject payments with notes
- View receipt images
- Track payment history

**Analytics Dashboard**:
- Total monthly/yearly subscriptions
- Active users count
- Revenue tracking
- Expiring subscriptions
- Pending payments count

### 5. Access Control System

**Automatic Features**:
- Expiration checking
- Access validation
- Subscription status updates
- Expiration reminders

**Frontend Integration**:
- Course filtering by access type
- Subscription status badges
- Payment flow modals
- Access denied screens

## 🔐 **Security Features**

1. **Row Level Security (RLS)** enabled on all tables
2. **Admin-only access** to payment management
3. **Input validation** on all forms
4. **File upload restrictions** (5MB, specific formats)
5. **Token validation** on protected routes

## 📱 **Frontend Components**

### New Components Created:

1. **SubscriptionPlans.tsx** - Plan selection and pricing
2. **PaymentFlow.tsx** - Complete payment process
3. **CourseAccessControl.tsx** - Access validation
4. **AccessDenied.tsx** - Access restriction screens
5. **PaymentManagement.tsx** - Admin payment interface
6. **SubscriptionAnalytics.tsx** - Analytics dashboard

### Updated Components:

1. **RegisterPage.tsx** - Added category selection
2. **CoursesPage.tsx** - Added subscription filtering
3. **AdminDashboard.tsx** - Added payment and analytics sections

## 🎨 **UI/UX Features**

- **Responsive Design**: Works on all devices
- **Dark Mode Support**: Integrated with existing theme
- **Loading States**: Smooth user experience
- **Toast Notifications**: Success/error feedback
- **Progress Indicators**: Payment flow steps
- **Status Badges**: Clear subscription status

## 📊 **Analytics & Monitoring**

### Key Metrics Tracked:
- Total subscriptions (monthly/yearly)
- Active users
- Revenue generated
- Expiring subscriptions
- Pending payments
- User categories distribution

### Admin Notifications:
- Expiring subscriptions (7 days before)
- New payment requests
- Failed payment attempts
- System errors

## 🚀 **Deployment Checklist**

### Before Going Live:

1. **Database Setup**:
   - [ ] Run all SQL scripts
   - [ ] Create storage bucket
   - [ ] Set up admin user
   - [ ] Test RLS policies

2. **Environment Variables**:
   - [ ] Set production Supabase URL
   - [ ] Configure Google OAuth
   - [ ] Set correct app URL

3. **Testing**:
   - [ ] Test user registration with categories
   - [ ] Test payment flow
   - [ ] Test admin approval process
   - [ ] Test access control
   - [ ] Test expiration handling

4. **Security**:
   - [ ] Verify RLS policies
   - [ ] Test admin-only access
   - [ ] Validate file uploads
   - [ ] Check input sanitization

## 🔄 **Maintenance Tasks**

### Daily:
- Check for expired subscriptions
- Review pending payments
- Monitor system errors

### Weekly:
- Send expiration reminders
- Review analytics
- Update course pricing if needed

### Monthly:
- Generate revenue reports
- Analyze user engagement
- Review subscription trends

## 🆘 **Troubleshooting**

### Common Issues:

1. **Payment Not Showing**: Check if user uploaded receipt
2. **Access Denied**: Verify subscription status and expiration
3. **Admin Login Issues**: Ensure admin user exists in database
4. **File Upload Fails**: Check file size and format
5. **Analytics Not Loading**: Verify database permissions

### Support:

For technical issues, check:
1. Browser console for errors
2. Supabase logs
3. Network requests
4. Database queries

## 📈 **Future Enhancements**

Potential improvements:
- **Automated Payment Processing** (Stripe, PayPal)
- **Email Notifications** (SendGrid, AWS SES)
- **Advanced Analytics** (Charts, Reports)
- **Mobile App** (React Native)
- **Multi-language Support**
- **Gift Subscriptions**
- **Corporate Accounts**

## 🎉 **Success Metrics**

Track these KPIs:
- **Conversion Rate**: Free to paid users
- **Retention Rate**: Monthly/yearly renewals
- **Revenue Growth**: Month-over-month
- **User Satisfaction**: Course completion rates
- **Admin Efficiency**: Payment processing time

---

**🎯 Your subscription system is now ready!** 

Users can register with categories, subscribe to courses, upload payment receipts, and admins can manage everything from the dashboard. The system automatically handles access control, expiration, and provides comprehensive analytics.

For any questions or issues, refer to the troubleshooting section or check the component documentation.
