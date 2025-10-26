import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { StudentService, EnrollmentResult, ProgressUpdateResult } from '../lib/studentService';
import { CourseEnrollment, CourseWithProgress, LessonWithProgress, StudentNotification } from '../lib/supabase';

export function useEnrollment() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!user) {
      setEnrolledCourses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const courses = await StudentService.getEnrolledCourses(user.id);
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const enrollInCourse = useCallback(async (courseId: number): Promise<EnrollmentResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const result = await StudentService.enrollInCourse(user.id, courseId);
    
    if (result.success) {
      // Refresh enrolled courses
      await fetchEnrolledCourses();
    }
    
    return result;
  }, [user, fetchEnrolledCourses]);

  const isEnrolled = useCallback(async (courseId: number): Promise<boolean> => {
    if (!user) return false;
    return StudentService.isEnrolled(user.id, courseId);
  }, [user]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  return {
    enrolledCourses,
    loading,
    enrollInCourse,
    isEnrolled,
    refreshEnrolledCourses: fetchEnrolledCourses
  };
}

export function useCourseProgress(courseId: number) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourseData = useCallback(async () => {
    if (!user || !courseId) {
      setLessons([]);
      setEnrollment(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch lessons and enrollment in parallel
      const [lessonsData, enrollmentData] = await Promise.all([
        StudentService.getCourseLessons(user.id, courseId),
        StudentService.getEnrollment(user.id, courseId)
      ]);

      setLessons(lessonsData);
      setEnrollment(enrollmentData);
    } catch (error) {
      console.error('Error fetching course data:', error);
      setLessons([]);
      setEnrollment(null);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  const updateProgress = useCallback(async (
    lessonId: number,
    progressData: {
      status?: 'not_started' | 'in_progress' | 'completed';
      progress_percentage?: number;
      time_spent?: number;
      last_position?: number;
      notes?: string;
    }
  ): Promise<ProgressUpdateResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const result = await StudentService.updateLessonProgress(user.id, lessonId, progressData);
    
    if (result.success) {
      // Refresh course data
      await fetchCourseData();
    }
    
    return result;
  }, [user, fetchCourseData]);

  const completeLesson = useCallback(async (lessonId: number): Promise<ProgressUpdateResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const result = await StudentService.completeLesson(user.id, lessonId);
    
    if (result.success) {
      // Refresh course data
      await fetchCourseData();
    }
    
    return result;
  }, [user, fetchCourseData]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  return {
    lessons,
    enrollment,
    loading,
    updateProgress,
    completeLesson,
    refreshCourseData: fetchCourseData
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const notifs = await StudentService.getNotifications(user.id, 20);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await StudentService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      await Promise.all(
        unreadNotifications.map(n => StudentService.markNotificationAsRead(n.id))
      );
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
}

// Hook for checking enrollment status of a single course
export function useCourseEnrollment(courseId: number) {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const checkEnrollment = useCallback(async () => {
    if (!user || !courseId) {
      setIsEnrolled(false);
      setEnrollment(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [enrolled, enrollmentData] = await Promise.all([
        StudentService.isEnrolled(user.id, courseId),
        StudentService.getEnrollment(user.id, courseId)
      ]);

      setIsEnrolled(enrolled);
      setEnrollment(enrollmentData);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setIsEnrolled(false);
      setEnrollment(null);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  return {
    isEnrolled,
    enrollment,
    loading,
    refreshEnrollment: checkEnrollment
  };
}
