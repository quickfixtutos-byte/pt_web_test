import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface PaymentStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  paymentId?: number;
  adminNotes?: string;
  processedAt?: string;
}

export function usePaymentStatus(courseId: number) {
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'none' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !courseId) {
      setLoading(false);
      return;
    }

    checkPaymentStatus();

    // Set up real-time subscription for payment status changes
    const channel = supabase
      .channel(`payment-status-${courseId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Payment status updated:', payload);
          if (payload.new.course_id === courseId) {
            setPaymentStatus({
              status: payload.new.status,
              paymentId: payload.new.id,
              adminNotes: payload.new.admin_notes,
              processedAt: payload.new.processed_at
            });
            
            // Show notification based on status
            if (payload.new.status === 'approved') {
              // Import toast dynamically to avoid SSR issues
              import('react-hot-toast').then(({ default: toast }) => {
                toast.success('🎉 Your payment has been approved! You now have access to the course.');
              });
            } else if (payload.new.status === 'rejected') {
              import('react-hot-toast').then(({ default: toast }) => {
                toast.error('❌ Your payment was rejected. Please check the admin notes and try again.');
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, courseId, checkPaymentStatus]);

  const checkPaymentStatus = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('id, status, admin_notes, processed_at')
        .eq('user_id', user?.id)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      setPaymentStatus({
        status: data?.status || 'none',
        paymentId: data?.id,
        adminNotes: data?.admin_notes,
        processedAt: data?.processed_at
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  const refreshStatus = () => {
    checkPaymentStatus();
  };

  return {
    paymentStatus,
    loading,
    refreshStatus,
    isPending: paymentStatus.status === 'pending',
    isApproved: paymentStatus.status === 'approved',
    isRejected: paymentStatus.status === 'rejected',
    hasPayment: paymentStatus.status !== 'none'
  };
}
