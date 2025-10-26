import { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp, Clock, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../LoadingSpinner';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCertificates: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [
        studentsResult,
        coursesResult,
        enrollmentsResult,
        certificatesResult,
        activityResult,
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('enrollments').select('id', { count: 'exact' }),
        supabase.from('certificates').select('id', { count: 'exact' }),
        supabase
          .from('students')
          .select('full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const recentActivity = activityResult.data?.map((student, index) => ({
        id: `student-${index}`,
        type: 'student_registration',
        description: `${student.full_name} registered`,
        timestamp: student.created_at,
      })) || [];

      setStats({
        totalStudents: studentsResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalEnrollments: enrollmentsResult.count || 0,
        totalCertificates: certificatesResult.count || 0,
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'blue',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      label: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'green',
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      label: 'Active Enrollments',
      value: stats.totalEnrollments,
      icon: TrendingUp,
      color: 'purple',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      label: 'Certificates Issued',
      value: stats.totalCertificates,
      icon: Award,
      color: 'amber',
      change: '+15',
      changeType: 'positive' as const,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-600 dark:text-purple-400',
      },
      amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        icon: 'text-amber-600 dark:text-amber-400',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back! Here's what's happening with your academy.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          
          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${colors.icon}`} />
                <span className={`text-sm font-medium ${colors.text} bg-white dark:bg-slate-800 px-2 py-1 rounded-full`}>
                  {stat.change}
                </span>
              </div>
              <p className={`text-3xl font-bold ${colors.text} mb-1`}>
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Recent Activity
            </h2>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Add New Course
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                View All Students
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Issue Certificates
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors">
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Send Newsletter
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
