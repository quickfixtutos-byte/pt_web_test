import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

export default function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Check if it's the admin email
    if (email !== 'pathtechacademy@gmail.com') {
      setError('Access denied. Admin credentials required.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      onLoginSuccess();
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Show more detailed error information
      let errorMessage = 'Invalid admin credentials. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed. Please check your email or contact support.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else {
          errorMessage = `Login error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-600 rounded-2xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Access</h1>
          <p className="text-slate-600">Sign in to access the admin dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pathtechacademy@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Access Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              <strong>Admin Credentials:</strong><br />
              Email: pathtechacademy@gmail.com<br />
              Password: admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
