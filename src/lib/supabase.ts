import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

export interface Course {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  level: string;
  category: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail_url: string;
  video_url?: string;
  video_type?: 'youtube' | 'vimeo' | 'upload' | 'embed';
  youtube_playlist_url?: string;
  price: number;
  duration_hours: number;
  duration_weeks?: number;
  total_lessons: number;
  is_published: boolean;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  instructor_id?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  view_count: number;
  enrollment_count: number;
  rating: number;
  review_count: number;
  course_materials?: CourseMaterial[];
  curriculum?: CourseCurriculum[];
  // Subscription system fields
  is_free: boolean;
  monthly_price: number;
  yearly_price: number;
  category_restrictions: number[];
  currency: string;
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  is_required: boolean;
  download_count: number;
  created_at: string;
}

export interface CourseCurriculum {
  id: string;
  course_id: string;
  section_title: string;
  section_order: number;
  lessons: CourseLesson[];
  is_preview: boolean;
  created_at: string;
}

export interface CourseLesson {
  title: string;
  duration: string;
  type: 'video' | 'tutorial' | 'hands-on' | 'quiz' | 'assignment';
  description?: string;
  video_url?: string;
  materials?: string[];
  is_completed?: boolean;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  last_accessed_at?: string;
  is_active: boolean;
  course?: Course;
}

export interface CourseReview {
  id: string;
  course_id: string;
  student_id: string;
  rating: number;
  review_text?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  student?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CourseCertificate {
  id: string;
  course_id: string;
  student_id: string;
  certificate_url?: string;
  issued_at: string;
  is_valid: boolean;
  course?: Course;
}

export interface Instructor {
  id: string;
  name: string;
  expertise: string;
  photo_url: string;
  bio?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  student_name: string;
  content: string;
  rating: number;
  created_at: string;
}

// Subscription System Interfaces
export interface UserCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Student {
  id: number;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  bio?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  // Subscription fields
  category_id?: number;
  subscription_status: 'free' | 'monthly' | 'yearly' | 'expired';
  subscription_start_date?: string;
  subscription_end_date?: string;
  category?: UserCategory;
}

export interface Payment {
  id: number;
  user_id: string;
  course_id: number;
  plan_type: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  receipt_url?: string;
  receipt_filename?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  user?: Student;
}

export interface CourseAccess {
  id: number;
  user_id: string;
  course_id: number;
  plan_type: 'monthly' | 'yearly';
  payment_id?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
  user?: Student;
  payment?: Payment;
}

export interface CourseMaterialAccess {
  id: number;
  user_id: string;
  course_id: number;
  material_id?: number;
  accessed_at: string;
}

export interface SubscriptionAnalytics {
  month: string;
  plan_type: 'monthly' | 'yearly';
  total_subscriptions: number;
  total_revenue: number;
  approved_payments: number;
  pending_payments: number;
  rejected_payments: number;
}

export interface ActiveSubscription {
  id: number;
  user_id: string;
  course_id: number;
  plan_type: 'monthly' | 'yearly';
  payment_id?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  course_title: string;
  monthly_price: number;
  yearly_price: number;
  status: 'active' | 'expiring_soon' | 'expired';
}

// Course Pack interfaces
export interface CoursePack {
  id: number;
  title: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  category_id?: number;
  level: string;
  difficulty_level: string;
  is_published: boolean;
  is_free: boolean;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
  category?: UserCategory;
  courses?: Course[];
  courses_count?: number;
}

export interface PackCourse {
  id: number;
  pack_id: number;
  course_id: number;
  order_index: number;
  created_at: string;
  course?: Course;
}

export interface PackAccess {
  id: number;
  user_id: string;
  pack_id: number;
  plan_type: 'monthly' | 'yearly';
  payment_id?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pack?: CoursePack;
  user?: Student;
  payment?: Payment;
}

export interface CourseMaterial {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  material_type: 'video' | 'pdf' | 'document' | 'exercise' | 'quiz' | 'link';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  duration_minutes?: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface MaterialAccess {
  id: number;
  user_id: string;
  material_id: number;
  accessed_at: string;
  progress_percentage: number;
  completed: boolean;
  material?: CourseMaterial;
}

// Lesson and Progress Tracking interfaces
export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  video_duration?: number;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'reading';
  order_index: number;
  is_published: boolean;
  is_free: boolean;
  estimated_duration: number;
  prerequisites?: number[];
  learning_objectives?: string[];
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface CourseEnrollment {
  id: number;
  student_id: string;
  course_id: number;
  enrolled_at: string;
  status: 'active' | 'completed' | 'paused' | 'dropped';
  completion_percentage: number;
  last_accessed_at: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  student?: Student;
}

export interface LessonProgress {
  id: number;
  student_id: string;
  lesson_id: number;
  enrollment_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent: number;
  started_at?: string;
  completed_at?: string;
  last_position: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  lesson?: Lesson;
  enrollment?: CourseEnrollment;
}

export interface CourseMaterialAccess {
  id: number;
  student_id: string;
  course_id: number;
  material_id: number;
  access_type: 'view' | 'download' | 'complete';
  accessed_at: string;
  time_spent: number;
  completed: boolean;
  material?: CourseMaterial;
}

export interface StudentNotification {
  id: number;
  student_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'enrollment' | 'progress' | 'new_lesson';
  is_read: boolean;
  course_id?: number;
  lesson_id?: number;
  action_url?: string;
  created_at: string;
  read_at?: string;
  course?: Course;
  lesson?: Lesson;
}

export interface CourseCertificate {
  id: number;
  student_id: string;
  course_id: number;
  enrollment_id: number;
  certificate_url?: string;
  issued_at: string;
  valid_until?: string;
  verification_code: string;
  created_at: string;
  course?: Course;
  student?: Student;
}

// Extended interfaces for dashboard
export interface CourseWithProgress extends Course {
  enrollment?: CourseEnrollment;
  progress?: number;
  lessons_count?: number;
  completed_lessons?: number;
  last_accessed?: string;
  next_lesson?: Lesson;
}

export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress;
  is_completed?: boolean;
  is_accessible?: boolean;
}
