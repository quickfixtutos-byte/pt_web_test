import { ReactNode } from 'react';
import { useAccessControl } from '../../hooks/useAccessControl';
import { Course } from '../../lib/supabase';
import AccessDenied from './AccessDenied';
import LoadingSpinner from '../LoadingSpinner';

interface AccessControlMiddlewareProps {
  course: Course;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

export default function AccessControlMiddleware({ 
  course, 
  children, 
  fallback,
  showLoading = true 
}: AccessControlMiddlewareProps) {
  const { canAccess, loading, accessType, daysRemaining, isExpiringSoon, isExpired } = useAccessControl(course.id);

  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <AccessDenied 
        course={course}
        accessType={accessType}
        daysRemaining={daysRemaining}
        isExpiringSoon={isExpiringSoon}
        isExpired={isExpired}
      />
    );
  }

  return (
    <>
      {children}
      {isExpiringSoon && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-200 rounded-lg p-4 max-w-sm shadow-lg z-50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Subscription Expiring Soon
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Your access to this course expires in {daysRemaining} days. Renew now to continue learning.
              </p>
              <div className="mt-2">
                <button className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700">
                  Renew Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Higher-order component for access control
export function withAccessControl<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    showLoading?: boolean;
    fallback?: ReactNode;
  }
) {
  return function AccessControlledComponent(props: P & { course: Course }) {
    const { course, ...restProps } = props;
    
    return (
      <AccessControlMiddleware 
        course={course}
        showLoading={options?.showLoading}
        fallback={options?.fallback}
      >
        <Component {...(restProps as P)} course={course} />
      </AccessControlMiddleware>
    );
  };
}
