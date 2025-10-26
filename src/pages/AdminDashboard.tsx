import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  MessageSquare, 
  Mail, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  Award,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import CoursesManagement from '../components/admin/CoursesManagement';
import PaymentManagement from '../components/admin/PaymentManagement';
import SubscriptionAnalytics from '../components/admin/SubscriptionAnalytics';
import toast from 'react-hot-toast';

type ViewType = 'dashboard' | 'courses' | 'students' | 'instructors' | 'testimonials' | 'newsletter' | 'payments' | 'analytics' | 'settings';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalSignups: number;
  totalTestimonials: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalSignups: 0,
    totalTestimonials: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        coursesResult,
        studentsResult,
        testimonialsResult,
        activityResult,
      ] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('testimonials').select('id', { count: 'exact' }),
        supabase
          .from('students')
          .select('full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const recentActivity = activityResult.data?.map((student, index) => ({
        id: `activity-${index}`,
        type: 'student_registration',
        description: `${student.full_name} registered`,
        timestamp: student.created_at,
      })) || [];

      setStats({
        totalCourses: coursesResult.count || 0,
        totalStudents: studentsResult.count || 0,
        totalSignups: studentsResult.count || 0,
        totalTestimonials: testimonialsResult.count || 0,
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const navigationItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: Home },
    { id: 'courses' as ViewType, label: 'Courses', icon: BookOpen },
    { id: 'students' as ViewType, label: 'Students', icon: Users },
    { id: 'instructors' as ViewType, label: 'Instructors', icon: GraduationCap },
    { id: 'testimonials' as ViewType, label: 'Testimonials', icon: MessageSquare },
    { id: 'newsletter' as ViewType, label: 'Newsletter', icon: Mail },
    { id: 'payments' as ViewType, label: 'Payments', icon: CreditCard },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
  ];

  const renderDashboardHome = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back, {user?.user_metadata?.full_name || 'Admin'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Courses</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalCourses}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Signups</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalSignups}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Testimonials</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalTestimonials}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardHome();
      case 'courses':
        return <CoursesManagement />;
      case 'students':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Students Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Student management interface coming soon...</p>
          </div>
        );
      case 'instructors':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Instructors Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Instructor management interface coming soon...</p>
          </div>
        );
      case 'testimonials':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Testimonials Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Testimonial management interface coming soon...</p>
          </div>
        );
      case 'newsletter':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Newsletter Subscribers</h2>
            <p className="text-slate-600 dark:text-slate-400">Newsletter management interface coming soon...</p>
          </div>
        );
      case 'payments':
        return <PaymentManagement />;
      case 'analytics':
        return <SubscriptionAnalytics />;
      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Admin Settings</h2>
            <p className="text-slate-600 dark:text-slate-400">Settings interface coming soon...</p>
          </div>
        );
      default:
        return renderDashboardHome();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <img
              src="/no_background_white.png"
              alt="PathTech Academy"
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {navigationItems.find(item => item.id === currentView)?.label}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => (window.location.href = '/')}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                View Site
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {user?.user_metadata?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {user?.user_metadata?.full_name || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
