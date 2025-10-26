import { supabase, Course, CoursePack, Payment } from './supabase';

export interface SubscriptionPlan {
  type: 'monthly' | 'yearly';
  price: number;
  duration: number; // in days
  currency: string;
  description: string;
}

export interface CourseAccessStatus {
  hasAccess: boolean;
  accessType: 'free' | 'monthly' | 'yearly' | 'expired' | 'none';
  expiresAt?: string;
  daysRemaining?: number;
  canAccess: boolean;
}

export class SubscriptionService {
  /**
   * Get subscription plans for a course
   */
  static getCoursePlans(course: Course | CoursePack): SubscriptionPlan[] {
    const plans: SubscriptionPlan[] = [];

    if (course.is_free) {
      return plans; // No paid plans for free courses
    }

    if (course.monthly_price > 0) {
      plans.push({
        type: 'monthly',
        price: course.monthly_price,
        duration: 30,
        currency: course.currency,
        description: 'Access for 30 days'
      });
    }

    if (course.yearly_price > 0) {
      plans.push({
        type: 'yearly',
        price: course.yearly_price,
        duration: 365,
        currency: course.currency,
        description: 'Access for 365 days'
      });
    }

    return plans;
  }

  /**
   * Check if user has access to a course
   */
  static async checkCourseAccess(userId: string, courseId: number): Promise<CourseAccessStatus> {
    try {
      // Get course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        return {
          hasAccess: false,
          accessType: 'none',
          canAccess: false
        };
      }

      // Free courses are accessible to everyone
      if (course.is_free) {
        return {
          hasAccess: true,
          accessType: 'free',
          canAccess: true
        };
      }

      // Check for active subscription
      const { data: access, error: accessError } = await supabase
        .from('course_access')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (accessError || !access) {
        return {
          hasAccess: false,
          accessType: 'none',
          canAccess: false
        };
      }

