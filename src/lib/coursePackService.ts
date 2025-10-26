import { supabase, CoursePack, Course } from './supabase';

export interface PackAccessStatus {
  hasAccess: boolean;
  accessType: 'free' | 'monthly' | 'yearly' | 'expired' | 'none';
  expiresAt?: string;
  daysRemaining?: number;
  canAccess: boolean;
}

export class CoursePackService {
  /**
   * Get course packs for a specific user category
   */
  static async getPacksForUser(userId: string): Promise<CoursePack[]> {
    try {
      // First check if course_packs table exists by trying a simple query
      const { error: tableCheckError } = await supabase
        .from('course_packs')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.warn('course_packs table does not exist yet. Returning empty array.');
        return [];
      }

      // Get user's category
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('category_id')
        .eq('user_id', userId)
        .single();

      if (studentError || !student) {
        // If no category, return all published packs
        const { data: packs, error: packsError } = await supabase
          .from('course_packs')
          .select(`
            *,
            category:user_categories(*),
            courses_count:pack_courses(count)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (packsError) {
          console.warn('Error fetching packs:', packsError);
          return [];
        }
        return packs || [];
      }

      // Get packs that match user's category or have no restrictions
      const { data: packs, error: packsError } = await supabase
        .from('course_packs')
        .select(`
          *,
          category:user_categories(*),
          courses_count:pack_courses(count)
        `)
        .eq('is_published', true)
        .or(`category_id.is.null,category_id.eq.${student.category_id}`)
        .order('created_at', { ascending: false });

      if (packsError) {
        console.warn('Error fetching user packs:', packsError);
        return [];
      }
      return packs || [];
    } catch (error) {
      console.error('Error getting packs for user:', error);
      return [];
    }
  }

  /**
   * Get all published course packs (for non-authenticated users)
   */
  static async getAllPublishedPacks(): Promise<CoursePack[]> {
    try {
      // First check if course_packs table exists
      const { error: tableCheckError } = await supabase
        .from('course_packs')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.warn('course_packs table does not exist yet. Returning empty array.');
        return [];
      }

      const { data: packs, error } = await supabase
        .from('course_packs')
        .select(`
          *,
          category:user_categories(*),
          courses_count:pack_courses(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error getting all published packs:', error);
        return [];
      }
      return packs || [];
    } catch (error) {
      console.error('Error getting all published packs:', error);
      return [];
    }
  }

  /**
   * Get a specific course pack with its courses
   */
  static async getPackWithCourses(packId: number): Promise<CoursePack | null> {
    try {
      const { data: pack, error: packError } = await supabase
        .from('course_packs')
        .select(`
          *,
          category:user_categories(*)
        `)
        .eq('id', packId)
        .eq('is_published', true)
        .single();

      if (packError || !pack) return null;

      // Get courses in this pack
      const { data: packCourses, error: coursesError } = await supabase
        .from('pack_courses')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('pack_id', packId)
        .order('order_index', { ascending: true });

      if (coursesError) {
        console.error('Error getting pack courses:', coursesError);
        return { ...pack, courses: [], courses_count: 0 };
      }

      const courses = packCourses?.map(pc => pc.course).filter(Boolean) as Course[] || [];
      
      return {
        ...pack,
        courses,
        courses_count: courses.length
      };
    } catch (error) {
      console.error('Error getting pack with courses:', error);
      return null;
    }
  }

  /**
   * Check if user has access to a course pack
   */
  static async checkPackAccess(userId: string, packId: number): Promise<PackAccessStatus> {
    try {
      // Check if pack_access table exists
      const { error: tableCheckError } = await supabase
        .from('pack_access')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.warn('pack_access table does not exist yet. Returning no access.');
        return {
          hasAccess: false,
          accessType: 'none',
          canAccess: false
        };
      }

      // Get pack details
      const { data: pack, error: packError } = await supabase
        .from('course_packs')
        .select('*')
        .eq('id', packId)
        .single();

      if (packError || !pack) {
        return {
          hasAccess: false,
          accessType: 'none',
          canAccess: false
        };
      }

      // Free packs are accessible to everyone
      if (pack.is_free) {
        return {
          hasAccess: true,
          accessType: 'free',
          canAccess: true
        };
      }

      // Check for active pack access
      const { data: access, error: accessError } = await supabase
        .from('pack_access')
        .select('*')
        .eq('user_id', userId)
        .eq('pack_id', packId)
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
      console.error('Error checking pack access:', error);
      return {
        hasAccess: false,
        accessType: 'none',
        canAccess: false
      };
    }
  }

  /**
   * Get course materials for a specific course
   */
  static async getCourseMaterials(courseId: number): Promise<CourseMaterial[]> {
    try {
      const { data: materials, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return materials || [];
    } catch (error) {
      console.error('Error getting course materials:', error);
      return [];
    }
  }

  /**
   * Check if user has access to a specific course material
   */
  static async checkMaterialAccess(userId: string, materialId: number): Promise<boolean> {
    try {
      // Get material details
      const { data: material, error: materialError } = await supabase
        .from('course_materials')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('id', materialId)
        .single();

      if (materialError || !material || !material.course) {
        return false;
      }

      // Check if user has access to the course (either through pack or individual course access)
      const courseId = material.course.id;
      
      // Check individual course access
      const { data: courseAccess } = await supabase
        .from('course_access')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .limit(1)
        .maybeSingle();

      if (courseAccess) return true;

      // Check pack access
      const { data: packCourse } = await supabase
        .from('pack_courses')
        .select('pack_id')
        .eq('course_id', courseId)
        .single();

      if (packCourse) {
        const packAccessStatus = await this.checkPackAccess(userId, packCourse.pack_id);
        return packAccessStatus.canAccess;
      }

      return false;
    } catch (error) {
      console.error('Error checking material access:', error);
      return false;
    }
  }

  /**
   * Record material access
   */
  static async recordMaterialAccess(
    userId: string, 
    materialId: number, 
    progressPercentage: number = 0,
    completed: boolean = false
  ): Promise<void> {
    try {
      await supabase
        .from('material_access')
        .upsert({
          user_id: userId,
          material_id: materialId,
          progress_percentage: progressPercentage,
          completed: completed,
          accessed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording material access:', error);
    }
  }

  /**
   * Create a payment for a course pack
   */
  static async createPackPayment(
    userId: string,
    packId: number,
    planType: 'monthly' | 'yearly',
    amount: number,
    currency: string = 'TND'
  ) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          course_id: packId, // We'll use course_id field for pack_id
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
      console.error('Error creating pack payment:', error);
      throw error;
    }
  }

  /**
   * Approve pack payment and grant access (Admin only)
   */
  static async approvePackPayment(
    paymentId: number,
    adminUserId: string
  ): Promise<void> {
    try {
      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*, course_packs(*)')
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

      // Create pack access
      const { error: accessError } = await supabase
        .from('pack_access')
        .upsert({
          user_id: payment.user_id,
          pack_id: payment.course_id, // Using course_id field for pack_id
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
      console.error('Error approving pack payment:', error);
      throw error;
    }
  }
}
