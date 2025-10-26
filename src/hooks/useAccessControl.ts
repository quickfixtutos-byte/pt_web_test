import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { SubscriptionService, CourseAccessStatus } from '../lib/subscription';

interface AccessControlState {
  hasAccess: boolean;
  accessType: 'free' | 'monthly' | 'yearly' | 'expired' | 'none';
  expiresAt?: string;
  daysRemaining?: number;
  canAccess: boolean;
  loading: boolean;
  error?: string;
}

interface UseAccessControlReturn extends AccessControlState {
  checkAccess: (courseId: number) => Promise<void>;
  refreshAccess: () => Promise<void>;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

export function useAccessControl(courseId?: number): UseAccessControlReturn {
  const { user } = useAuth();
  const [state, setState] = useState<AccessControlState>({
    hasAccess: false,
    accessType: 'none',
    canAccess: false,
    loading: true,
  });

  const checkAccess = useCallback(async (targetCourseId: number) => {
    if (!user) {
      setState({
        hasAccess: false,
        accessType: 'none',
        canAccess: false,
        loading: false,
        error: 'User not authenticated'
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      const accessStatus = await SubscriptionService.checkCourseAccess(user.id, targetCourseId);
      
      setState({
        hasAccess: accessStatus.hasAccess,
        accessType: accessStatus.accessType,
        expiresAt: accessStatus.expiresAt,
        daysRemaining: accessStatus.daysRemaining,
        canAccess: accessStatus.canAccess,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking access:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check access'
      }));
    }
  }, [user]);

  const refreshAccess = useCallback(async () => {
    if (courseId) {
      await checkAccess(courseId);
    }
  }, [courseId, checkAccess]);

  useEffect(() => {
    if (courseId) {
      checkAccess(courseId);
    }
  }, [courseId, checkAccess]);

  const isExpiringSoon = state.daysRemaining !== undefined && state.daysRemaining <= 7 && state.daysRemaining > 0;
  const isExpired = state.daysRemaining !== undefined && state.daysRemaining <= 0;

  return {
    ...state,
    checkAccess,
    refreshAccess,
    isExpiringSoon,
    isExpired,
  };
}

// Hook for checking multiple courses at once
export function useBulkAccessControl(courseIds: number[]) {
  const { user } = useAuth();
  const [accessMap, setAccessMap] = useState<Record<number, CourseAccessStatus>>({});
  const [loading, setLoading] = useState(true);

  const checkBulkAccess = useCallback(async () => {
    if (!user || courseIds.length === 0) {
      setAccessMap({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const accessPromises = courseIds.map(async (courseId) => {
        const access = await SubscriptionService.checkCourseAccess(user.id, courseId);
        return { courseId, access };
      });

      const results = await Promise.all(accessPromises);
      const newAccessMap: Record<number, CourseAccessStatus> = {};
      
      results.forEach(({ courseId, access }) => {
        newAccessMap[courseId] = access;
      });

      setAccessMap(newAccessMap);
    } catch (error) {
      console.error('Error checking bulk access:', error);
    } finally {
      setLoading(false);
    }
  }, [user, courseIds]);

  useEffect(() => {
    checkBulkAccess();
  }, [checkBulkAccess]);

  return {
    accessMap,
    loading,
    refresh: checkBulkAccess,
    hasAccess: (courseId: number) => accessMap[courseId]?.canAccess || false,
    getAccessStatus: (courseId: number) => accessMap[courseId],
  };
}

// Hook for subscription status
export function useSubscriptionStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    subscriptionStatus: 'free' | 'monthly' | 'yearly' | 'expired';
    startDate?: string;
    endDate?: string;
    daysRemaining?: number;
    loading: boolean;
  }>({
    subscriptionStatus: 'free',
    loading: true,
  });

  const refreshStatus = useCallback(async () => {
    if (!user) {
      setStatus({
        subscriptionStatus: 'free',
        loading: false,
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const subscriptionData = await SubscriptionService.getUserSubscriptionStatus(user.id);
      setStatus({
        ...subscriptionData,
        loading: false,
      });
    } catch (error) {
      console.error('Error getting subscription status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    ...status,
    refresh: refreshStatus,
    isActive: status.subscriptionStatus === 'monthly' || status.subscriptionStatus === 'yearly',
    isExpired: status.subscriptionStatus === 'expired',
    isExpiringSoon: status.daysRemaining !== undefined && status.daysRemaining <= 7 && status.daysRemaining > 0,
  };
}
