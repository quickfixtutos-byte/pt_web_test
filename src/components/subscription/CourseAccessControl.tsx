import { useState, useEffect } from 'react';
import { Lock, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Course, CourseAccessStatus } from '../../lib/supabase';
import { SubscriptionService } from '../../lib/subscription';
import { useAuth } from '../../hooks/useAuth';

interface CourseAccessControlProps {
  course: Course;
  children: React.ReactNode;
  onAccessGranted?: () => void;
}

export default function CourseAccessControl({ 
  course, 
  children, 
  onAccessGranted 
}: CourseAccessControlProps) {
  const { user } = useAuth();
  const [accessStatus, setAccessStatus] = useState<CourseAccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setAccessStatus({
          hasAccess: false,
          accessType: 'none',
          canAccess: false
        });
        setLoading(false);
        return;
      }

      try {
        const status = await SubscriptionService.checkCourseAccess(user.id, course.id);
        setAccessStatus(status);
        
        if (status.canAccess && onAccessGranted) {
          onAccessGranted();
        }
      } catch (error) {
        console.error('Error checking course access:', error);
        setAccessStatus({
          hasAccess: false,
          accessType: 'none',
          canAccess: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, course.id, onAccessGranted]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user has access, render the content
  if (accessStatus?.canAccess) {
    return <>{children}</>;
  }

  // Show access restriction message
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
        {accessStatus?.accessType === 'expired' ? (
          <Clock className="w-8 h-8 text-orange-500" />
        ) : accessStatus?.accessType === 'none' ? (
          <Lock className="w-8 h-8 text-gray-500" />
        ) : (
          <AlertCircle className="w-8 h-8 text-yellow-500" />
        )}
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {course.is_free ? 'Course Access Required' : 'Premium Content'}
      </h3>

      {accessStatus?.accessType === 'expired' ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Your access to this course has expired. Renew your subscription to continue learning.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm">
              <strong>Expired:</strong> {accessStatus.expiresAt ? new Date(accessStatus.expiresAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Renew Access
          </button>
        </div>
      ) : accessStatus?.accessType === 'none' && !course.is_free ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a premium course. Choose a subscription plan to access all content.
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
            {course.monthly_price > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900">Monthly Access</h4>
                <p className="text-2xl font-bold text-blue-600">{course.monthly_price} {course.currency}</p>
                <p className="text-sm text-blue-700">30 days access</p>
              </div>
            )}
            {course.yearly_price > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900">Yearly Access</h4>
                <p className="text-2xl font-bold text-green-600">{course.yearly_price} {course.currency}</p>
                <p className="text-sm text-green-700">365 days access</p>
              </div>
            )}
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Choose Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Please log in to access this course content.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      )}

      {/* Course Preview */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Course Preview</h4>
        <div className="text-left space-y-2 text-sm text-gray-600">
          <p><strong>Duration:</strong> {course.duration_hours} hours</p>
          <p><strong>Level:</strong> {course.difficulty_level}</p>
          <p><strong>Category:</strong> {course.category}</p>
          {course.total_lessons && (
            <p><strong>Lessons:</strong> {course.total_lessons}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for checking course access
export function useCourseAccess(courseId: number) {
  const { user } = useAuth();
  const [accessStatus, setAccessStatus] = useState<CourseAccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setAccessStatus({
          hasAccess: false,
          accessType: 'none',
          canAccess: false
        });
        setLoading(false);
        return;
      }

      try {
        const status = await SubscriptionService.checkCourseAccess(user.id, courseId);
        setAccessStatus(status);
      } catch (error) {
        console.error('Error checking course access:', error);
        setAccessStatus({
          hasAccess: false,
          accessType: 'none',
          canAccess: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, courseId]);

  return { accessStatus, loading };
}
