import { useState } from 'react';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { useEnrollment } from '../hooks/useEnrollment';
import { useCourseEnrollment } from '../hooks/useEnrollment';
import toast from 'react-hot-toast';

interface EnrollmentButtonProps {
  courseId: number;
  courseTitle: string;
  className?: string;
}

export default function EnrollmentButton({ courseId, courseTitle, className = '' }: EnrollmentButtonProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { enrollInCourse, refreshEnrolledCourses } = useEnrollment();
  const { isEnrolled, loading } = useCourseEnrollment(courseId);

  const handleEnroll = async () => {
    if (!courseId) return;

    try {
      setIsEnrolling(true);
      const result = await enrollInCourse(courseId);

      if (result.success) {
        toast.success(`Successfully enrolled in "${courseTitle}"!`);
        await refreshEnrolledCourses();
      } else {
        toast.error(result.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('An error occurred during enrollment');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-3 px-6 bg-gray-100 rounded-lg ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Checking enrollment...</span>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className={`flex items-center justify-center py-3 px-6 bg-green-100 text-green-700 rounded-lg ${className}`}>
        <CheckCircle className="w-5 h-5" />
        <span className="ml-2 font-medium">Enrolled</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={isEnrolling}
      className={`flex items-center justify-center py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isEnrolling ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="ml-2">Enrolling...</span>
        </>
      ) : (
        <>
          <BookOpen className="w-5 h-5" />
          <span className="ml-2 font-medium">Enroll Now</span>
        </>
      )}
    </button>
  );
}
