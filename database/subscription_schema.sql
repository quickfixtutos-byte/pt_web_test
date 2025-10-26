-- PathTech Academy Subscription System Database Schema
-- This schema supports user categories, course access, payments, and subscription management

-- User categories table
CREATE TABLE IF NOT EXISTS user_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default user categories
INSERT INTO user_categories (name, description) VALUES
('BAC Lettres', 'Baccalauréat Littéraire'),
('BAC Info', 'Baccalauréat Informatique'),
('BAC Éco', 'Baccalauréat Économique'),
('BAC Sciences', 'Baccalauréat Scientifique'),
('BAC Technique', 'Baccalauréat Technique'),
('Professionnel', 'Utilisateur Professionnel'),
('Étudiant Universitaire', 'Étudiant en Université'),
('Autre', 'Autre catégorie')
ON CONFLICT (name) DO NOTHING;

-- Update students table to include category and subscription info
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES user_categories(id),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'monthly', 'yearly', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Update courses table to include pricing and category restrictions
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS monthly_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS yearly_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_restrictions INTEGER[] DEFAULT '{}', -- Array of category IDs that can access this course
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'TND';

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    plan_type VARCHAR(10) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TND',
    receipt_url TEXT,
    receipt_filename TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course access table (tracks active subscriptions)
CREATE TABLE IF NOT EXISTS course_access (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    plan_type VARCHAR(10) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    payment_id INTEGER REFERENCES payments(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, plan_type)
);

-- Course materials access tracking
CREATE TABLE IF NOT EXISTS course_material_access (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES course_materials(id) ON DELETE CASCADE,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, material_id)
);

-- Subscription analytics view
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    plan_type,
    COUNT(*) as total_subscriptions,
    SUM(amount) as total_revenue,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_payments,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_payments
FROM payments
GROUP BY DATE_TRUNC('month', created_at), plan_type
ORDER BY month DESC, plan_type;

-- Active subscriptions view
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    ca.*,
    s.full_name,
    s.email,
    c.title as course_title,
    c.monthly_price,
    c.yearly_price,
    CASE 
        WHEN ca.end_date < NOW() THEN 'expired'
        WHEN ca.end_date < NOW() + INTERVAL '7 days' THEN 'expiring_soon'
        ELSE 'active'
    END as status
FROM course_access ca
JOIN students s ON ca.user_id = s.user_id
JOIN courses c ON ca.course_id = c.id
WHERE ca.is_active = true;

-- Row Level Security (RLS) Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_material_access ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Course access policies
CREATE POLICY "Users can view their own access" ON course_access
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all access" ON course_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Course material access policies
CREATE POLICY "Users can view their own material access" ON course_material_access
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own material access" ON course_material_access
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for subscription management
CREATE OR REPLACE FUNCTION check_course_access(
    p_user_id UUID,
    p_course_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has active access to the course
    RETURN EXISTS (
        SELECT 1 FROM course_access 
        WHERE user_id = p_user_id 
        AND course_id = p_course_id 
        AND is_active = true 
        AND end_date > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_subscription_status(
    p_user_id UUID
) RETURNS TABLE(
    subscription_status VARCHAR,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.subscription_status,
        s.subscription_start_date,
        s.subscription_end_date,
        CASE 
            WHEN s.subscription_end_date IS NOT NULL 
            THEN EXTRACT(DAY FROM (s.subscription_end_date - NOW()))::INTEGER
            ELSE NULL
        END as days_remaining
    FROM students s
    WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_access_updated_at 
    BEFORE UPDATE ON course_access 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_course_access_user_id ON course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course_id ON course_access(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_end_date ON course_access(end_date);
CREATE INDEX IF NOT EXISTS idx_students_category_id ON students(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_category_restrictions ON courses USING GIN(category_restrictions);
