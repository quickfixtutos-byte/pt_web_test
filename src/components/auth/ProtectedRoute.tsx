import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  onUnauthorized?: () => void;
}

export default function ProtectedRoute({ children, requireAdmin = false, onUnauthorized }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && (!user || (requireAdmin && !isAdmin))) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
  }, [loading, user, isAdmin, requireAdmin, onUnauthorized]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h2>
          <p className="text-slate-600 mb-6">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Access Required</h2>
          <p className="text-slate-600 mb-6">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