      const now = new Date();
      const endDate = new Date(access.end_date);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        hasAccess: true,
        accessType: access.plan_type,
        expiresAt: access.end_date,
        daysRemaining: Math.max(0, daysRemaining),
        canAccess: daysRemaining > 0
      };
    } catch (error) {
      console.error('Error checking course access:', error);
      return {
        hasAccess: false,
        accessType: 'none',
        canAccess: false
      };
    }
  }

  /**
   * Get user's subscription status
   */
  static async getUserSubscriptionStatus(userId: string): Promise<{
    status: 'free' | 'monthly' | 'yearly' | 'expired';
    startDate?: string;
    endDate?: string;
    daysRemaining?: number;
  }> {
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('subscription_status, subscription_start_date, subscription_end_date')
        .eq('user_id', userId)
        .single();

      if (error || !student) {
        return { status: 'free' };
      }

      let daysRemaining: number | undefined;
      if (student.subscription_end_date) {
        const now = new Date();
        const endDate = new Date(student.subscription_end_date);
        daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // If expired, update status
        if (daysRemaining <= 0) {
          await supabase
            .from('students')
            .update({ subscription_status: 'expired' })
            .eq('user_id', userId);
          
          return { status: 'expired' };
        }
      }

      return {
        status: student.subscription_status as 'free' | 'monthly' | 'yearly' | 'expired',
        startDate: student.subscription_start_date,
        endDate: student.subscription_end_date,
        daysRemaining
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { status: 'free' };
    }
  }

  /**
   * Get courses filtered by user category
   */
  static async getCoursesForUser(userId: string): Promise<Course[]> {
    try {
      // Get user's category
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('category_id')
        .eq('user_id', userId)
        .single();

      if (studentError || !student) {
        // If no category, return all courses
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        return courses || [];
      }

      // Get courses that match user's category or have no restrictions
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .or(`category_restrictions.is.null,category_restrictions.cs.{${student.category_id}}`)
        .order('created_at', { ascending: false });

      return courses || [];
    } catch (error) {
      console.error('Error getting courses for user:', error);
      return [];
    }
  }

  /**
   * Create a payment request
   */
  static async createPayment(
    userId: string,
    courseId: number,
    planType: 'monthly' | 'yearly',
    amount: number,
    currency: string = 'TND'
  ): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          course_id: courseId,
          plan_type: planType,
          amount,
          currency,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Upload receipt and update payment
   */
  static async uploadReceipt(
    paymentId: number,
    file: File
  ): Promise<{ receipt_url: string; receipt_filename: string }> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `receipts/${paymentId}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // Update payment record
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          receipt_url: publicUrl,
          receipt_filename: file.name
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      return {
        receipt_url: publicUrl,
        receipt_filename: file.name
      };
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  }

  /**
   * Approve payment and grant access (Admin only)
   */
  static async approvePayment(
    paymentId: number,
    adminUserId: string
  ): Promise<void> {
    try {
      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*, courses(*)')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) {
        throw new Error('Payment not found');
      }

      // Calculate access period
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + (payment.plan_type === 'monthly' ? 30 : 365));

      // Update payment status
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          status: 'approved',
          processed_by: adminUserId,
          processed_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (updatePaymentError) throw updatePaymentError;

      // Create course access
      const { error: accessError } = await supabase
        .from('course_access')
        .upsert({
          user_id: payment.user_id,
          course_id: payment.course_id,
          plan_type: payment.plan_type,
          payment_id: paymentId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true
        });

      if (accessError) throw accessError;

      // Update user subscription status
      const { error: userError } = await supabase
        .from('students')
        .update({
          subscription_status: payment.plan_type,
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString()
        })
        .eq('user_id', payment.user_id);

      if (userError) throw userError;
    } catch (error) {
      console.error('Error approving payment:', error);
      throw error;
    }
  }

  /**
   * Reject payment (Admin only)
   */
  static async rejectPayment(
    paymentId: number,
    adminUserId: string,
    reason?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'rejected',
          processed_by: adminUserId,
          processed_at: new Date().toISOString(),
          admin_notes: reason
        })
        .eq('id', paymentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting payment:', error);
      throw error;
    }
  }

  /**
   * Get pending payments (Admin only)
   */
  static async getPendingPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          courses(title, thumbnail_url),
          students(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting pending payments:', error);
      return [];
    }
  }

  /**
   * Get subscription analytics (Admin only)
   */
  static async getSubscriptionAnalytics(): Promise<{
    totalMonthlySubs: number;
    totalYearlySubs: number;
    activeUsers: number;
    expiringSoon: number;
    totalRevenue: number;
    pendingPayments: number;
  }> {
    try {
      // Get active subscriptions
      const { data: activeSubs, error: activeError } = await supabase
        .from('active_subscriptions')
        .select('*');

      if (activeError) throw activeError;

      // Get pending payments
      const { data: pendingPayments, error: pendingError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const totalMonthlySubs = activeSubs?.filter(sub => sub.plan_type === 'monthly').length || 0;
      const totalYearlySubs = activeSubs?.filter(sub => sub.plan_type === 'yearly').length || 0;
      const activeUsers = activeSubs?.length || 0;
      const expiringSoon = activeSubs?.filter(sub => sub.status === 'expiring_soon').length || 0;
      const totalRevenue = activeSubs?.reduce((sum, sub) => {
        return sum + (sub.plan_type === 'monthly' ? sub.monthly_price : sub.yearly_price);
      }, 0) || 0;

      return {
        totalMonthlySubs,
        totalYearlySubs,
        activeUsers,
        expiringSoon,
        totalRevenue,
        pendingPayments: pendingPayments?.length || 0
      };
    } catch (error) {
      console.error('Error getting subscription analytics:', error);
      return {
        totalMonthlySubs: 0,
        totalYearlySubs: 0,
        activeUsers: 0,
        expiringSoon: 0,
        totalRevenue: 0,
        pendingPayments: 0
      };
    }
  }
}
