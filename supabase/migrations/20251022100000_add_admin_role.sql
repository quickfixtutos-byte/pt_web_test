/*
  # Add Admin Role Support

  1. Modifications
    - Add `is_admin` column to students table for role management
    - Update RLS policies to allow admins full access
    - Add policies for admin operations on courses

  2. Security
    - Admins can manage all data
    - Regular users can only access their own data
    - Public can view published courses

  3. Important Notes
    - Default is_admin is false for security
    - Only explicit admin assignment grants admin privileges
*/

-- Add is_admin column to students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE students ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Drop existing policies for courses to recreate with admin support
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;

-- Recreate courses policies with admin support
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

-- Add policy for admins to view all student data
CREATE POLICY "Admins can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.user_id = auth.uid()
      AND s.is_admin = true
    )
  );

-- Add policy for admins to view all enrollments
CREATE POLICY "Admins can view all enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

-- Add policy for admins to manage resources
CREATE POLICY "Admins can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

CREATE POLICY "Admins can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

CREATE POLICY "Admins can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

-- Add policy for admins to manage certificates
CREATE POLICY "Admins can insert certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

CREATE POLICY "Admins can view all certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = certificates.student_id
      AND students.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

-- Add policy for admins to manage notifications
CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = notifications.student_id
      AND students.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.is_admin = true
    )
  );
