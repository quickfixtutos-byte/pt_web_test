import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Download, 
  Lock, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Video,
  RefreshCw
} from 'lucide-react';
import { supabase, Course } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';
import { usePaymentStatus } from '../hooks/usePaymentStatus';
import PaymentFlow from '../components/subscription/PaymentFlow';
import AccessDenied from '../components/subscription/AccessDenied';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  const { 
    canAccess, 
    accessType, 
    daysRemaining, 
    isExpiringSoon, 
    isExpired, 
    loading: accessLoading 
  } = useAccessControl(courseId ? parseInt(courseId) : 0);

  const {
    loading: paymentLoading,
    refreshStatus,
    isPending,
    isRejected
  } = usePaymentStatus(courseId ? parseInt(courseId) : 0);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, user, fetchCourse]);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
        toast.error('Course not found');
        navigate('/courses');
        return;
      }

      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);


  const handlePaymentComplete = () => {
    setShowPaymentFlow(false);
    toast.success('Payment submitted! We will review your receipt and activate your access within 24 hours.');
  };

  const getAccessStatus = () => {
    if (course?.is_free) {
      return {
        type: 'free',
        message: 'Free Course',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        color: 'text-green-600 bg-green-50'
      };
    }

    if (canAccess) {
      if (isExpiringSoon) {
        return {
          type: 'expiring',
          message: `Expires in ${daysRemaining} days`,
          icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
          color: 'text-orange-600 bg-orange-50'
        };
      }
      return {
        type: 'active',
        message: `${accessType === 'monthly' ? 'Monthly' : 'Yearly'} Access`,
        icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
        color: 'text-blue-600 bg-blue-50'
      };
    }

    if (isPending) {
      return {
        type: 'pending',
        message: 'Awaiting Approval',
        icon: <Clock className="w-5 h-5 text-yellow-600" />,
        color: 'text-yellow-600 bg-yellow-50'
      };
    }

    if (isRejected) {
      return {
        type: 'rejected',
        message: 'Payment Rejected',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        color: 'text-red-600 bg-red-50'
      };
    }

    return {
      type: 'locked',
      message: 'Premium Course',
      icon: <Lock className="w-5 h-5 text-gray-600" />,
      color: 'text-gray-600 bg-gray-50'
    };
  };

  if (loading || accessLoading || paymentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const accessStatus = getAccessStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Courses
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${accessStatus.color}`}>
                {accessStatus.icon}
                <span className="ml-2">{accessStatus.message}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-64 md:h-80">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {course.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-white/90">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration_hours} hours
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.difficulty_level}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {course.rating || 4.5}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Course Content */}
            {canAccess || course.is_free ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
                
                {/* Video Section */}
                {course.video_url && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Video className="w-5 h-5 mr-2" />
                      Course Video
                    </h3>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {course.video_type === 'youtube' ? (
                        <iframe
                          src={course.video_url}
                          className="w-full h-full"
                          allowFullScreen
                          title={course.title}
                        />
                      ) : (
                        <video
                          src={course.video_url}
                          controls
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Course Materials */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Course Materials
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-gray-900">Course Syllabus</span>
                      </div>
                      <button className="flex items-center text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-gray-900">Exercise Files</span>
                      </div>
                      <button className="flex items-center text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Course Curriculum */}
                {course.curriculum && course.curriculum.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Course Curriculum
                    </h3>
                    <div className="space-y-4">
                      {course.curriculum.map((section, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">{section.section_title}</h4>
                          </div>
                          <div className="p-4">
                            <div className="space-y-2">
                              {section.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="flex items-center justify-between py-2">
                                  <div className="flex items-center">
                                    <Play className="w-4 h-4 text-gray-500 mr-3" />
                                    <span className="text-gray-900">{lesson.title}</span>
                                    <span className="ml-2 text-sm text-gray-500">({lesson.duration})</span>
                                  </div>
                                  <span className="text-sm text-gray-500 capitalize">{lesson.type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <AccessDenied 
                course={course}
                accessType={accessType}
                daysRemaining={daysRemaining}
                isExpiringSoon={isExpiringSoon}
                isExpired={isExpired}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{course.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium text-gray-900">{course.difficulty_level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{course.duration_hours} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lessons</span>
                  <span className="font-medium text-gray-900">{course.total_lessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium text-gray-900">{course.enrollment_count}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            {!course.is_free && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-4">
                  {course.monthly_price > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Monthly Access</span>
                        <span className="text-2xl font-bold text-blue-600">{course.monthly_price} {course.currency}</span>
                      </div>
                      <p className="text-sm text-gray-600">30 days access</p>
                    </div>
                  )}
                  {course.yearly_price > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Yearly Access</span>
                        <span className="text-2xl font-bold text-green-600">{course.yearly_price} {course.currency}</span>
                      </div>
                      <p className="text-sm text-gray-600">365 days access</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {canAccess || course.is_free ? (
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning
                  </button>
                  {isExpiringSoon && (
                    <button
                      onClick={() => setShowPaymentFlow(true)}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Renew Access
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {isPending ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Under Review</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        We're reviewing your payment receipt. You'll receive an email once approved.
                      </p>
                      <button
                        onClick={refreshStatus}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Check Status
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPaymentFlow(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Get Access
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <PaymentFlow
          course={course}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPaymentFlow(false)}
        />
      )}
    </div>
  );
}
