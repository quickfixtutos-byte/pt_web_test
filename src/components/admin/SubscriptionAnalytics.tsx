import { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { SubscriptionService } from '../../lib/subscription';
import { ActiveSubscription } from '../../lib/supabase';

interface AnalyticsData {
  totalMonthlySubs: number;
  totalYearlySubs: number;
  activeUsers: number;
  expiringSoon: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function AnalyticsCard({ title, value, icon, color, trend }: AnalyticsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${
                trend.isPositive ? '' : 'rotate-180'
              }`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMonthlySubs: 0,
    totalYearlySubs: 0,
    activeUsers: 0,
    expiringSoon: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await SubscriptionService.getSubscriptionAnalytics();
      setAnalytics(data);
      
      // Load active subscriptions for detailed view
      // This would need to be implemented in the subscription service
      // For now, we'll use mock data
      setActiveSubscriptions([]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(amount);
  };


  const getRecentSubscriptions = () => {
    return activeSubscriptions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Analytics</h2>
          <p className="text-gray-600">Overview of subscription metrics and performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Monthly Subscriptions"
          value={analytics.totalMonthlySubs}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <AnalyticsCard
          title="Total Yearly Subscriptions"
          value={analytics.totalYearlySubs}
          icon={<Calendar className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        <AnalyticsCard
          title="Active Users"
          value={analytics.activeUsers}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsCard
          title="Expiring Soon"
          value={analytics.expiringSoon}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
        />
        <AnalyticsCard
          title="Pending Payments"
          value={analytics.pendingPayments}
          icon={<CreditCard className="w-6 h-6 text-yellow-600" />}
          color="bg-yellow-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Revenue chart will be implemented here</p>
            </div>
          </div>
        </div>

        {/* Subscription Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Types</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Monthly</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.totalMonthlySubs}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Yearly</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.totalYearlySubs}</span>
            </div>
            <div className="pt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ 
                    width: `${analytics.totalMonthlySubs + analytics.totalYearlySubs > 0 
                      ? (analytics.totalMonthlySubs / (analytics.totalMonthlySubs + analytics.totalYearlySubs)) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Subscriptions */}
      {analytics.expiringSoon > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subscriptions Expiring Soon</h3>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800">
              <strong>{analytics.expiringSoon}</strong> subscriptions will expire within the next 7 days.
            </p>
            <p className="text-orange-700 text-sm mt-1">
              Consider sending renewal reminders to these users.
            </p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {getRecentSubscriptions().length > 0 ? (
            getRecentSubscriptions().map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{subscription.full_name}</p>
                    <p className="text-xs text-gray-500">{subscription.course_title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 capitalize">{subscription.plan_type}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(subscription.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
