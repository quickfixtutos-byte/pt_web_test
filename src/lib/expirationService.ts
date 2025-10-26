import { supabase } from './supabase';

export class ExpirationService {
  /**
   * Check and handle expired subscriptions
   * This should be called periodically (e.g., daily cron job or on app startup)
   */
  static async handleExpiredSubscriptions(): Promise<void> {
    try {
      // Get all active subscriptions that have expired
      const { data: expiredSubscriptions, error } = await supabase
        .from('course_access')
        .select(`
          *,
          students(user_id, full_name, email),
          courses(title)
        `)
        .eq('is_active', true)
        .lt('end_date', new Date().toISOString());

      if (error) {
        console.error('Error fetching expired subscriptions:', error);
        return;
      }

      if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
        return;
      }

      // Deactivate expired subscriptions
      const expiredIds = expiredSubscriptions.map(sub => sub.id);
      const { error: updateError } = await supabase
        .from('course_access')
        .update({ is_active: false })
        .in('id', expiredIds);

      if (updateError) {
        console.error('Error deactivating expired subscriptions:', updateError);
        return;
      }

      // Update user subscription status to expired
      const userIds = [...new Set(expiredSubscriptions.map(sub => sub.user_id))];
      const { error: userUpdateError } = await supabase
        .from('students')
        .update({ subscription_status: 'expired' })
        .in('user_id', userIds);

      if (userUpdateError) {
        console.error('Error updating user subscription status:', userUpdateError);
        return;
      }

      console.log(`Deactivated ${expiredSubscriptions.length} expired subscriptions`);
    } catch (error) {
      console.error('Error handling expired subscriptions:', error);
    }
  }

  /**
   * Get subscriptions expiring soon (within next 7 days)
   */
  static async getExpiringSoonSubscriptions(): Promise<{
    id: number;
    user_id: string;
    course_id: number;
    access_type: string;
    expires_at: string;
    created_at: string;
  }[]> {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data, error } = await supabase
        .from('course_access')
        .select(`
          *,
          students(user_id, full_name, email),
          courses(title)
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .lte('end_date', sevenDaysFromNow.toISOString())
        .order('end_date', { ascending: true });

      if (error) {
        console.error('Error fetching expiring subscriptions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting expiring subscriptions:', error);
      return [];
    }
  }

  /**
   * Send expiration reminder (this would integrate with email service)
   */
  static async sendExpirationReminders(): Promise<void> {
    try {
      const expiringSubscriptions = await this.getExpiringSoonSubscriptions();
      
      for (const subscription of expiringSubscriptions) {
        // Calculate days remaining
        const endDate = new Date(subscription.end_date);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Only send reminder if it's exactly 3 days or 1 day before expiration
        if (daysRemaining === 3 || daysRemaining === 1) {
          await this.sendExpirationEmail(subscription, daysRemaining);
        }
      }
    } catch (error) {
      console.error('Error sending expiration reminders:', error);
    }
  }

  /**
   * Send expiration email (placeholder - integrate with your email service)
   */
  private static async sendExpirationEmail(subscription: {
    id: number;
    user_id: string;
    course_id: number;
    access_type: string;
    expires_at: string;
    created_at: string;
  }, daysRemaining: number): Promise<void> {
    // This is a placeholder - integrate with your email service (SendGrid, AWS SES, etc.)
    console.log(`Sending expiration reminder to ${subscription.students.email} - ${daysRemaining} days remaining`);
    
    // Example email content
    console.log(`Email would be sent to ${subscription.user_id} - ${daysRemaining} days remaining`);

    // Here you would call your email service
    // await emailService.send(emailContent);
  }

  /**
   * Check if user has any active subscriptions
   */
  static async hasActiveSubscriptions(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('course_access')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .limit(1);

      if (error) {
        console.error('Error checking active subscriptions:', error);
        return false;
      }

      return (data && data.length > 0) || false;
    } catch (error) {
      console.error('Error checking active subscriptions:', error);
      return false;
    }
  }

  /**
   * Get user's subscription summary
   */
  static async getUserSubscriptionSummary(userId: string): Promise<{
    activeSubscriptions: number;
    expiringSoon: number;
    totalSpent: number;
    nextExpiration?: string;
  }> {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const [activeResult, expiringResult, paymentsResult] = await Promise.all([
        // Active subscriptions
        supabase
          .from('course_access')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .gt('end_date', now.toISOString()),
        
        // Expiring soon
        supabase
          .from('course_access')
          .select('end_date')
          .eq('user_id', userId)
          .eq('is_active', true)
          .gte('end_date', now.toISOString())
          .lte('end_date', sevenDaysFromNow.toISOString())
          .order('end_date', { ascending: true })
          .limit(1),
        
        // Total spent
        supabase
          .from('payments')
          .select('amount')
          .eq('user_id', userId)
          .eq('status', 'approved')
      ]);

      const activeSubscriptions = activeResult.data?.length || 0;
      const expiringSoon = expiringResult.data?.length || 0;
      const totalSpent = paymentsResult.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const nextExpiration = expiringResult.data?.[0]?.end_date;

      return {
        activeSubscriptions,
        expiringSoon,
        totalSpent,
        nextExpiration
      };
    } catch (error) {
      console.error('Error getting subscription summary:', error);
      return {
        activeSubscriptions: 0,
        expiringSoon: 0,
        totalSpent: 0
      };
    }
  }

  /**
   * Initialize expiration handling (call this on app startup)
   */
  static async initialize(): Promise<void> {
    try {
      // Handle expired subscriptions
      await this.handleExpiredSubscriptions();
      
      // Send expiration reminders (only in production)
      if (process.env.NODE_ENV === 'production') {
        await this.sendExpirationReminders();
      }
    } catch (error) {
      console.error('Error initializing expiration service:', error);
    }
  }
}

// Auto-initialize on import (for client-side)
if (typeof window !== 'undefined') {
  // Only run on client side and not during SSR
  ExpirationService.initialize().catch(console.error);
}
