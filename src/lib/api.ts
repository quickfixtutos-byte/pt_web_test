import { supabase } from './supabase';
import { AuthMiddleware, ValidationUtils } from './middleware';
import { Course, Testimonial, Instructor } from './supabase';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CourseFilters {
  level?: string;
  category?: string;
  search?: string;
  isPublished?: boolean;
}

export interface EnrollmentData {
  courseId: string;
  studentId: string;
}

export interface ProgressData {
  courseId: string;
  lessonId: string;
  progress: number;
  completed: boolean;
}

/**
 * API service for handling all backend operations
 */
export class ApiService {
  /**
   * Course Management API
   */
  static async getCourses(
    filters: CourseFilters = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<{ courses: Course[]; total: number }>> {
    try {
      let query = supabase
        .from('courses')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.level && filters.level !== 'Tous') {
        query = query.eq('level', filters.level);
      }

      if (filters.category && filters.category !== 'Tous') {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }

      // Apply pagination
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      // Apply sorting
      const sortBy = pagination.sortBy || 'created_at';
      const sortOrder = pagination.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          courses: data || [],
          total: count || 0,
        },
      };
    } catch (error) {
      console.error('Get courses error:', error);
      return { success: false, error: 'Failed to fetch courses' };
    }
  }

  static async getCourseById(courseId: string): Promise<ApiResponse<Course>> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get course error:', error);
      return { success: false, error: 'Failed to fetch course' };
    }
  }

  static async createCourse(
    courseData: Partial<Course>,
    token?: string
  ): Promise<ApiResponse<Course>> {
    try {
      // Validate authentication
      const auth = await AuthMiddleware.requireAdmin(token);
      if (!auth) {
        return { success: false, error: 'Admin access required' };
      }

      // Validate course data
      const validation = ValidationUtils.validateCourseData(courseData);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...courseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data, message: 'Course created successfully' };
    } catch (error) {
      console.error('Create course error:', error);
      return { success: false, error: 'Failed to create course' };
    }
  }

  static async updateCourse(
    courseId: string,
    updates: Partial<Course>,
    token?: string
  ): Promise<ApiResponse<Course>> {
    try {
      // Validate authentication
      const auth = await AuthMiddleware.requireAdmin(token);
      if (!auth) {
        return { success: false, error: 'Admin access required' };
      }

      // Validate course data
      const validation = ValidationUtils.validateCourseData(updates);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data, message: 'Course updated successfully' };
    } catch (error) {
      console.error('Update course error:', error);
      return { success: false, error: 'Failed to update course' };
    }
  }

  static async deleteCourse(courseId: string, token?: string): Promise<ApiResponse> {
    try {
      // Validate authentication
      const auth = await AuthMiddleware.requireAdmin(token);
      if (!auth) {
        return { success: false, error: 'Admin access required' };
      }

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Course deleted successfully' };
    } catch (error) {
      console.error('Delete course error:', error);
      return { success: false, error: 'Failed to delete course' };
    }
  }

  /**
   * Student Management API
   */
  static async getStudents(token?: string): Promise<ApiResponse<unknown[]>> {
    try {
      // Validate authentication
      const auth = await AuthMiddleware.requireAdmin(token);
      if (!auth) {
        return { success: false, error: 'Admin access required' };
      }

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          enrollments (
            id,
            course_id,
            progress_percentage,
            lessons_completed,
            enrolled_at,
            completed_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get students error:', error);
      return { success: false, error: 'Failed to fetch students' };
    }
  }

  static async getStudentById(studentId: string, token?: string): Promise<ApiResponse<unknown>> {
    try {
      // Validate authentication
      const auth = await AuthMiddleware.protectRoute(token);
      if (!auth) {
        return { success: false, error: 'Authentication required' };
      }

      // Check if user is admin or accessing their own data
      if (!auth.isAdmin && auth.user.id !== studentId) {
        return { success: false, error: 'Access denied' };
      }

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          enrollments (
            id,
            course_id,
            progress_percentage,
            lessons_completed,
            enrolled_at,
            completed_at,
            courses (
              id,
              title,
              description,
              thumbnail_url
            )
          ),
          certificates (
            id,
            course_id,
            certificate_url,
            issued_at,
            courses (
              id,
              title
            )
          )
        `)
        .eq('id', studentId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get student error:', error);
      return { success: false, error: 'Failed to fetch student' };
    }
  }

  /**
   * Enrollment Management API
   */
  static async enrollInCourse(
    courseId: string,
    token?: string
  ): Promise<ApiResponse> {
    try {
      // Validate authentication
      const auth = await AuthMiddleware.protectRoute(token);
      if (!auth) {
        return { success: false, error: 'Authentication required' };
      }

      // Get student ID
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', auth.user.id)
        .single();

      if (!student) {
        return { success: false, error: 'Student profile not found' };
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', student.id)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        return { success: false, error: 'Already enrolled in this course' };
      }

      // Create enrollment
      const { error } = await supabase
        .from('enrollments')
        .insert([{
          student_id: student.id,
          course_id: courseId,
          progress_percentage: 0,
          lessons_completed: 0,
          is_favorite: false,
          enrolled_at: new Date().toISOString(),
        }]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Successfully enrolled in course' };
    } catch (error) {
      console.error('Enroll course error:', error);
      return { success: false, error: 'Failed to enroll in course' };
    }
  }

  static async updateProgress(
    courseId: string,
    progressData: ProgressData,
    token?: string
  ): Promise<ApiResponse> {
    try {
      // Validate authentication
      const auth = await AuthMiddleware.protectRoute(token);
      if (!auth) {
        return { success: false, error: 'Authentication required' };
      }

      // Get student ID
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', auth.user.id)
        .single();

      if (!student) {
        return { success: false, error: 'Student profile not found' };
      }

      // Update enrollment progress
      const { error } = await supabase
        .from('enrollments')
        .update({
          progress_percentage: progressData.progress,
          lessons_completed: progressData.completed ? 
            (await this.getCurrentLessonsCompleted(student.id, courseId)) + 1 :
            await this.getCurrentLessonsCompleted(student.id, courseId),
          last_accessed_at: new Date().toISOString(),
          completed_at: progressData.completed ? new Date().toISOString() : null,
        })
        .eq('student_id', student.id)
        .eq('course_id', courseId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Progress updated successfully' };
    } catch (error) {
      console.error('Update progress error:', error);
      return { success: false, error: 'Failed to update progress' };
    }
  }

  /**
   * Helper method to get current lessons completed
   */
  private static async getCurrentLessonsCompleted(studentId: string, courseId: string): Promise<number> {
    const { data } = await supabase
      .from('enrollments')
      .select('lessons_completed')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    return data?.lessons_completed || 0;
  }

  /**
   * Testimonials API
   */
  static async getTestimonials(): Promise<ApiResponse<Testimonial[]>> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get testimonials error:', error);
      return { success: false, error: 'Failed to fetch testimonials' };
    }
  }

  static async createTestimonial(
    testimonialData: Partial<Testimonial>,
    token?: string
  ): Promise<ApiResponse<Testimonial>> {
    try {
      // Validate authentication
      const auth = await AuthMiddleware.protectRoute(token);
      if (!auth) {
        return { success: false, error: 'Authentication required' };
      }

      // Validate testimonial data
      if (!testimonialData.student_name || !testimonialData.content) {
        return { success: false, error: 'Student name and content are required' };
      }

      if (testimonialData.rating && (testimonialData.rating < 1 || testimonialData.rating > 5)) {
        return { success: false, error: 'Rating must be between 1 and 5' };
      }

      const { data, error } = await supabase
        .from('testimonials')
        .insert([{
          ...testimonialData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data, message: 'Testimonial created successfully' };
    } catch (error) {
      console.error('Create testimonial error:', error);
      return { success: false, error: 'Failed to create testimonial' };
    }
  }

  /**
   * Instructors API
   */
  static async getInstructors(): Promise<ApiResponse<Instructor[]>> {
    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get instructors error:', error);
      return { success: false, error: 'Failed to fetch instructors' };
    }
  }

  /**
   * Newsletter API
   */
  static async subscribeToNewsletter(email: string): Promise<ApiResponse> {
    try {
      // Validate email
      if (!ValidationUtils.isValidEmail(email)) {
        return { success: false, error: 'Invalid email address' };
      }

      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email: email.toLowerCase().trim(),
          subscribed_at: new Date().toISOString(),
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, error: 'Email already subscribed' };
        }
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Successfully subscribed to newsletter' };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return { success: false, error: 'Failed to subscribe to newsletter' };
    }
  }

  /**
   * Contact API
   */
  static async sendContactMessage(
    name: string,
    email: string,
    message: string
  ): Promise<ApiResponse> {
    try {
      // Validate input
      if (!name || !email || !message) {
        return { success: false, error: 'All fields are required' };
      }

      if (!ValidationUtils.isValidEmail(email)) {
        return { success: false, error: 'Invalid email address' };
      }

      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: ValidationUtils.sanitizeString(name),
          email: email.toLowerCase().trim(),
          message: ValidationUtils.sanitizeString(message),
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error('Send contact message error:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }
}
