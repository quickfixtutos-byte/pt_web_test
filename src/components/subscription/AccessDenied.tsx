import { useState } from 'react';
import { 
  Lock, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  RefreshCw,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Course } from '../../lib/supabase';
import PaymentFlow from './PaymentFlow';

interface AccessDeniedProps {
  course: Course;
  accessType: 'free' | 'monthly' | 'yearly' | 'expired' | 'none';
  daysRemaining?: number;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
}

export default function AccessDenied({ 
  course, 
  accessType, 
  daysRemaining, 
  isExpiringSoon, 
  isExpired 
}: AccessDeniedProps) {
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  const getStatusIcon = () => {
    if (isExpired) return <Clock className="w-8 h-8 text-red-500" />;
    if (isExpiringSoon) return <AlertCircle className="w-8 h-8 text-orange-500" />;
    if (accessType === 'none') return <Lock className="w-8 h-8 text-gray-500" />;
    return <Lock className="w-8 h-8 text-gray-500" />;
  };

  const getStatusTitle = () => {
    if (isExpired) return 'Access Expired';
    if (isExpiringSoon) return 'Access Expiring Soon';
    if (accessType === 'none' && !course.is_free) return 'Premium Content';
    return 'Access Required';
  };

  const getStatusMessage = () => {
    if (isExpired) {
      return 'Your access to this course has expired. Renew your subscription to continue learning.';
    }
    if (isExpiringSoon) {
      return `Your access expires in ${daysRemaining} days. Renew now to avoid interruption.`;
    }
    if (accessType === 'none' && !course.is_free) {
      return 'This is a premium course. Choose a subscription plan to access all content.';
    }
    return 'Please log in to access this course content.';
  };

  const getActionButton = () => {
    if (isExpired || (accessType === 'none' && !course.is_free)) {
      return (
        <button
          onClick={() => setShowPaymentFlow(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>Choose Plan</span>
        </button>
      );
    }
    
    if (isExpiringSoon) {
      return (
        <button
          onClick={() => setShowPaymentFlow(true)}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Renew Access</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => window.location.href = '/login'}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign In
      </button>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Status Icon */}
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-6">
              {getStatusIcon()}
            </div>

            {/* Status Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {getStatusTitle()}
            </h1>

            {/* Status Message */}
            <p className="text-lg text-gray-600 mb-8">
              {getStatusMessage()}
            </p>

            {/* Course Preview */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-4">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.category}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration_hours}h
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {course.difficulty_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mb-6">
              {getActionButton()}
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{course.duration_hours} hours</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>{course.difficulty_level}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="w-4 h-4 mr-2 bg-blue-500 rounded-full"></span>
                <span>{course.category}</span>
              </div>
            </div>

            {/* Pricing Information for Paid Courses */}
            {!course.is_free && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Subscription Plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  {course.monthly_price > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900">Monthly Access</h5>
                      <p className="text-2xl font-bold text-blue-600">{course.monthly_price} {course.currency}</p>
                      <p className="text-sm text-blue-700">30 days access</p>
                    </div>
                  )}
                  {course.yearly_price > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-900">Yearly Access</h5>
                      <p className="text-2xl font-bold text-green-600">{course.yearly_price} {course.currency}</p>
                      <p className="text-sm text-green-700">365 days access</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expiration Warning */}
            {isExpiringSoon && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                  <p className="text-orange-800 text-sm">
                    <strong>Expiring Soon:</strong> Your access will end in {daysRemaining} days. 
                    Renew now to continue without interruption.
                  </p>
                </div>
              </div>
            )}

            {/* Expired Warning */}
            {isExpired && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800 text-sm">
                    <strong>Access Expired:</strong> Your subscription has ended. 
                    Renew now to regain access to all course materials.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <PaymentFlow
          course={course}
          onPaymentComplete={() => {
            setShowPaymentFlow(false);
            // Refresh the page or update access status
            window.location.reload();
          }}
          onClose={() => setShowPaymentFlow(false)}
        />
      )}
    </>
  );
}
