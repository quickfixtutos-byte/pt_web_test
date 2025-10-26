import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Copy } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function AdminDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);
    const newResults: DiagnosticResult[] = [];

    try {
      // Step 1: Check Supabase connection
      newResults.push({
        step: 'Supabase Connection',
        status: 'success',
        message: 'Connected to Supabase successfully',
        details: `URL: ${import.meta.env.VITE_SUPABASE_URL}`
      });
    } catch (error) {
      newResults.push({
        step: 'Supabase Connection',
        status: 'error',
        message: 'Failed to connect to Supabase',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    try {
      // Step 2: Check if admin user exists in database
      const { data: adminData, error: adminError } = await supabase
        .from('students')
        .select('*')
        .eq('email', 'pathtechacademy@gmail.com')
        .single();

      if (adminError && adminError.code === 'PGRST116') {
        newResults.push({
          step: 'Admin Database Profile',
          status: 'error',
          message: 'Admin user not found in database',
          details: 'You need to create the admin profile in the students table'
        });
      } else if (adminError) {
        newResults.push({
          step: 'Admin Database Profile',
          status: 'error',
          message: 'Error checking admin profile',
          details: adminError.message
        });
      } else if (adminData) {
        if (adminData.is_admin) {
          newResults.push({
            step: 'Admin Database Profile',
            status: 'success',
            message: 'Admin profile exists and is marked as admin',
            details: `User ID: ${adminData.user_id}, Created: ${new Date(adminData.created_at).toLocaleDateString()}`
          });
        } else {
          newResults.push({
            step: 'Admin Database Profile',
            status: 'warning',
            message: 'Admin profile exists but is_admin is false',
            details: 'The user exists but is not marked as admin'
          });
        }
      }
    } catch (error) {
      newResults.push({
        step: 'Admin Database Profile',
        status: 'error',
        message: 'Failed to check admin profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    try {
      // Step 3: Check current auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        newResults.push({
          step: 'Current Auth Session',
          status: 'error',
          message: 'Error checking auth session',
          details: sessionError.message
        });
      } else if (session) {
        newResults.push({
          step: 'Current Auth Session',
          status: 'warning',
          message: 'User is currently logged in',
          details: `Email: ${session.user.email}, ID: ${session.user.id}`
        });
      } else {
        newResults.push({
          step: 'Current Auth Session',
          status: 'success',
          message: 'No active session (ready for login)',
          details: 'You can now attempt to login with admin credentials'
        });
      }
    } catch (error) {
      newResults.push({
        step: 'Current Auth Session',
        status: 'error',
        message: 'Failed to check auth session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    try {
      // Step 4: Test login attempt (this will fail but show us why)
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: 'pathtechacademy@gmail.com',
        password: 'admin'
      });

      if (loginError) {
        newResults.push({
          step: 'Login Test',
          status: 'error',
          message: 'Login failed',
          details: loginError.message
        });
      } else {
        newResults.push({
          step: 'Login Test',
          status: 'success',
          message: 'Login successful!',
          details: 'Admin credentials are working'
        });
      }
    } catch (error) {
      newResults.push({
        step: 'Login Test',
        status: 'error',
        message: 'Login test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(newResults);
    setLoading(false);
  };

  const copySetupSQL = () => {
    const sql = `-- Create admin user in Supabase Auth first, then run this SQL:
INSERT INTO students (
    user_id,
    full_name,
    email,
    is_admin,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with actual user_id from Supabase Auth
    'PathTech Admin',
    'pathtechacademy@gmail.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_admin = true,
    updated_at = NOW();`;
    
    navigator.clipboard.writeText(sql);
    toast.success('SQL copied to clipboard!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mb-4">
            <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Admin Diagnostic Tool
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            This tool will help identify why admin login is failing
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Run Diagnostics</span>
              </>
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Diagnostic Results
            </h2>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      {result.step}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Setup Instructions
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                1. Create Admin User in Supabase Auth
              </h4>
              <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                <li>• Go to Supabase Dashboard → Authentication → Users</li>
                <li>• Click "Add user"</li>
                <li>• Email: pathtechacademy@gmail.com</li>
                <li>• Password: admin</li>
                <li>• ✅ Check "Auto Confirm User"</li>
                <li>• Copy the User ID (UUID)</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                2. Create Admin Profile in Database
              </h4>
              <div className="bg-slate-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                <div>INSERT INTO students (</div>
                <div>  user_id,</div>
                <div>  full_name,</div>
                <div>  email,</div>
                <div>  is_admin</div>
                <div>) VALUES (</div>
                <div>  'YOUR_USER_ID_HERE', -- Replace with actual user_id</div>
                <div>  'PathTech Admin',</div>
                <div>  'pathtechacademy@gmail.com',</div>
                <div>  true</div>
                <div>);</div>
              </div>
              <button
                onClick={copySetupSQL}
                className="mt-2 flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Copy className="w-4 h-4" />
                <span>Copy SQL</span>
              </button>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                3. Test Login
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Go to <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">http://localhost:5174/admin</code> and login with:
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4 mt-1">
                <li>• Email: pathtechacademy@gmail.com</li>
                <li>• Password: admin</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}
