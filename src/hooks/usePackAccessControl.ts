import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { CoursePackService, PackAccessStatus } from '../lib/coursePackService';
import { supabase } from '../lib/supabase';

interface PackAccessControlState {
  hasAccess: boolean;
  accessType: 'free' | 'monthly' | 'yearly' | 'expired' | 'none';
  expiresAt?: string;
  daysRemaining?: number;
  canAccess: boolean;
  loading: boolean;
  error?: string;
}

interface UsePackAccessControlReturn extends PackAccessControlState {
  checkAccess: (packId: number) => Promise<void>;
  refreshAccess: () => Promise<void>;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

export function usePackAccessControl(packId?: number): UsePackAccessControlReturn {
  const { user } = useAuth();
  const [state, setState] = useState<PackAccessControlState>({
    hasAccess: false,
    accessType: 'none',
    canAccess: false,
    loading: true,
  });

  const checkAccess = useCallback(async (targetPackId: number) => {
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
      
      const accessStatus = await CoursePackService.checkPackAccess(user.id, targetPackId);
      
      setState({
        hasAccess: accessStatus.hasAccess,
        accessType: accessStatus.accessType,
        expiresAt: accessStatus.expiresAt,
        daysRemaining: accessStatus.daysRemaining,
        canAccess: accessStatus.canAccess,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking pack access:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check access'
      }));
    }
  }, [user]);

  const refreshAccess = useCallback(async () => {
    if (packId) {
      await checkAccess(packId);
    }
  }, [packId, checkAccess]);

  useEffect(() => {
    if (packId) {
      checkAccess(packId);
    }
  }, [packId, checkAccess]);

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

// Hook for checking multiple packs at once
export function useBulkPackAccessControl(packIds: number[]) {
  const { user } = useAuth();
  const [accessMap, setAccessMap] = useState<Record<number, PackAccessStatus>>({});
  const [loading, setLoading] = useState(true);

  const checkBulkAccess = useCallback(async () => {
    if (!user || packIds.length === 0) {
      setAccessMap({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check if pack_access table exists
      const { error: tableCheckError } = await supabase
        .from('pack_access')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.warn('pack_access table does not exist yet. Returning empty access map.');
        setAccessMap({});
        setLoading(false);
        return;
      }

      const accessPromises = packIds.map(async (packId) => {
        const access = await CoursePackService.checkPackAccess(user.id, packId);
        return { packId, access };
      });

      const results = await Promise.all(accessPromises);
      const newAccessMap: Record<number, PackAccessStatus> = {};
      
      results.forEach(({ packId, access }) => {
        newAccessMap[packId] = access;
      });

      setAccessMap(newAccessMap);
    } catch (error) {
      console.error('Error checking bulk pack access:', error);
      setAccessMap({});
    } finally {
      setLoading(false);
    }
  }, [user, packIds]);

  useEffect(() => {
    checkBulkAccess();
  }, [checkBulkAccess]);

  return {
    accessMap,
    loading,
    refresh: checkBulkAccess,
    hasAccess: (packId: number) => accessMap[packId]?.canAccess || false,
    getAccessStatus: (packId: number) => accessMap[packId],
  };
}
