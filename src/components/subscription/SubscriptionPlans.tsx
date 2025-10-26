import { useState } from 'react';
import { Check, Clock, Calendar, CreditCard, Upload, FileText } from 'lucide-react';
import { Course } from '../../lib/supabase';
import { SubscriptionService } from '../../lib/subscription';
import toast from 'react-hot-toast';

interface SubscriptionPlansProps {
  course: Course;
  onPaymentSubmitted: () => void;
}

export default function SubscriptionPlans({ course, onPaymentSubmitted }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = SubscriptionService.getCoursePlans(course);

  const handlePlanSelect = (planType: 'monthly' | 'yearly') => {
    setSelectedPlan(planType);
    setShowPaymentForm(true);
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
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan || !receiptFile) {
      toast.error('Please select a plan and upload a receipt');
      return;
    }

    setIsSubmitting(true);
    try {
      const plan = plans.find(p => p.type === selectedPlan);
      if (!plan) {
        throw new Error('Selected plan not found');
      }

      // Create payment record
      const payment = await SubscriptionService.createPayment(
        'current-user-id', // This should come from auth context
        course.id,
        selectedPlan,
        plan.price,
        plan.currency
      );

      // Upload receipt
      await SubscriptionService.uploadReceipt(payment.id, receiptFile);

      toast.success('Payment submitted successfully! We will review your receipt and activate your access within 24 hours.');
      setShowPaymentForm(false);
      setSelectedPlan(null);
      setReceiptFile(null);
      onPaymentSubmitted();
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (course.is_free) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Free Course</h3>
        <p className="text-green-700">This course is completely free and accessible to all users.</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No subscription plans available for this course.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Selection */}
      {!showPaymentForm && (
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
                    <Calendar className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.type === 'monthly' ? 'Monthly Access' : 'Yearly Access'}
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {plan.price} {plan.currency}
                </div>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Full course access
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    All course materials
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Certificate of completion
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && selectedPlan && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Complete Your Payment</h3>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Selected Plan Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Selected Plan</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {selectedPlan === 'monthly' ? 'Monthly Access' : 'Yearly Access'}
                </span>
                <span className="font-semibold text-gray-900">
                  {plans.find(p => p.type === selectedPlan)?.price} {plans.find(p => p.type === selectedPlan)?.currency}
                </span>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Instructions
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Option 1: Post Office</strong></p>
                <p>Visit your nearest post office and make a payment to:</p>
                <p className="font-mono bg-blue-100 p-2 rounded">Account: PathTech Academy</p>
                <p className="font-mono bg-blue-100 p-2 rounded">Amount: {plans.find(p => p.type === selectedPlan)?.price} {plans.find(p => p.type === selectedPlan)?.currency}</p>
                
                <p className="mt-4"><strong>Option 2: Bank Transfer</strong></p>
                <p>Transfer to our bank account:</p>
                <p className="font-mono bg-blue-100 p-2 rounded">IBAN: TN59 10 006 123456789012 34</p>
                <p className="font-mono bg-blue-100 p-2 rounded">Amount: {plans.find(p => p.type === selectedPlan)?.price} {plans.find(p => p.type === selectedPlan)?.currency}</p>
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Receipt
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  {receiptFile ? receiptFile.name : 'Click to upload receipt'}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPEG, PNG, PDF (Max 5MB)
                </p>
              </div>
              {receiptFile && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <FileText className="w-4 h-4 mr-1" />
                  {receiptFile.name} ({Math.round(receiptFile.size / 1024)}KB)
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitPayment}
              disabled={!receiptFile || isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Payment</span>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Your access will be activated within 24 hours after payment verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
