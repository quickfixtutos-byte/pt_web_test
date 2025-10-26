import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useAccessControl } from '../../hooks/useAccessControl';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import LoadingSpinner from '../LoadingSpinner';

interface CourseAccessRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAccess?: boolean;
}

export default function CourseAccessRoute({ 
  children, 
  fallback,
  requireAccess = true 
}: CourseAccessRouteProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const courseIdNum = courseId ? parseInt(courseId) : 0;

  const { 
    canAccess, 
    loading: accessLoading 
  } = useAccessControl(courseIdNum);

  const {
    paymentStatus,
    loading: paymentLoading,
    isPending
  } = usePaymentStatus(courseIdNum);

  if (accessLoading || paymentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If access is not required, render children
  if (!requireAccess) {
    return <>{children}</>;
  }

  // If user has access, render children
  if (canAccess) {
    return <>{children}</>;
  }

  // If user has pending payment, show pending message
  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Under Review</h2>
          <p className="text-gray-600 mb-6">
            We're currently reviewing your payment receipt. You'll receive an email notification once your access is approved.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/courses'}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Browse Other Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If payment was rejected, show rejection message
  if (isRejected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Rejected</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your payment was not approved. Please check the payment details and try again.
          </p>
          {paymentStatus.adminNotes && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Admin Notes:</h3>
              <p className="text-sm text-gray-700">{paymentStatus.adminNotes}</p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = `/course/${courseId}?subscribe=true`}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/courses'}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Browse Other Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for premium courses
  if (fallback) {
    return <>{fallback}</>;
  }

  // This should not happen as AccessDenied should be shown, but as fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
        <p className="text-gray-600 mb-6">You need to subscribe to access this course.</p>
        <button
          onClick={() => window.location.href = '/courses'}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Browse Courses
        </button>
      </div>
    </div>
  );
}
