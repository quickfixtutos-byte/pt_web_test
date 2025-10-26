import { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import MyCoursesSection from '../components/dashboard/MyCoursesSection';
import ProgressTracker from '../components/dashboard/ProgressTracker';
import ResourcesSection from '../components/dashboard/ResourcesSection';
import CertificatesSection from '../components/dashboard/CertificatesSection';
import NotificationsSection from '../components/dashboard/NotificationsSection';
import SubscriptionStatus from '../components/dashboard/SubscriptionStatus';
import DashboardDebug from '../components/debug/DashboardDebug';
import EnvironmentSetup from '../components/EnvironmentSetup';

type ViewType = 'dashboard' | 'courses' | 'certificates' | 'resources' | 'profile' | 'settings';

export default function StudentDashboardPage() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <EnvironmentSetup />
            <DashboardDebug />
            <WelcomeSection />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <MyCoursesSection />
              </div>
              <div className="space-y-6">
                <SubscriptionStatus />
                <ProgressTracker />
              </div>
            </div>
            <NotificationsSection />
          </div>
        );
      case 'courses':
        return <MyCoursesSection showAll />;
      case 'certificates':
        return <CertificatesSection />;
      case 'resources':
        return <ResourcesSection />;
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Profile Settings</h2>
            <p className="text-slate-600">Profile management coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Settings</h2>
            <p className="text-slate-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
