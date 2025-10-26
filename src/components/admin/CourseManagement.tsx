import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Save, X, Loader2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  thumbnail_url: string;
  youtube_playlist_url: string | null;
  price: number;
  duration_hours: number;
  total_lessons: number;
  is_published: boolean;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    level: 'Bac',
    category: 'Informatique',
    thumbnail_url: '',
    youtube_playlist_url: '',
    price: 0,
    duration_hours: 0,
    total_lessons: 0,
    is_published: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Course updated successfully!');
      } else {
        const { error } = await supabase.from('courses').insert([formData]);

        if (error) throw error;
        toast.success('Course added successfully!');
      }

      setShowAddForm(false);
      setEditingId(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save course';
      toast.error(errorMessage);
      console.error(error);
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
      const { error } = await supabase.from('courses').delete().eq('id', id);

      if (error) throw error;
      toast.success('Course deleted successfully!');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: 'Bac',
      category: 'Informatique',
      thumbnail_url: '',
      youtube_playlist_url: '',
      price: 0,
      duration_hours: 0,
      total_lessons: 0,
      is_published: true,
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Course Management</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {editingId ? 'Edit Course' : 'Add New Course'}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Bac</option>
                <option>Université</option>
                <option>Professionnel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Informatique</option>
                <option>IA</option>
                <option>Bureautique</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                value={formData.duration_hours}
                onChange={(e) =>
                  setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Lessons
              </label>
              <input
                type="number"
                value={formData.total_lessons}
                onChange={(e) =>
                  setFormData({ ...formData, total_lessons: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                YouTube Playlist URL (Optional)
              </label>
              <input
                type="url"
                value={formData.youtube_playlist_url || ''}
                onChange={(e) =>
                  setFormData({ ...formData, youtube_playlist_url: e.target.value })
                }
                placeholder="https://youtube.com/playlist?list=..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Publish course</span>
              </label>
            </div>

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                <span>{editingId ? 'Update Course' : 'Add Course'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{course.title}</div>
                    <div className="text-sm text-slate-500 line-clamp-1">
                      {course.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{course.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{course.level}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No courses yet. Add your first course!</p>
          </div>
        )}
      </div>
    </div>
  );
}
