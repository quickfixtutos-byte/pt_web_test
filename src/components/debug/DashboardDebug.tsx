import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEnrollment } from '../../hooks/useEnrollment';
import { supabase } from '../../lib/supabase';

export default function DashboardDebug() {
  const { user, loading: authLoading } = useAuth();
  const { enrolledCourses, loading: coursesLoading } = useEnrollment();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      try {
        setLoading(true);
        
        // Test 1: Check if user is authenticated
        console.log('User:', user);
        console.log('Auth Loading:', authLoading);
        
        // Test 2: Check if courses table exists
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .limit(5);

        console.log('Courses:', courses);
        console.log('Courses Error:', coursesError);

        // Test 3: Check if course_enrollments table exists
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('course_enrollments')
          .select('*')
          .limit(5);

        console.log('Enrollments:', enrollments);
        console.log('Enrollments Error:', enrollmentsError);

        // Test 4: Check if students table exists
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .limit(5);

        console.log('Students:', students);
        console.log('Students Error:', studentsError);

        setDebugInfo({
          user: user ? { id: user.id, email: user.email } : null,
          authLoading,
          courses: { data: courses, error: coursesError?.message },
          enrollments: { data: enrollments, error: enrollmentsError?.message },
          students: { data: students, error: studentsError?.message },
          enrolledCourses: enrolledCourses.length,
          coursesLoading
        });
      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    runDebug();
  }, [user, authLoading, enrolledCourses, coursesLoading]);

  if (loading) {
    return <div className="p-4">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Dashboard Debug Info</h3>
      <pre className="text-sm bg-white p-4 rounded overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
