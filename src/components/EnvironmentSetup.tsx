import { AlertCircle, ExternalLink } from 'lucide-react';

export default function EnvironmentSetup() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Check if environment variables are properly set
  const isConfigured = supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseAnonKey !== 'your_supabase_anon_key';

  if (isConfigured) {
    return null; // Don't show anything if properly configured
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Environment Setup Required
          </h3>
          <p className="text-yellow-700 mb-4">
            The dashboard requires Supabase configuration to function properly. Please set up your environment variables.
          </p>
          
          <div className="bg-white rounded-md p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Required Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in your project root</li>
              <li>Copy the contents from <code className="bg-gray-100 px-1 rounded">env.example</code></li>
              <li>Replace the placeholder values with your actual Supabase credentials</li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="bg-white rounded-md p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Required Environment Variables:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <code className="bg-gray-100 px-2 py-1 rounded">VITE_SUPABASE_URL</code> - Your Supabase project URL
              </div>
              <div>
                <code className="bg-gray-100 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code> - Your Supabase anonymous key
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://supabase.com/docs/guides/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Supabase Setup Guide
            </a>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
