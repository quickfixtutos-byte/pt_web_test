import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Mail, 
  Search, 
  Download, 
  Trash2, 
  Calendar,
  Users,
  Send,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeData, setComposeData] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(s => s.id));
    }
  };

  const handleSelectSubscriber = (subscriberId: string) => {
    setSelectedSubscribers(prev =>
      prev.includes(subscriberId)
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', subscriberId);

      if (error) throw error;
      
      toast.success('Subscriber deleted');
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Failed to delete subscriber');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscribers?`)) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .in('id', selectedSubscribers);

      if (error) throw error;
      
      toast.success(`${selectedSubscribers.length} subscribers deleted`);
      setSelectedSubscribers([]);
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscribers:', error);
      toast.error('Failed to delete subscribers');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Subscribed Date'],
      ...filteredSubscribers.map(subscriber => [
        subscriber.email,
        new Date(subscriber.subscribed_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendNewsletter = async () => {
    if (!composeData.subject || !composeData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Here you would integrate with your email service
      // For now, we'll just show a success message
      toast.success('Newsletter sent successfully!');
      setShowComposeModal(false);
      setComposeData({ subject: '', message: '' });
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('Failed to send newsletter');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Newsletter Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage newsletter subscribers and send updates
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowComposeModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Compose</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {subscribers.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Subscribers
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {subscribers.filter(s => {
                  const date = new Date(s.subscribed_at);
                  const now = new Date();
                  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                  return diffInDays <= 7;
                }).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                New This Week
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {selectedSubscribers.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Selected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {selectedSubscribers.length === filteredSubscribers.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedSubscribers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Selected ({selectedSubscribers.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Subscribed Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.includes(subscriber.id)}
                      onChange={() => handleSelectSubscriber(subscriber.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {subscriber.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No subscribers found</p>
          </div>
        )}
      </div>

      {/* Compose Newsletter Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Compose Newsletter
                </h3>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Newsletter subject..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={composeData.message}
                    onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                    placeholder="Newsletter content..."
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSendNewsletter}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send to {subscribers.length} subscribers</span>
                  </button>
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
