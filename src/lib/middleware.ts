import { supabase } from './supabase';
import { AuthUser } from './auth';

export interface AuthenticatedRequest {
  user: AuthUser;
  isAdmin: boolean;
}

export interface MiddlewareOptions {
  requireAdmin?: boolean;
  requireEmailVerified?: boolean;
}

/**
 * Middleware to validate authentication and authorization
 */
export class AuthMiddleware {
  /**
   * Validate JWT token and get user data
   */
  static async validateAuth(
    token?: string,
    options: MiddlewareOptions = {}
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // If token is provided, set it in the session
      if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
          return { success: false, error: 'Invalid token' };
        }
      } else {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return { success: false, error: 'No active session' };
        }
      }

      // Get user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get user profile from students table
      const { data: profile, error: profileError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found' };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email || '',
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        isAdmin: profile.is_admin || false,
        isEmailVerified: user.email_confirmed_at !== null,
        createdAt: profile.created_at,
      };

      // Check admin requirement
      if (options.requireAdmin && !authUser.isAdmin) {
        return { success: false, error: 'Admin access required' };
      }

      // Check email verification requirement
      if (options.requireEmailVerified && !authUser.isEmailVerified) {
        return { success: false, error: 'Email verification required' };
      }

      return { success: true, user: authUser };
    } catch (error) {
      console.error('Auth validation error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Middleware for protected routes
   */
  static async protectRoute(
    token?: string,
    options: MiddlewareOptions = {}
  ): Promise<AuthenticatedRequest | null> {
    const result = await this.validateAuth(token, options);
    
    if (!result.success || !result.user) {
      return null;
    }

    return {
      user: result.user,
      isAdmin: result.user.isAdmin,
    };
  }

  /**
   * Middleware for admin-only routes
   */
  static async requireAdmin(token?: string): Promise<AuthenticatedRequest | null> {
    return this.protectRoute(token, { requireAdmin: true });
  }

  /**
   * Middleware for verified users only
   */
  static async requireVerified(token?: string): Promise<AuthenticatedRequest | null> {
    return this.protectRoute(token, { requireEmailVerified: true });
  }
}

/**
 * Input validation utilities
 */
export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    
    if (password.length > 128) {
      return { valid: false, message: 'Password must be less than 128 characters' };
    }

    return { valid: true };
  }

  /**
   * Validate name format
   */
  static isValidName(name: string): { valid: boolean; message?: string } {
    if (!name || name.trim().length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters' };
    }

    if (name.trim().length > 100) {
      return { valid: false, message: 'Name must be less than 100 characters' };
    }

    return { valid: true };
  }

  /**
   * Sanitize input string
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate course data
   */
  static validateCourseData(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || (typeof data.title === 'string' && data.title.trim().length < 3)) {
      errors.push('Title must be at least 3 characters');
    }

    if (!data.description || (typeof data.description === 'string' && data.description.trim().length < 10)) {
      errors.push('Description must be at least 10 characters');
    }

    if (!data.level || !['Bac', 'Université', 'Professionnel'].includes(data.level as string)) {
      errors.push('Level must be Bac, Université, or Professionnel');
    }

    if (!data.category || (typeof data.category === 'string' && data.category.trim().length < 2)) {
      errors.push('Category must be at least 2 characters');
    }

    if (data.price && (typeof data.price !== 'number' || isNaN(data.price) || data.price < 0)) {
      errors.push('Price must be a positive number');
    }

    if (data.duration_hours && (typeof data.duration_hours !== 'number' || isNaN(data.duration_hours) || data.duration_hours < 0)) {
      errors.push('Duration must be a positive number');
    }

    if (data.total_lessons && (typeof data.total_lessons !== 'number' || isNaN(data.total_lessons) || data.total_lessons < 0)) {
      errors.push('Total lessons must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Security utilities
 */
export class SecurityUtils {
  /**
   * Generate secure random string
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const crypto = window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto;
    
    if (crypto && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  }

  /**
   * Hash password (client-side hashing is not recommended for production)
   * This is just for demonstration - use server-side hashing
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();
    
    return (identifier: string): boolean => {
      const now = Date.now();
      const userRequests = requests.get(identifier) || [];
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => now - time < windowMs);
      
      if (validRequests.length >= maxRequests) {
        return false; // Rate limited
      }
      
      validRequests.push(now);
      requests.set(identifier, validRequests);
      return true; // Allowed
    };
  }
}
