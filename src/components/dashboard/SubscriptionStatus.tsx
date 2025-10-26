import { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscriptionStatus } from '../../hooks/useAccessControl';
import { SubscriptionService } from '../../lib/subscription';

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const { 
    subscriptionStatus, 
    startDate, 
    endDate, 
    daysRemaining, 
    loading,
    isActive,
    isExpired,
    isExpiringSoon
  } = useSubscriptionStatus();

  const [subscriptionSummary, setSubscriptionSummary] = useState({
    activeSubscriptions: 0,
    expiringSoon: 0,
    totalSpent: 0,
    nextExpiration: null as string | null
  });

  const fetchSubscriptionSummary = useCallback(async () => {
    if (!user?.id) return;

    try {
      const summary = await SubscriptionService.getUserSubscriptionSummary(user.id);
      setSubscriptionSummary(summary);
    } catch (error) {
      console.error('Error fetching subscription summary:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchSubscriptionSummary();
    }
  }, [user, fetchSubscriptionSummary]);

  const getStatusColor = () => {
    if (isExpired) return 'text-red-600 bg-red-50';
    if (isExpiringSoon) return 'text-orange-600 bg-orange-50';
    if (isActive) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = () => {
    if (isExpired) return <AlertCircle className="w-5 h-5" />;
    if (isExpiringSoon) return <Clock className="w-5 h-5" />;
    if (isActive) return <CheckCircle className="w-5 h-5" />;
    return <CreditCard className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (isExpired) return 'Subscription Expired';
    if (isExpiringSoon) return `Expires in ${daysRemaining} days`;
    if (isActive) return `${subscriptionStatus === 'monthly' ? 'Monthly' : 'Yearly'} Subscription Active`;
    return 'Free Account';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Subscription Status</h2>
        <button
          onClick={fetchSubscriptionSummary}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-lg ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-2 font-medium">{getStatusText()}</span>
        </div>
        
        {isActive && startDate && endDate && (
          <div className="mt-3 text-sm text-slate-600">
            <p>Started: {new Date(startDate).toLocaleDateString()}</p>
            <p>Expires: {new Date(endDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Active Courses</p>
              <p className="text-2xl font-bold text-blue-900">{subscriptionSummary.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-900">{subscriptionSummary.expiringSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Spent */}
      {subscriptionSummary.totalSpent > 0 && (
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600 font-medium">Total Invested</p>
              <p className="text-2xl font-bold text-green-900">
                {subscriptionSummary.totalSpent} TND
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {isExpired && (
          <button
            onClick={() => window.location.href = '/courses'}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Renew Subscription
          </button>
        )}

        {isExpiringSoon && (
          <button
            onClick={() => window.location.href = '/courses'}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Renew Early
          </button>
        )}

        {!isActive && !isExpired && (
          <button
            onClick={() => window.location.href = '/courses'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Browse Premium Courses
          </button>
        )}

        <button
          onClick={() => window.location.href = '/courses'}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          View All Courses
        </button>
      </div>

      {/* Next Expiration Warning */}
      {subscriptionSummary.nextExpiration && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Upcoming Expiration:</strong> {new Date(subscriptionSummary.nextExpiration).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
