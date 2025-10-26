import { useState } from 'react';
import { 
  CreditCard, 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  X
} from 'lucide-react';
import { Course, CoursePack } from '../../lib/supabase';
import { SubscriptionService } from '../../lib/subscription';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface PaymentFlowProps {
  course: Course | CoursePack;
  onPaymentComplete: () => void;
  onClose: () => void;
}

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function PaymentFlow({ course, onPaymentComplete, onClose }: PaymentFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const steps: PaymentStep[] = [
    {
      id: 'select-plan',
      title: 'Choose Plan',
      description: 'Select your subscription plan',
      completed: selectedPlan !== null
    },
    {
      id: 'payment-info',
      title: 'Payment Information',
      description: 'Get payment details and instructions',
      completed: false
    },
    {
      id: 'upload-receipt',
      title: 'Upload Receipt',
      description: 'Upload your payment receipt',
      completed: receiptFile !== null
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Review and submit your payment',
      completed: false
    }
  ];

  const plans = SubscriptionService.getCoursePlans(course);

  const handlePlanSelect = (planType: 'monthly' | 'yearly') => {
    setSelectedPlan(planType);
    setCurrentStep(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG) or PDF file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setReceiptFile(file);
      setCurrentStep(3);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan || !receiptFile || !user) {
      toast.error('Missing required information');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const plan = plans.find(p => p.type === selectedPlan);
      if (!plan) {
        throw new Error('Selected plan not found');
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create payment record
      const paymentRecord = await SubscriptionService.createPayment(
        user.id,
        course.id,
        selectedPlan,
        plan.price,
        plan.currency
      );

      setPayment(paymentRecord);

      // Upload receipt
      await SubscriptionService.uploadReceipt(paymentRecord.id, receiptFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Payment submitted successfully! We will review your receipt and activate your access within 24 hours.');
      
      setTimeout(() => {
        onPaymentComplete();
      }, 2000);

    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">Select the subscription plan that works best for you</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.type}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handlePlanSelect(plan.type)}
                >
                  <div className="text-center">
                    <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                      {plan.type === 'monthly' ? (
                        <Clock className="w-6 h-6 text-blue-600" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {plan.type === 'monthly' ? 'Monthly Access' : 'Yearly Access'}
                    </h4>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {plan.price} {plan.currency}
                    </div>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Full course access
                      </div>
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        All course materials
                      </div>
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Certificate of completion
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 1: {
        const selectedPlanData = plans.find(p => p.type === selectedPlan);
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Instructions</h3>
              <p className="text-gray-600">Choose your preferred payment method</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Details
              </h4>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Option 1: Post Office Payment</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Account Name:</strong> PathTech Academy</p>
                    <p><strong>Amount:</strong> {selectedPlanData?.price} {selectedPlanData?.currency}</p>
                    <p><strong>Reference:</strong> Course-{course.id}-{selectedPlan}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Option 2: Bank Transfer</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Bank:</strong> Banque de Tunisie</p>
                    <p><strong>IBAN:</strong> TN59 10 006 123456789012 34</p>
                    <p><strong>Amount:</strong> {selectedPlanData?.price} {selectedPlanData?.currency}</p>
                    <p><strong>Reference:</strong> Course-{course.id}-{selectedPlan}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(0)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Next →
              </button>
            </div>
          </div>
        );
      }

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Receipt</h3>
              <p className="text-gray-600">Upload a photo or scan of your payment receipt</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-lg"
              >
                Click to upload receipt
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: JPEG, PNG, PDF (Max 5MB)
              </p>
            </div>

            {receiptFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-green-900">{receiptFile.name}</p>
                      <p className="text-sm text-green-700">{formatFileSize(receiptFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReceiptFile(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              {receiptFile && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Payment</h3>
              <p className="text-gray-600">Review your payment details before submitting</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Course:</span>
                <span className="font-medium">{course.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">
                  {selectedPlan === 'monthly' ? 'Monthly Access' : 'Yearly Access'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg">
                  {plans.find(p => p.type === selectedPlan)?.price} {plans.find(p => p.type === selectedPlan)?.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Receipt:</span>
                <span className="font-medium">{receiptFile?.name}</span>
              </div>
            </div>

            {isSubmitting && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="text-blue-800 font-medium">Submitting payment...</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-blue-700 mt-1">{uploadProgress}% complete</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Subscribe to Course</h2>
            <p className="text-sm text-gray-600">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
