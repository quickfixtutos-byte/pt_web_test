import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import AdminLoginPage from '../../pages/AdminLoginPage';
import AdminDashboard from '../../pages/AdminDashboard';
import AdminSetup from './AdminSetup';
import AdminDiagnostic from './AdminDiagnostic';
import AdminProtectedRoute from '../auth/AdminProtectedRoute';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminRoute() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (loading) return;

      if (!user) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }

      // Check if user is authenticated
      setIsAuthenticated(true);

      // Check if user is admin by email
      const isAdminUser = user.email === 'pathtechacademy@gmail.com';
      
      if (isAdminUser) {
        // Check if admin user exists in database
        try {
          const { data: adminData, error } = await supabase
            .from('students')
            .select('is_admin')
            .eq('email', 'pathtechacademy@gmail.com')
            .single();

          if (error && error.code === 'PGRST116') {
            // Admin user doesn't exist in database
            setNeedsSetup(true);
            setIsAdmin(false);
          } else if (adminData && adminData.is_admin) {
            setIsAdmin(true);
            setNeedsSetup(false);
          } else {
            setIsAdmin(false);
            setNeedsSetup(true);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setNeedsSetup(true);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setNeedsSetup(false);
      }
    };

    checkAdminStatus();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <div>
        <AdminLoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowDiagnostic(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            🔧 Diagnostic Tool
          </button>
        </div>
        {showDiagnostic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="relative">
              <button
                onClick={() => setShowDiagnostic(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                ✕
              </button>
              <AdminDiagnostic />
            </div>
          </div>
        )}
      </div>
    );
  }

  // If needs setup, show setup page
  if (needsSetup) {
    return <AdminSetup />;
  }

  // If authenticated but not admin, show access denied
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have permission to access the admin dashboard. Only authorized administrators can access this area.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and admin, show dashboard
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}
