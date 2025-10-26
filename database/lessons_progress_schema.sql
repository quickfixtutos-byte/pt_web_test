-- Lessons and Progress Tracking Schema for PathTech Academy
-- This extends the existing course system with detailed lesson tracking

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT, -- Rich text content for the lesson
  video_url VARCHAR(500),
  video_duration INTEGER, -- Duration in seconds
  lesson_type VARCHAR(50) DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment', 'reading')),
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT true, -- Some lessons might be premium
  estimated_duration INTEGER DEFAULT 0, -- Estimated time in minutes
  prerequisites TEXT[], -- Array of prerequisite lesson IDs
  learning_objectives TEXT[], -- Array of learning objectives
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped')),
  completion_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  enrollment_id INTEGER REFERENCES course_enrollments(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- Time spent in seconds
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_position INTEGER DEFAULT 0, -- For video lessons, last watched position in seconds
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- Course materials access tracking
CREATE TABLE IF NOT EXISTS course_material_access (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES course_materials(id) ON DELETE CASCADE,
  access_type VARCHAR(20) DEFAULT 'view' CHECK (access_type IN ('view', 'download', 'complete')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent INTEGER DEFAULT 0, -- Time spent in seconds
  completed BOOLEAN DEFAULT false
);

-- Student notifications table
CREATE TABLE IF NOT EXISTS student_notifications (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'enrollment', 'progress', 'new_lesson')),
  is_read BOOLEAN DEFAULT false,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  action_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Course completion certificates
CREATE TABLE IF NOT EXISTS course_certificates (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id INTEGER REFERENCES course_enrollments(id) ON DELETE CASCADE,
  certificate_url VARCHAR(500),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  verification_code VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_material_access_student ON course_material_access(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON student_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON student_notifications(student_id, is_read);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON course_certificates(student_id);

-- RLS Policies for lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published lessons
CREATE POLICY "Anyone can view published lessons" ON lessons
  FOR SELECT USING (is_published = true);

-- Allow enrolled students to view lessons for their courses
CREATE POLICY "Enrolled students can view course lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_enrollments ce
      WHERE ce.student_id = auth.uid()
      AND ce.course_id = lessons.course_id
      AND ce.status = 'active'
    )
  );

-- Allow admins to manage lessons
CREATE POLICY "Admins can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- RLS Policies for course_enrollments
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments" ON course_enrollments
  FOR SELECT USING (student_id = auth.uid());

-- Students can create their own enrollments
CREATE POLICY "Students can enroll in courses" ON course_enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Students can update their own enrollments
CREATE POLICY "Students can update their own enrollments" ON course_enrollments
  FOR UPDATE USING (student_id = auth.uid());

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage enrollments" ON course_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- RLS Policies for lesson_progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Students can view their own progress
CREATE POLICY "Students can view their own progress" ON lesson_progress
  FOR SELECT USING (student_id = auth.uid());

-- Students can update their own progress
CREATE POLICY "Students can update their own progress" ON lesson_progress
  FOR UPDATE USING (student_id = auth.uid());

-- Students can insert their own progress
CREATE POLICY "Students can insert their own progress" ON lesson_progress
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" ON lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- RLS Policies for course_material_access
ALTER TABLE course_material_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own material access" ON course_material_access
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update their own material access" ON course_material_access
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own material access" ON course_material_access
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- RLS Policies for student_notifications
ALTER TABLE student_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own notifications" ON student_notifications
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update their own notifications" ON student_notifications
  FOR UPDATE USING (student_id = auth.uid());

-- RLS Policies for course_certificates
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own certificates" ON course_certificates
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can manage certificates" ON course_certificates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update course completion percentage
CREATE OR REPLACE FUNCTION update_course_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    completion_percentage INTEGER;
BEGIN
    -- Get total lessons for the course
    SELECT COUNT(*) INTO total_lessons
    FROM lessons l
    WHERE l.course_id = (
        SELECT course_id FROM lessons WHERE id = NEW.lesson_id
    ) AND l.is_published = true;

    -- Get completed lessons for this student
    SELECT COUNT(*) INTO completed_lessons
    FROM lesson_progress lp
    JOIN lessons l ON lp.lesson_id = l.id
    WHERE lp.student_id = NEW.student_id
    AND l.course_id = (
        SELECT course_id FROM lessons WHERE id = NEW.lesson_id
    )
    AND lp.status = 'completed';

    -- Calculate completion percentage
    IF total_lessons > 0 THEN
        completion_percentage := (completed_lessons * 100) / total_lessons;
    ELSE
        completion_percentage := 0;
    END IF;

    -- Update enrollment completion percentage
    UPDATE course_enrollments
    SET completion_percentage = completion_percentage,
        updated_at = NOW()
    WHERE student_id = NEW.student_id
    AND course_id = (
        SELECT course_id FROM lessons WHERE id = NEW.lesson_id
    );

    -- If course is completed, update status
    IF completion_percentage = 100 THEN
        UPDATE course_enrollments
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE student_id = NEW.student_id
        AND course_id = (
            SELECT course_id FROM lessons WHERE id = NEW.lesson_id
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update course completion when lesson progress changes
CREATE TRIGGER update_course_completion_trigger
    AFTER UPDATE ON lesson_progress
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_course_completion();

-- Sample data for testing
INSERT INTO lessons (course_id, title, description, content, lesson_type, order_index, estimated_duration, learning_objectives) VALUES
(1, 'Introduction to Excel', 'Learn the basics of Microsoft Excel', 'Excel is a powerful spreadsheet application...', 'video', 1, 30, ARRAY['Understand Excel interface', 'Learn basic navigation', 'Create first spreadsheet']),
(1, 'Basic Formulas', 'Master essential Excel formulas', 'Formulas are the heart of Excel...', 'video', 2, 45, ARRAY['Learn SUM, AVERAGE, COUNT', 'Understand cell references', 'Practice with examples']),
(1, 'Data Formatting', 'Make your spreadsheets look professional', 'Formatting makes data easier to read...', 'video', 3, 25, ARRAY['Apply number formats', 'Use conditional formatting', 'Create charts']),
(2, 'HTML Basics', 'Introduction to HTML structure', 'HTML is the foundation of web development...', 'video', 1, 40, ARRAY['Understand HTML tags', 'Create basic structure', 'Add content']),
(2, 'CSS Styling', 'Style your web pages with CSS', 'CSS makes websites beautiful...', 'video', 2, 50, ARRAY['Learn CSS selectors', 'Apply styles', 'Understand layout']),
(2, 'JavaScript Fundamentals', 'Add interactivity with JavaScript', 'JavaScript brings websites to life...', 'video', 3, 60, ARRAY['Understand variables', 'Learn functions', 'Handle events'])
ON CONFLICT DO NOTHING;
