-- Course Packs Schema for PathTech Academy
-- This extends the existing subscription system with course packs

-- Course Packs table
CREATE TABLE IF NOT EXISTS course_packs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  thumbnail_url VARCHAR(500),
  category_id INTEGER REFERENCES user_categories(id),
  level VARCHAR(50) DEFAULT 'Bac',
  difficulty_level VARCHAR(50) DEFAULT 'Débutant',
  is_published BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT false,
  monthly_price DECIMAL(10,2) DEFAULT 0,
  yearly_price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'TND',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pack-Course relationship table
CREATE TABLE IF NOT EXISTS pack_courses (
  id SERIAL PRIMARY KEY,
  pack_id INTEGER REFERENCES course_packs(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pack_id, course_id)
);

-- Course Pack Access table (similar to course_access but for packs)
CREATE TABLE IF NOT EXISTS pack_access (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id INTEGER REFERENCES course_packs(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) CHECK (plan_type IN ('monthly', 'yearly')),
  payment_id INTEGER REFERENCES payments(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pack_id)
);

-- Course Materials table (for videos, PDFs, etc.)
CREATE TABLE IF NOT EXISTS course_materials (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('video', 'pdf', 'document', 'exercise', 'quiz', 'link')),
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size INTEGER,
  duration_minutes INTEGER, -- for videos
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Access tracking
CREATE TABLE IF NOT EXISTS material_access (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES course_materials(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_packs_category ON course_packs(category_id);
CREATE INDEX IF NOT EXISTS idx_course_packs_published ON course_packs(is_published);
CREATE INDEX IF NOT EXISTS idx_pack_courses_pack ON pack_courses(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_courses_course ON pack_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_pack_access_user ON pack_access(user_id);
CREATE INDEX IF NOT EXISTS idx_pack_access_pack ON pack_access(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_access_active ON pack_access(is_active);
CREATE INDEX IF NOT EXISTS idx_course_materials_course ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_material_access_user ON material_access(user_id);

-- RLS Policies for course_packs
ALTER TABLE course_packs ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published course packs
CREATE POLICY "Anyone can view published course packs" ON course_packs
  FOR SELECT USING (is_published = true);

-- Allow admins to manage course packs
CREATE POLICY "Admins can manage course packs" ON course_packs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- RLS Policies for pack_courses
ALTER TABLE pack_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pack courses" ON pack_courses
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pack courses" ON pack_courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- RLS Policies for pack_access
ALTER TABLE pack_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pack access" ON pack_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage pack access" ON pack_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- RLS Policies for course_materials
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published course materials" ON course_materials
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage course materials" ON course_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- RLS Policies for material_access
ALTER TABLE material_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own material access" ON material_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own material access" ON material_access
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own material access" ON material_access
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_course_packs_updated_at BEFORE UPDATE ON course_packs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pack_courses_updated_at BEFORE UPDATE ON pack_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pack_access_updated_at BEFORE UPDATE ON pack_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_materials_updated_at BEFORE UPDATE ON course_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO course_packs (title, description, short_description, thumbnail_url, category_id, level, difficulty_level, is_published, is_free, monthly_price, yearly_price, currency) VALUES
('Pack Bureautique BAC Lettres', 'Pack complet de formation bureautique pour les étudiants en BAC Lettres. Inclut Excel, Word, PowerPoint et les outils de productivité essentiels.', 'Formation bureautique complète', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=500', 1, 'Bac', 'Débutant', true, false, 30, 250, 'TND'),
('Pack Informatique BAC Info', 'Pack avancé de programmation et développement web pour les étudiants en BAC Info. Inclut HTML, CSS, JavaScript, Python et bases de données.', 'Programmation et développement web', 'https://images.unsplash.com/photo-1461749280684-dccba6e2f0d6?w=500', 2, 'Bac', 'Intermédiaire', true, false, 40, 350, 'TND'),
('Pack Mathématiques BAC Sciences', 'Pack complet de mathématiques pour BAC Sciences. Algèbre, géométrie, probabilités, statistiques avec exercices pratiques et corrigés.', 'Mathématiques complètes pour BAC Sciences', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500', 4, 'Bac', 'Intermédiaire', true, true, 0, 0, 'TND'),
('Pack Économie BAC Éco', 'Formation complète en économie et gestion pour BAC Éco. Microéconomie, macroéconomie, comptabilité et gestion d\'entreprise.', 'Économie et gestion d\'entreprise', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500', 3, 'Bac', 'Intermédiaire', true, false, 25, 200, 'TND')
ON CONFLICT DO NOTHING;
