import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SubscriptionService } from '../../lib/subscription';
import { useAuth } from '../../hooks/useAuth';

export default function CoursesDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<{
    courses: {
      data: unknown[];
      error?: string;
    };
    enrollments: {
      data: unknown[];
      error?: string;
    };
    subscriptions: {
      data: unknown[];
      error?: string;
    };
    profile: {
      data: unknown;
      error?: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      try {
        setLoading(true);
        
        // Test 1: Check if courses table exists and has data
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .limit(5);
        
        // Test 2: Check if user categories exist
        const { data: categories, error: categoriesError } = await supabase
          .from('user_categories')
          .select('*');
        
        // Test 3: If user is logged in, test user-specific course fetching
        let userCourses = null;
        if (user) {
          try {
            userCourses = await SubscriptionService.getCoursesForUser(user.id);
          } catch (error) {
            console.error('Error fetching user courses:', error);
          }
        }
        
        // Test 4: Check user profile
        let userProfile = null;
        if (user) {
          const { data: profile } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .single();
          userProfile = profile;
        }
        
        setDebugInfo({
          courses: {
            data: courses,
            error: coursesError,
            count: courses?.length || 0
          },
          categories: {
            data: categories,
            error: categoriesError,
            count: categories?.length || 0
          },
          userCourses: {
            data: userCourses,
            count: userCourses?.length || 0
          },
          userProfile: {
            data: userProfile,
            userId: user?.id,
            userEmail: user?.email
          },
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };
    
    runDebug();
  }, [user]);

  if (loading) {
    return <div className="p-4">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Courses Debug Information</h3>
      <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
