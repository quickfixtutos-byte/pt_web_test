import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MessageSquare, 
  Search, 
  Star, 
  Check, 
  X, 
  Eye,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface Testimonial {
  id: string;
  student_name: string;
  content: string;
  rating: number;
  created_at: string;
  is_approved?: boolean;
}

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'approved') {
      return matchesSearch && testimonial.is_approved;
    }
    if (filterStatus === 'pending') {
      return matchesSearch && !testimonial.is_approved;
    }
    return matchesSearch;
  });

  const handleApprove = async (testimonialId: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: true })
        .eq('id', testimonialId);

      if (error) throw error;
      
      toast.success('Testimonial approved');
      fetchTestimonials();
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast.error('Failed to approve testimonial');
    }
  };

  const handleReject = async (testimonialId: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: false })
        .eq('id', testimonialId);

      if (error) throw error;
      
      toast.success('Testimonial rejected');
      fetchTestimonials();
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      toast.error('Failed to reject testimonial');
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId);

      if (error) throw error;
      
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const handleViewDetails = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowDetails(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
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
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Testimonials Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Review and manage student testimonials
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search testimonials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'approved' | 'pending')}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="all">All Testimonials</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {filteredTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                      {testimonial.student_name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(testimonial.rating)}
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    testimonial.is_approved
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {testimonial.is_approved ? 'Approved' : 'Pending'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleViewDetails(testimonial)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {!testimonial.is_approved && (
                  <button
                    onClick={() => handleApprove(testimonial.id)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                
                {testimonial.is_approved && (
                  <button
                    onClick={() => handleReject(testimonial.id)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No testimonials found</p>
        </div>
      )}

      {/* Testimonial Details Modal */}
      {showDetails && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Testimonial Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {selectedTestimonial.student_name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(selectedTestimonial.rating)}
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {selectedTestimonial.rating}/5 stars
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Submitted {new Date(selectedTestimonial.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Testimonial Content */}
                <div>
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Testimonial
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{selectedTestimonial.content}"
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Status
                  </h5>
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${
                    selectedTestimonial.is_approved
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {selectedTestimonial.is_approved ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {selectedTestimonial.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  {!selectedTestimonial.is_approved && (
                    <button
                      onClick={() => {
                        handleApprove(selectedTestimonial.id);
                        setShowDetails(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  )}
                  
                  {selectedTestimonial.is_approved && (
                    <button
                      onClick={() => {
                        handleReject(selectedTestimonial.id);
                        setShowDetails(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      handleDelete(selectedTestimonial.id);
                      setShowDetails(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
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
