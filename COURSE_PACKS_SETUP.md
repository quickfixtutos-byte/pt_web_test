# Course Packs Database Setup Guide

## Quick Setup Instructions

To fix the white screen issue and enable course packs functionality, you need to create the required database tables in Supabase.

### Step 1: Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/course_packs_schema.sql`
4. Click **Run** to execute the script

### Step 2: Verify Tables Created

After running the script, you should see these new tables in your **Table Editor**:

- `course_packs` - Main course packs table
- `pack_courses` - Links packs to individual courses  
- `pack_access` - Tracks user access to packs
- `course_materials` - Stores videos, PDFs, exercises
- `material_access` - Tracks user progress through materials

### Step 3: Test the Dashboard

1. Refresh your dashboard page
2. You should now see the "Mes Packs de Cours" section
3. If tables don't exist yet, you'll see a helpful message

### Step 4: Add Sample Data (Optional)

The schema includes sample course packs. If you want to add more:

```sql
INSERT INTO course_packs (title, description, short_description, thumbnail_url, category_id, level, difficulty_level, is_published, is_free, monthly_price, yearly_price, currency) VALUES
('Your Pack Title', 'Description here', 'Short description', 'https://image-url.com', 1, 'Bac', 'Débutant', true, false, 25, 200, 'TND');
```

### Troubleshooting

**If you still see a white screen:**

1. Check browser console for errors (F12 → Console)
2. Verify Supabase connection in `.env` file
3. Ensure RLS policies are enabled
4. Check that user authentication is working

**If no packs appear:**

1. Verify `course_packs` table exists
2. Check if `is_published = true` for packs
3. Ensure user has a `category_id` in the `students` table

### Next Steps

Once the database is set up:

1. **Admin Dashboard**: Add course pack management to admin panel
2. **Course Assignment**: Link existing courses to packs via `pack_courses` table
3. **Material Upload**: Add videos and PDFs to courses via `course_materials` table
4. **Payment Integration**: Test the payment flow for premium packs

The system is designed to gracefully handle missing tables, so the dashboard should work even before running the database script - it will just show an empty state with a helpful message.
