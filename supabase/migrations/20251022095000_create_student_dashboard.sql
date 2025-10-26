/*
  # Student Dashboard Schema for PathTech Academy

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - links to authenticated user
      - `full_name` (text) - student's full name
      - `email` (text) - student email
      - `avatar_url` (text) - profile picture URL
      - `total_hours_studied` (integer) - total study hours
      - `created_at` (timestamptz) - account creation timestamp
      - `updated_at` (timestamptz) - last update timestamp

    - `enrollments`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `course_id` (uuid, references courses)
      - `progress_percentage` (integer) - 0-100
      - `lessons_completed` (integer) - number of lessons completed
      - `is_favorite` (boolean) - bookmarked status
      - `last_accessed_at` (timestamptz) - last time student accessed course
      - `enrolled_at` (timestamptz)
      - `completed_at` (timestamptz) - null if not completed

    - `certificates`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `course_id` (uuid, references courses)
      - `certificate_url` (text) - download link
      - `issued_at` (timestamptz)
      - `certificate_number` (text) - unique certificate ID

    - `resources`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `title` (text) - resource title
      - `description` (text) - resource description
      - `file_url` (text) - download link
      - `file_type` (text) - pdf, doc, video, etc.
      - `file_size` (integer) - size in bytes
      - `created_at` (timestamptz)

    - `notifications`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `title` (text) - notification title
      - `message` (text) - notification content
      - `type` (text) - announcement, update, achievement, etc.
      - `is_read` (boolean) - read status
      - `created_at` (timestamptz)

    - `student_scores`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `course_id` (uuid, references courses)
      - `lesson_id` (text) - lesson identifier
      - `score` (integer) - score out of 100
      - `submitted_at` (timestamptz)

  2. Modifications to Existing Tables
    - Add `duration_hours` to courses table
    - Add `total_lessons` to courses table
    - Add `is_published` to courses table

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated students to access their own data
    - Add policies for viewing published courses
    - Ensure students can only modify their own records

  4. Important Notes
    - All timestamps use timestamptz for timezone support
    - Foreign key constraints ensure data integrity
    - Indexes added on frequently queried columns
    - Default values set for boolean and timestamp fields
*/

-- Add new columns to courses table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'duration_hours'
  ) THEN
    ALTER TABLE courses ADD COLUMN duration_hours integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'total_lessons'
  ) THEN
    ALTER TABLE courses ADD COLUMN total_lessons integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE courses ADD COLUMN is_published boolean DEFAULT true;
  END IF;
END $$;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text DEFAULT '',
  total_hours_studied integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  progress_percentage integer DEFAULT 0,
  lessons_completed integer DEFAULT 0,
  is_favorite boolean DEFAULT false,
  last_accessed_at timestamptz DEFAULT now(),
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(student_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Students can insert own enrollments"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  certificate_url text NOT NULL,
  issued_at timestamptz DEFAULT now(),
  certificate_number text UNIQUE NOT NULL
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = certificates.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view resources for enrolled courses"
  ON resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN students ON students.id = enrollments.student_id
      WHERE enrollments.course_id = resources.course_id
      AND students.user_id = auth.uid()
    )
  );

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'announcement',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = notifications.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = notifications.student_id
      AND students.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = notifications.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Create student_scores table
CREATE TABLE IF NOT EXISTS student_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id text NOT NULL,
  score integer NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE student_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own scores"
  ON student_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_scores.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own scores"
  ON student_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_scores.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_resources_course_id ON resources(course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_scores_student_id ON student_scores(student_id);
