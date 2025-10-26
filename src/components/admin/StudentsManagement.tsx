import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Search, 
  Eye, 
  UserCheck, 
  UserX, 
  Award,
  Download
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  total_hours_studied: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  enrollments?: Array<{
    id: string;
    course_id: string;
    progress_percentage: number;
    lessons_completed: number;
    enrolled_at: string;
    completed_at: string | null;
    courses: {
      id: string;
      title: string;
      thumbnail_url: string;
    };
  }>;
  certificates?: Array<{
    id: string;
    course_id: string;
    issued_at: string;
    courses: {
      title: string;
    };
  }>;
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          enrollments (
            id,
            course_id,
            progress_percentage,
            lessons_completed,
            enrolled_at,
            completed_at,
            courses (
              id,
              title,
              thumbnail_url
            )
          ),
          certificates (
            id,
            course_id,
            issued_at,
            courses (
              title
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'active') {
      return matchesSearch && student.total_hours_studied > 0;
    }
    if (filterStatus === 'inactive') {
      return matchesSearch && student.total_hours_studied === 0;
    }
    return matchesSearch;
  });

  const handleToggleAdmin = async (studentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_admin: !currentStatus })
        .eq('id', studentId);

      if (error) throw error;
      
      toast.success(`Student ${!currentStatus ? 'promoted to admin' : 'demoted from admin'}`);
      fetchStudents();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Total Hours', 'Enrollments', 'Certificates', 'Joined Date'],
      ...filteredStudents.map(student => [
        student.full_name,
        student.email,
        student.total_hours_studied.toString(),
        student.enrollments?.length.toString() || '0',
        student.certificates?.length.toString() || '0',
        new Date(student.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
            Students Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage student accounts and track their progress
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="all">All Students</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Enrollments
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Certificates
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt={student.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {student.full_name}
                          </p>
                          {student.is_admin && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(student.total_hours_studied, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {student.total_hours_studied}h
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {student.enrollments?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {student.certificates?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(student.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleAdmin(student.id, student.is_admin)}
                        className={`p-2 rounded-lg transition-colors ${
                          student.is_admin
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={student.is_admin ? 'Remove Admin' : 'Make Admin'}
                      >
                        {student.is_admin ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No students found</p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Student Details
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
                    {selectedStudent.avatar_url ? (
                      <img
                        src={selectedStudent.avatar_url}
                        alt={selectedStudent.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {selectedStudent.full_name}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedStudent.email}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Joined {new Date(selectedStudent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Enrollments */}
                <div>
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Enrolled Courses ({selectedStudent.enrollments?.length || 0})
                  </h5>
                  <div className="space-y-2">
                    {selectedStudent.enrollments?.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={enrollment.courses.thumbnail_url}
                            alt={enrollment.courses.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {enrollment.courses.title}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {enrollment.lessons_completed} lessons completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {enrollment.progress_percentage}%
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {enrollment.completed_at ? 'Completed' : 'In Progress'}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                        No enrollments
                      </p>
                    )}
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Certificates ({selectedStudent.certificates?.length || 0})
                  </h5>
                  <div className="space-y-2">
                    {selectedStudent.certificates?.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {certificate.courses.title}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Issued {new Date(certificate.issued_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                        No certificates
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
