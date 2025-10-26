import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    onNavigate('home');
  };

  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'courses', label: 'Cours' },
    { id: 'instructors', label: 'Formateurs' },
    { id: 'about', label: 'À propos' },
    { id: 'contact', label: 'Contact' },
  ];

  const userNavItems = [
    { id: 'dashboard', label: 'Tableau de bord', href: '/dashboard' },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <img
              src="/no_background_white.png"
              alt="PathTech Academy"
              className="h-12 w-auto"
            />
            <span className="text-xl font-bold text-blue-600">PathTech Academy</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.label}
              </button>
            ))}
            <ThemeToggle className="mr-3" />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Account</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-slate-200 dark:border-gray-700">
                    {userNavItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.href) {
                            window.location.href = item.href;
                          } else {
                            onNavigate(item.id);
                          }
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Admin Panel
                      </button>
                    )}
                    <hr className="my-2 border-slate-200" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-4 text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
