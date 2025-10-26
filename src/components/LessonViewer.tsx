import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Play, 
  CheckCircle,
  Clock,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { LessonWithProgress } from '../lib/supabase';
import { useCourseProgress } from '../hooks/useEnrollment';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

export default function LessonViewer() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const {
    lessons,
    loading,
    updateProgress,
    completeLesson
  } = useCourseProgress(parseInt(courseId || '0'));

  useEffect(() => {
    if (lessons.length > 0 && lessonId) {
      const lesson = lessons.find(l => l.id === parseInt(lessonId));
      if (lesson) {
        setCurrentLesson(lesson);
        
        // Update progress to "in_progress" when lesson is accessed
        if (lesson.progress?.status !== 'completed') {
          updateProgress(lesson.id, {
            status: 'in_progress',
            started_at: new Date().toISOString()
          });
        }
      }
    }
  }, [lessons, lessonId, updateProgress]);


  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    
    // Update progress every 10 seconds
    if (currentLesson && time > 0 && Math.floor(time) % 10 === 0) {
      const progressPercentage = Math.min((time / duration) * 100, 100);
      updateProgress(currentLesson.id, {
        progress_percentage: Math.floor(progressPercentage),
        last_position: Math.floor(time),
        time_spent: Math.floor(time)
      });
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;

    try {
      setIsCompleting(true);
      const result = await completeLesson(currentLesson.id);
      
      if (result.success) {
        toast.success('Lesson completed! Great job!');
        setCurrentLesson(prev => prev ? { ...prev, is_completed: true } : null);
      } else {
        toast.error(result.error || 'Failed to complete lesson');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('An error occurred while completing the lesson');
    } finally {
      setIsCompleting(false);
    }
  };

  const getNextLesson = () => {
    if (!currentLesson) return null;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    if (!currentLesson) return null;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    return currentIndex > 0 ? lessons[currentIndex - 1] : null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lesson Not Found</h2>
          <p className="text-gray-600">The requested lesson could not be found.</p>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
                <p className="text-gray-600">{currentLesson.course?.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentLesson.is_completed ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-50">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completed
                </span>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  disabled={isCompleting}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isCompleting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentLesson.progress?.progress_percentage || 0}%` }}
            />
          </div>

          {/* Lesson Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {currentLesson.estimated_duration} min
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {currentLesson.lesson_type}
              </span>
            </div>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative aspect-video bg-black">
            {currentLesson.video_url ? (
              <video
                className="w-full h-full"
                controls
                onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={currentLesson.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No video available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lesson Content</h2>
              <div className="prose max-w-none">
                {currentLesson.content ? (
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                ) : (
                  <p className="text-gray-600">{currentLesson.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Learning Objectives */}
            {currentLesson.learning_objectives && currentLesson.learning_objectives.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
                <ul className="space-y-2">
                  {currentLesson.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Navigation</h3>
              <div className="space-y-3">
                {previousLesson && (
                  <button
                    onClick={() => window.location.href = `/course/${courseId}/lesson/${previousLesson.id}`}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Previous</p>
                      <p className="font-medium text-gray-900">{previousLesson.title}</p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                )}

                {nextLesson && (
                  <button
                    onClick={() => window.location.href = `/course/${courseId}/lesson/${nextLesson.id}`}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Next</p>
                      <p className="font-medium text-gray-900">{nextLesson.title}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                )}

                {!nextLesson && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Course Complete!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
