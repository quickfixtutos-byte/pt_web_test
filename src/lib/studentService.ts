import { supabase, CourseEnrollment, LessonProgress, CourseWithProgress, LessonWithProgress, StudentNotification } from './supabase';

export interface EnrollmentResult {
  success: boolean;
  enrollment?: CourseEnrollment;
  error?: string;
}

export interface ProgressUpdateResult {
  success: boolean;
  progress?: LessonProgress;
  courseProgress?: number;
  error?: string;
}

export class StudentService {
  /**
   * Enroll a student in a course
   */
  static async enrollInCourse(studentId: string, courseId: number): Promise<EnrollmentResult> {
    try {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        return {
          success: false,
          error: 'You are already enrolled in this course'
        };
      }

      // Create new enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .insert({
          student_id: studentId,
          course_id: courseId,
          status: 'active',
          completion_percentage: 0
        })
        .select(`
          *,
          course:courses(*)
        `)
        .single();

      if (enrollmentError) throw enrollmentError;

      // Create notification
      await this.createNotification(studentId, {
        title: 'Course Enrolled',
        message: `You have successfully enrolled in "${enrollment.course?.title}"`,
        type: 'enrollment',
        course_id: courseId
      });

      return {
        success: true,
        enrollment
      };
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enroll in course'
      };
    }
  }

  /**
   * Get student's enrolled courses with progress
   */
  static async getEnrolledCourses(studentId: string): Promise<CourseWithProgress[]> {
    try {
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('student_id', studentId)
        .eq('status', 'active')
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;

      // Get lessons count and completed lessons for each course
      const coursesWithProgress: CourseWithProgress[] = [];
      
      for (const enrollment of enrollments || []) {
        const course = enrollment.course;
        if (!course) continue;

        // Get lessons count
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('is_published', true);

        // Get completed lessons count
        const { count: completedLessons } = await supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .eq('status', 'completed')
          .in('lesson_id', 
            (await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', course.id)
              .eq('is_published', true)
            ).data?.map(l => l.id) || []
          );

        // Get next lesson
        const { data: nextLesson } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', course.id)
          .eq('is_published', true)
          .not('id', 'in', 
            (await supabase
              .from('lesson_progress')
              .select('lesson_id')
              .eq('student_id', studentId)
              .eq('status', 'completed')
            ).data?.map(p => p.lesson_id) || []
          )
          .order('order_index', { ascending: true })
          .limit(1)
          .single();

        coursesWithProgress.push({
          ...course,
          enrollment,
          progress: enrollment.completion_percentage,
          lessons_count: lessonsCount || 0,
          completed_lessons: completedLessons || 0,
          last_accessed: enrollment.last_accessed_at,
          next_lesson: nextLesson || undefined
        });
      }

      return coursesWithProgress;
    } catch (error) {
      console.error('Error getting enrolled courses:', error);
      return [];
    }
  }

  /**
   * Get course lessons with progress
   */
  static async getCourseLessons(studentId: string, courseId: number): Promise<LessonWithProgress[]> {
    try {
      // Check if student is enrolled
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .single();

      if (!enrollment) {
        throw new Error('You are not enrolled in this course');
      }

      // Get lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Get progress for each lesson
      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', studentId)
        .in('lesson_id', lessons?.map(l => l.id) || []);

      if (progressError) throw progressError;

      const progressMap = new Map(progressData?.map(p => [p.lesson_id, p]) || []);

      return lessons?.map(lesson => ({
        ...lesson,
        progress: progressMap.get(lesson.id),
        is_completed: progressMap.get(lesson.id)?.status === 'completed',
        is_accessible: true // For enrolled students, all lessons are accessible
      })) || [];
    } catch (error) {
      console.error('Error getting course lessons:', error);
      return [];
    }
  }

  /**
   * Update lesson progress
   */
  static async updateLessonProgress(
    studentId: string,
    lessonId: number,
    progressData: {
      status?: 'not_started' | 'in_progress' | 'completed';
      progress_percentage?: number;
      time_spent?: number;
      last_position?: number;
      notes?: string;
    }
  ): Promise<ProgressUpdateResult> {
    try {
      // Get lesson and enrollment info
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('course_id')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lesson) {
        throw new Error('Lesson not found');
      }

      const { data: enrollment, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', lesson.course_id)
        .eq('status', 'active')
        .single();

      if (enrollmentError || !enrollment) {
        throw new Error('You are not enrolled in this course');
      }

      // Update or create lesson progress
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .upsert({
          student_id: studentId,
          lesson_id: lessonId,
          enrollment_id: enrollment.id,
          ...progressData,
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (progressError) throw progressError;

      // Update enrollment last accessed
      await supabase
        .from('course_enrollments')
        .update({
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', enrollment.id);

      // Get updated course progress
      const { data: updatedEnrollment } = await supabase
        .from('course_enrollments')
        .select('completion_percentage')
        .eq('id', enrollment.id)
        .single();

      return {
        success: true,
        progress,
        courseProgress: updatedEnrollment?.completion_percentage || 0
      };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update progress'
      };
    }
  }

  /**
   * Mark lesson as completed
   */
  static async completeLesson(studentId: string, lessonId: number): Promise<ProgressUpdateResult> {
    return this.updateLessonProgress(studentId, lessonId, {
      status: 'completed',
      progress_percentage: 100,
      completed_at: new Date().toISOString()
    });
  }

  /**
   * Get student notifications
   */
  static async getNotifications(studentId: string, limit: number = 10): Promise<StudentNotification[]> {
    try {
      const { data: notifications, error } = await supabase
        .from('student_notifications')
        .select(`
          *,
          course:courses(*),
          lesson:lessons(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return notifications || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await supabase
        .from('student_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Create a notification for a student
   */
  static async createNotification(
    studentId: string,
    notification: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error' | 'enrollment' | 'progress' | 'new_lesson';
      course_id?: number;
      lesson_id?: number;
      action_url?: string;
    }
  ): Promise<void> {
    try {
      await supabase
        .from('student_notifications')
        .insert({
          student_id: studentId,
          ...notification
        });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Check if student is enrolled in a course
   */
  static async isEnrolled(studentId: string, courseId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get course enrollment details
   */
  static async getEnrollment(studentId: string, courseId: number): Promise<CourseEnrollment | null> {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('Error getting enrollment:', error);
      return null;
    }
  }
}
