import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Clock, Search, Filter, Play, Lock, CheckCircle, AlertCircle, Package, ArrowRight, GraduationCap, TrendingUp } from 'lucide-react';
import { CoursePack, CourseWithProgress } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useBulkPackAccessControl } from '../../hooks/usePackAccessControl';
import { useEnrollment } from '../../hooks/useEnrollment';
import { CoursePackService } from '../../lib/coursePackService';

interface PackWithAccess extends CoursePack {
  progress?: number;
  coursesCompleted?: number;
  totalCourses?: number;
  isFavorite?: boolean;
  lastAccessed?: string;
}

interface MyCoursesProps {
  showAll?: boolean;
}

export default function MyCoursesSection({ showAll = false }: MyCoursesProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [packs, setPacks] = useState<PackWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packs' | 'courses'>('courses');

  // Get access control for all packs
  const packIds = packs.map(pack => pack.id);
  const { accessMap, loading: accessLoading } = useBulkPackAccessControl(packIds);

  // Get enrolled courses
  const { enrolledCourses, loading: coursesLoading } = useEnrollment();

  const fetchUserPacks = useCallback(async () => {
    try {
      setLoading(true);
      const userPacks = await CoursePackService.getPacksForUser(user?.id || '');
      setPacks(userPacks);
    } catch (error) {
      console.error('Error fetching user packs:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserPacks();
    }
  }, [user, fetchUserPacks]);

  const categories = ['all', ...Array.from(new Set([
    ...packs.map(pack => pack.category?.name || 'Toutes catégories'),
    ...enrolledCourses.map(course => course.category || 'Toutes catégories')
  ]))];

  const filteredPacks = packs.filter((pack) => {
    const matchesSearch = pack.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pack.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedPacks = showAll ? filteredPacks : filteredPacks.slice(0, 3);
  const displayedCourses = showAll ? filteredCourses : filteredCourses.slice(0, 3);

  const getAccessStatus = (pack: PackWithAccess) => {
    const access = accessMap[pack.id];
    const hasAccess = access?.canAccess || pack.is_free;
    const isExpired = access?.accessType === 'expired';
    const isExpiringSoon = access?.daysRemaining !== undefined && access.daysRemaining <= 7 && access.daysRemaining > 0;

    if (pack.is_free) {
      return {
        type: 'free',
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        color: 'text-green-600 bg-green-50',
        label: 'Gratuit'
      };
    }

    if (hasAccess) {
      if (isExpiringSoon) {
        return {
          type: 'expiring',
          icon: <AlertCircle className="w-4 h-4 text-orange-600" />,
          color: 'text-orange-600 bg-orange-50',
          label: `Expire dans ${access?.daysRemaining} jours`
        };
      }
      return {
        type: 'active',
        icon: <CheckCircle className="w-4 h-4 text-blue-600" />,
        color: 'text-blue-600 bg-blue-50',
        label: `${access?.accessType === 'monthly' ? 'Mensuel' : 'Annuel'}`
      };
    }

    if (isExpired) {
      return {
        type: 'expired',
        icon: <AlertCircle className="w-4 h-4 text-red-600" />,
        color: 'text-red-600 bg-red-50',
        label: 'Expiré'
      };
    }

    return {
      type: 'locked',
      icon: <Lock className="w-4 h-4 text-gray-600" />,
      color: 'text-gray-600 bg-gray-50',
      label: 'Premium'
    };
  };

  const getCourseProgressStatus = (course: CourseWithProgress) => {
    const progress = course.progress || 0;
    
    if (progress === 100) {
      return {
        type: 'completed',
        icon: <GraduationCap className="w-4 h-4 text-green-600" />,
        color: 'text-green-600 bg-green-50',
        label: 'Terminé'
      };
    }
    
    if (progress > 0) {
      return {
        type: 'in_progress',
        icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
        color: 'text-blue-600 bg-blue-50',
        label: `${progress}% complété`
      };
    }
    
    return {
      type: 'not_started',
      icon: <Play className="w-4 h-4 text-gray-600" />,
      color: 'text-gray-600 bg-gray-50',
      label: 'Pas commencé'
    };
  };

  if (loading || accessLoading || coursesLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-slate-800">Mes Cours</h2>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'courses'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes Cours ({enrolledCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('packs')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'packs'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Packs ({packs.length})
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'courses' ? 'courses' : 'packs'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'courses' ? (
          // Render enrolled courses
          displayedCourses.map((course) => {
            const progressStatus = getCourseProgressStatus(course);
            
            return (
              <div
                key={course.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${progressStatus.color}`}>
                      {progressStatus.icon}
                      <span className="ml-1">{progressStatus.label}</span>
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 line-clamp-2">
                    {course.title}
                  </h3>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span className="font-medium">{course.difficulty_level}</span>
                      <span className="text-slate-500 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.lessons_count || 0} leçons
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{course.completed_lessons || 0} terminées</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.last_accessed ? new Date(course.last_accessed).toLocaleDateString() : 'Jamais accédé'}
                    </div>
                    <button
                      onClick={() => window.location.href = `/course/${course.id}`}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">
                        {course.next_lesson ? 'Continuer' : 'Voir le cours'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Render course packs
          displayedPacks.map((pack) => {
            const accessStatus = getAccessStatus(pack);
            const access = accessMap[pack.id];
            const hasAccess = access?.canAccess || pack.is_free;
            const isExpiringSoon = access?.daysRemaining !== undefined && access.daysRemaining <= 7 && access.daysRemaining > 0;

            return (
              <div
                key={pack.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pack.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                    alt={pack.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${accessStatus.color}`}>
                      {accessStatus.icon}
                      <span className="ml-1">{accessStatus.label}</span>
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      {pack.category?.name || 'Toutes catégories'}
                    </span>
                  </div>
                  {!hasAccess && !pack.is_free && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 line-clamp-2">
                    {pack.title}
                  </h3>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span className="font-medium">{pack.difficulty_level}</span>
                      <span className="text-slate-500 flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        {pack.courses_count || 0} cours
                      </span>
                    </div>
                    {pack.progress !== undefined && (
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pack.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {isExpiringSoon && (
                    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-800">
                        <strong>Expire dans {access?.daysRemaining} jours</strong>
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {pack.lastAccessed || 'Pas encore accédé'}
                    </div>
                    <button 
                      onClick={() => window.location.href = `/pack/${pack.id}`}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                        hasAccess
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">
                        {hasAccess ? 'Voir le pack' : 'S\'abonner'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeTab === 'courses' ? (
        filteredCourses.length === 0 && !loading && !accessLoading && !coursesLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Aucun cours trouvé
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Aucun cours ne correspond à vos critères de recherche.'
                : 'Vous n\'êtes pas encore inscrit à des cours. Explorez nos cours disponibles et inscrivez-vous!'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )
      ) : (
        filteredPacks.length === 0 && !loading && !accessLoading && !coursesLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Aucun pack trouvé
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Aucun pack ne correspond à vos critères de recherche.'
                : 'Les packs de cours ne sont pas encore disponibles. Veuillez exécuter le script de base de données pour créer les tables nécessaires.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )
      )}

      {!showAll && (
        <div className="text-center mt-6">
          <button className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors">
            View All {activeTab === 'courses' ? 'Courses' : 'Packs'} →
          </button>
        </div>
      )}
    </div>
  );
}