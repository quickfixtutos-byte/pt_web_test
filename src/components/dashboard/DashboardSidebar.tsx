import { Home, BookOpen, Award, FileText, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

type ViewType = 'dashboard' | 'courses' | 'certificates' | 'resources' | 'profile' | 'settings';

interface DashboardSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ currentView, onViewChange, isOpen, onToggle }: DashboardSidebarProps) {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: Home },
    { id: 'courses' as ViewType, label: 'My Courses', icon: BookOpen },
    { id: 'certificates' as ViewType, label: 'Certificates', icon: Award },
    { id: 'resources' as ViewType, label: 'Resources', icon: FileText },
    { id: 'profile' as ViewType, label: 'Profile', icon: User },
    { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
      </button>

      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onToggle}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <img
                src="/no_background_white.png"
                alt="PathTech Academy"
                className="h-10 w-auto"
              />
              <span className="text-xl font-semibold text-slate-800">PathTech</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
