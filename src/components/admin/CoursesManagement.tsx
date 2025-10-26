import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  X,
  Clock,
  DollarSign,
  Users,
  Star
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  category: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_hours: number;
  price: number;
  thumbnail_url: string;
  video_url?: string;
  video_type?: 'youtube' | 'vimeo' | 'upload' | 'embed';
  is_published: boolean;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  view_count: number;
  enrollment_count: number;
  rating: number;
  review_count: number;
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    short_description: '',
    category: 'Web Development',
    difficulty_level: 'Beginner',
    duration_hours: 0,
    price: 0,
    thumbnail_url: '',
    video_url: '',
    video_type: 'youtube',
    is_published: false,
    is_featured: false,
    status: 'draft',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'published') {
      return matchesSearch && course.is_published;
    }
    if (filterStatus === 'draft') {
      return matchesSearch && course.status === 'draft';
    }
    if (filterStatus === 'archived') {
      return matchesSearch && course.status === 'archived';
    }
    return matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('courses')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Course updated successfully!');
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([{
            ...formData,
            view_count: 0,
            enrollment_count: 0,
            rating: 0,
            review_count: 0,
          }]);

        if (error) throw error;
        toast.success('Course created successfully!');
      }

      setShowAddForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        short_description: '',
        category: 'Web Development',
        difficulty_level: 'Beginner',
        duration_hours: 0,
        price: 0,
        thumbnail_url: '',
        video_url: '',
        video_type: 'youtube',
        is_published: false,
        is_featured: false,
        status: 'draft',
      });
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    }
  };

  const handleEdit = (course: Course) => {
    setFormData(course);
    setEditingId(course.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Course deleted successfully!');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          is_published: !course.is_published,
          status: !course.is_published ? 'published' : 'draft',
          published_at: !course.is_published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', course.id);

      if (error) throw error;
      toast.success(`Course ${!course.is_published ? 'published' : 'unpublished'} successfully!`);
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  };

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Cybersecurity',
    'Cloud Computing',
    'DevOps',
    'UI/UX Design',
    'Digital Marketing',
    'Business',
  ];

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
            Courses Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your academy's courses
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft' | 'archived')}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="all">All Courses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="relative">
              <img
                src={course.thumbnail_url || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => handleTogglePublish(course)}
                  className={`p-2 rounded-full ${
                    course.is_published
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={course.is_published ? 'Published' : 'Draft'}
                >
                  {course.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {course.is_featured && (
                  <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                    <Star className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
                  {course.category}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  course.difficulty_level === 'Beginner'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : course.difficulty_level === 'Intermediate'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {course.difficulty_level}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">
                {course.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {course.short_description || course.description}
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_hours}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollment_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${course.price}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No courses found</p>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {editingId ? 'Edit Course' : 'Add New Course'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({
                      title: '',
                      description: '',
                      short_description: '',
                      category: 'Web Development',
                      difficulty_level: 'Beginner',
                      duration_hours: 0,
                      price: 0,
                      thumbnail_url: '',
                      video_url: '',
                      video_type: 'youtube',
                      is_published: false,
                      is_featured: false,
                      status: 'draft',
                    });
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty_level || 'Beginner'}
                      onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_hours || 0}
                      onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={formData.price || 0}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnail_url || ''}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={formData.short_description || ''}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                    rows={2}
                    placeholder="Brief description for course cards..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                    rows={4}
                    required
                    placeholder="Detailed course description..."
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_published || false}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Published</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured || false}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Featured</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingId ? 'Update Course' : 'Create Course'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
