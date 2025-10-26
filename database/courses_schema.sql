-- Enhanced Courses Table Schema for PathTech Academy
-- This schema supports comprehensive course management

-- Drop existing courses table if it exists
DROP TABLE IF EXISTS courses CASCADE;

-- Create enhanced courses table
CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    category VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    duration_hours INTEGER DEFAULT 0,
    duration_weeks INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    thumbnail_url TEXT,
    video_url TEXT,
    video_type VARCHAR(20) CHECK (video_type IN ('youtube', 'vimeo', 'upload', 'embed')),
    course_materials JSONB DEFAULT '[]'::jsonb, -- Array of material objects
    curriculum JSONB DEFAULT '[]'::jsonb, -- Structured curriculum
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    instructor_id UUID REFERENCES students(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty_level);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_courses_featured ON courses(is_featured);
CREATE INDEX idx_courses_created_at ON courses(created_at);
CREATE INDEX idx_courses_rating ON courses(rating);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create course materials table for better organization
CREATE TABLE course_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size INTEGER,
    is_required BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course curriculum table for structured lessons
CREATE TABLE course_curriculum (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    section_title VARCHAR(255) NOT NULL,
    section_order INTEGER NOT NULL,
    lessons JSONB DEFAULT '[]'::jsonb, -- Array of lesson objects
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course enrollments table
CREATE TABLE course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(course_id, student_id)
);

-- Create course reviews table
CREATE TABLE course_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

-- Create course certificates table
CREATE TABLE course_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    certificate_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true
);

-- Insert sample admin user
INSERT INTO students (user_id, full_name, email, is_admin, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Placeholder UUID
    'PathTech Admin',
    'pathtechacademy@gmail.com',
    true,
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_admin = true,
    updated_at = NOW();

-- Create RLS policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all courses" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.user_id = auth.uid() 
            AND students.is_admin = true
        )
    );

-- Course materials policies
CREATE POLICY "Anyone can view materials for published courses" ON course_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_materials.course_id 
            AND courses.is_published = true
        )
    );

CREATE POLICY "Admins can manage course materials" ON course_materials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.user_id = auth.uid() 
            AND students.is_admin = true
        )
    );

-- Course curriculum policies
CREATE POLICY "Anyone can view curriculum for published courses" ON course_curriculum
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_curriculum.course_id 
            AND courses.is_published = true
        )
    );

CREATE POLICY "Admins can manage course curriculum" ON course_curriculum
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.user_id = auth.uid() 
            AND students.is_admin = true
        )
    );

-- Enrollments policies
CREATE POLICY "Students can view their own enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = course_enrollments.student_id 
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can enroll in courses" ON course_enrollments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = course_enrollments.student_id 
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.user_id = auth.uid() 
            AND students.is_admin = true
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews for published courses" ON course_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_reviews.course_id 
            AND courses.is_published = true
        )
    );

CREATE POLICY "Students can manage their own reviews" ON course_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = course_reviews.student_id 
            AND students.user_id = auth.uid()
        )
    );

-- Certificates policies
CREATE POLICY "Students can view their own certificates" ON course_certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = course_certificates.student_id 
            AND students.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all certificates" ON course_certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.user_id = auth.uid() 
            AND students.is_admin = true
        )
    );

-- Create functions for course statistics
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update enrollment count
    UPDATE courses 
    SET enrollment_count = (
        SELECT COUNT(*) 
        FROM course_enrollments 
        WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
    
    -- Update rating and review count
    UPDATE courses 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM course_reviews 
            WHERE course_id = NEW.course_id
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM course_reviews 
            WHERE course_id = NEW.course_id
        )
    WHERE id = NEW.course_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic stats updates
CREATE TRIGGER update_course_stats_on_enrollment
    AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_stats();

CREATE TRIGGER update_course_stats_on_review
    AFTER INSERT OR UPDATE OR DELETE ON course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_course_stats();

-- Insert sample courses
INSERT INTO courses (
    title, 
    description, 
    short_description,
    category, 
    difficulty_level, 
    duration_hours, 
    price, 
    thumbnail_url,
    video_url,
    video_type,
    is_published,
    is_featured,
    status
) VALUES 
(
    'Introduction to Web Development',
    'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This comprehensive course covers everything from basic syntax to advanced concepts.',
    'Master web development fundamentals with HTML, CSS, and JavaScript',
    'Web Development',
    'Beginner',
    40,
    0.00,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    true,
    true,
    'published'
),
(
    'Advanced React Development',
    'Take your React skills to the next level with advanced patterns, state management, and performance optimization techniques.',
    'Advanced React patterns and performance optimization',
    'Web Development',
    'Advanced',
    60,
    199.99,
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    true,
    false,
    'published'
),
(
    'Data Science with Python',
    'Comprehensive data science course covering Python, pandas, numpy, matplotlib, and machine learning basics.',
    'Complete data science journey with Python and ML',
    'Data Science',
    'Intermediate',
    80,
    149.99,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    true,
    true,
    'published'
);

-- Insert sample course materials
INSERT INTO course_materials (course_id, title, description, file_url, file_type, is_required)
SELECT 
    c.id,
    'Course Syllabus',
    'Complete course syllabus and learning objectives',
    'https://example.com/syllabus.pdf',
    'pdf',
    true
FROM courses c WHERE c.title = 'Introduction to Web Development';

-- Insert sample curriculum
INSERT INTO course_curriculum (course_id, section_title, section_order, lessons)
SELECT 
    c.id,
    'Getting Started',
    1,
    '[
        {"title": "Welcome to the Course", "duration": "5 min", "type": "video"},
        {"title": "Setting up your Development Environment", "duration": "15 min", "type": "tutorial"},
        {"title": "Your First HTML Page", "duration": "20 min", "type": "hands-on"}
    ]'::jsonb
FROM courses c WHERE c.title = 'Introduction to Web Development';

INSERT INTO course_curriculum (course_id, section_title, section_order, lessons)
SELECT 
    c.id,
    'HTML Fundamentals',
    2,
    '[
        {"title": "HTML Structure and Syntax", "duration": "25 min", "type": "video"},
        {"title": "Common HTML Elements", "duration": "30 min", "type": "tutorial"},
        {"title": "Forms and Input Elements", "duration": "20 min", "type": "hands-on"}
    ]'::jsonb
FROM courses c WHERE c.title = 'Introduction to Web Development';
