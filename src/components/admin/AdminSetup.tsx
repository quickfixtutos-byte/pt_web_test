import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'check' | 'create' | 'complete'>('check');
  const [adminUser, setAdminUser] = useState<{
    id: string;
    full_name: string;
    email: string;
    is_admin: boolean;
    created_at: string;
  } | null>(null);
  const [error, setError] = useState('');

  const checkAdminUser = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if admin user exists in database
      const { data: adminData, error: adminError } = await supabase
        .from('students')
        .select('*')
        .eq('email', 'pathtechacademy@gmail.com')
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError;
      }

      if (adminData) {
        setAdminUser(adminData);
        if (adminData.is_admin) {
          setSetupStep('complete');
        } else {
          setError('Admin user exists but is not marked as admin');
        }
      } else {
        setSetupStep('create');
      }
    } catch (error) {
      console.error('Error checking admin user:', error);
      setError('Failed to check admin user status');
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    try {
      setLoading(true);
      setError('');

      // Create admin user profile
      const { data, error } = await supabase
        .from('students')
        .insert([{
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder - needs to be updated with actual user_id
          full_name: 'PathTech Admin',
          email: 'pathtechacademy@gmail.com',
          is_admin: true,
        }])
        .select()
        .single();

      if (error) throw error;

      setAdminUser(data);
      setSetupStep('complete');
      toast.success('Admin user created successfully!');
    } catch (error) {
      console.error('Error creating admin user:', error);
      setError('Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mb-4">
            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Admin Setup
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Set up the admin user for PathTech Academy
          </p>
        </div>

        {setupStep === 'check' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Setup Instructions
              </h3>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li>1. Create admin user in Supabase Auth with email: pathtechacademy@gmail.com</li>
                <li>2. Set password to: admin</li>
                <li>3. Copy the User ID from Supabase Auth</li>
                <li>4. Update the user_id in the database</li>
              </ol>
            </div>

            <button
              onClick={checkAdminUser}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Check Admin Status</span>
                </>
              )}
            </button>
          </div>
        )}

        {setupStep === 'create' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Admin User Not Found
                </h3>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                The admin user doesn't exist in the database. You need to create it first.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Required SQL Query:
              </h4>
              <div className="bg-slate-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                <div>INSERT INTO students (</div>
                <div>  user_id,</div>
                <div>  full_name,</div>
                <div>  email,</div>
                <div>  is_admin</div>
                <div>) VALUES (</div>
                <div>  'YOUR_USER_ID_HERE', -- Replace with actual user_id from Supabase Auth</div>
                <div>  'PathTech Admin',</div>
                <div>  'pathtechacademy@gmail.com',</div>
                <div>  true</div>
                <div>);</div>
              </div>
              <button
                onClick={() => copyToClipboard(`INSERT INTO students (user_id, full_name, email, is_admin) VALUES ('YOUR_USER_ID_HERE', 'PathTech Admin', 'pathtechacademy@gmail.com', true);`)}
                className="mt-2 flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Copy className="w-4 h-4" />
                <span>Copy SQL</span>
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSetupStep('check')}
                className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={createAdminUser}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Create Admin User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {setupStep === 'complete' && (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Admin Setup Complete!
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                The admin user has been set up successfully.
              </p>
            </div>

            {adminUser && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Admin User Details:
                </h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Name:</strong> {adminUser.full_name}</div>
                  <div><strong>Email:</strong> {adminUser.email}</div>
                  <div><strong>Admin:</strong> {adminUser.is_admin ? 'Yes' : 'No'}</div>
                  <div><strong>Created:</strong> {new Date(adminUser.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/admin'}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Go to Admin Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Need help? Check the <a href="/admin-setup-guide" className="text-blue-600 hover:text-blue-700">setup guide</a>
          </p>
        </div>
      </div>
    </div>
  );
}
