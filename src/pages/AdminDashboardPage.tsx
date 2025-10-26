import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  BookOpen, 
  Settings as SettingsIcon, 
  LogOut,
  BarChart3,
  MessageSquare,
  Mail,
} from 'lucide-react';
import CourseManagement from '../components/admin/CourseManagement';
import DashboardOverview from '../components/admin/DashboardOverview';
import StudentsManagement from '../components/admin/StudentsManagement';
import TestimonialsManagement from '../components/admin/TestimonialsManagement';
import NewsletterManagement from '../components/admin/NewsletterManagement';
import AdminSettings from '../components/admin/AdminSettings';

type ViewType = 'overview' | 'courses' | 'students' | 'testimonials' | 'newsletter' | 'settings';

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };


  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'courses':
        return <CourseManagement />;
      case 'students':
        return <StudentsManagement />;
      case 'testimonials':
        return <TestimonialsManagement />;
      case 'newsletter':
        return <NewsletterManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img
                src="/no_background_white.png"
                alt="PathTech Academy"
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => (window.location.href = '/')}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                View Site
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview' as ViewType, label: 'Overview', icon: BarChart3 },
            { id: 'courses' as ViewType, label: 'Courses', icon: BookOpen },
            { id: 'students' as ViewType, label: 'Students', icon: Users },
            { id: 'testimonials' as ViewType, label: 'Testimonials', icon: MessageSquare },
            { id: 'newsletter' as ViewType, label: 'Newsletter', icon: Mail },
            { id: 'settings' as ViewType, label: 'Settings', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  currentView === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {renderView()}
      </div>
    </div>
  );
}
