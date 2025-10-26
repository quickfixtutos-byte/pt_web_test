import { useEffect, useState, useCallback } from 'react';
import { Filter, Search, Lock, Clock, CheckCircle, Star, Users, TrendingUp, BookOpen } from 'lucide-react';
import { supabase, Course } from '../lib/supabase';
import { SubscriptionService } from '../lib/subscription';
import { useAuth } from '../hooks/useAuth';
import { useBulkAccessControl } from '../hooks/useAccessControl';
import CoursesDebug from '../components/debug/CoursesDebug';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('Tous');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccessFilter, setSelectedAccessFilter] = useState<string>('Tous');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get access control for all courses
  const courseIds = courses.map(course => course.id).filter(id => typeof id === 'number') as number[];
  const { accessMap, loading: accessLoading } = useBulkAccessControl(courseIds);

  const levels = ['Tous', 'Bac', 'Université', 'Professionnel'];
  const categories = [
    'Tous',
    'Développement Web',
    'Intelligence Artificielle',
    'Bureautique',
    'Informatique',
    'Mathématiques',
  ];

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user) {
        // Get courses filtered by user category
        const userCourses = await SubscriptionService.getCoursesForUser(user.id);
        console.log('Fetched courses for user:', userCourses);
        setCourses(userCourses);
        setFilteredCourses(userCourses);
      } else {
        // Get all published courses for non-authenticated users
        const { data, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
          
        if (fetchError) {
          console.error('Error fetching courses:', fetchError);
          setError('Failed to load courses. Please try again.');
          return;
        }
        
        console.log('Fetched courses for guest:', data);
        setCourses(data || []);
        setFilteredCourses(data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const filterCourses = useCallback(() => {
    let filtered = [...courses];

    if (selectedLevel !== 'Tous') {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by access type
    if (selectedAccessFilter !== 'Tous' && user) {
      filtered = filtered.filter((course) => {
        const access = accessMap[Number(course.id)];
        
        switch (selectedAccessFilter) {
          case 'Gratuit':
            return course.is_free;
          case 'Accès':
            return access?.canAccess || course.is_free;
          case 'Expiré':
            return access?.accessType === 'expired';
          case 'Premium':
            return !course.is_free && (!access || access.accessType === 'none');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return (a.duration_hours || 0) - (b.duration_hours || 0);
        case 'price':
          return (a.monthly_price || 0) - (b.monthly_price || 0);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, selectedLevel, selectedCategory, searchQuery, selectedAccessFilter, user, accessMap, sortBy]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nos Cours
          </h1>
          <p className="text-xl text-gray-600">
            Explorez notre catalogue de formations de qualité
          </p>
        </div>

        {/* Debug component - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8">
            <CoursesDebug />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showFilters ? 'Masquer' : 'Afficher'} Filtres
            </button>
          </div>

          <div className={`grid md:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un cours..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accès
                </label>
                <select
                  value={selectedAccessFilter}
                  onChange={(e) => setSelectedAccessFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tous">Tous</option>
                  <option value="Gratuit">Gratuit</option>
                  <option value="Accès">Avec accès</option>
                  <option value="Premium">Premium</option>
                  <option value="Expiré">Expiré</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Plus récent</option>
                <option value="oldest">Plus ancien</option>
                <option value="title">Titre (A-Z)</option>
                <option value="duration">Durée</option>
                <option value="price">Prix</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{filteredCourses.length}</h3>
            <p className="text-gray-600">Cours disponibles</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredCourses.filter(course => course.is_free).length}
            </h3>
            <p className="text-gray-600">Cours gratuits</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredCourses.filter(course => !course.is_free).length}
            </h3>
            <p className="text-gray-600">Cours premium</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredCourses.filter(course => course.level === 'Bac').length}
            </h3>
            <p className="text-gray-600">Cours Bac</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? 's' : ''}
            {user && (
              <span className="ml-2 text-sm text-blue-600">
                (Utilisateur connecté: {user.email})
              </span>
            )}
          </p>
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>Total courses: {courses.length}</p>
              <p>Filtered courses: {filteredCourses.length}</p>
              <p>Access loading: {accessLoading ? 'Yes' : 'No'}</p>
              <p>Access map keys: {Object.keys(accessMap).join(', ')}</p>
              <p>Selected filters: Level={selectedLevel}, Category={selectedCategory}, Access={selectedAccessFilter}</p>
            </div>
          )}
        </div>

        {accessLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Vérification des accès...</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const access = accessMap[Number(course.id)];
            const hasAccess = access?.canAccess || course.is_free;
            const isExpired = access?.accessType === 'expired';
            const isExpiringSoon = access?.daysRemaining !== undefined && access.daysRemaining <= 7 && access.daysRemaining > 0;

            const getAccessBadge = () => {
              if (course.is_free) {
                return (
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Gratuit
                  </span>
                );
              }
              
              if (hasAccess) {
                if (isExpiringSoon) {
                  return (
                    <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Expire bientôt
                    </span>
                  );
                }
                return (
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accès actif
                  </span>
                );
              }
              
              if (isExpired) {
                return (
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Expiré
                  </span>
                );
              }
              
              return (
                <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Premium
                </span>
              );
            };

            const getPriceDisplay = () => {
              if (course.is_free) return null;
              
              if (course.monthly_price > 0 && course.yearly_price > 0) {
                return (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{course.monthly_price} {course.currency || 'TND'}/mois</span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="font-medium">{course.yearly_price} {course.currency || 'TND'}/an</span>
                  </div>
                );
              }
              
              if (course.monthly_price > 0) {
                return (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{course.monthly_price} {course.currency || 'TND'}/mois</span>
                  </div>
                );
              }
              
              if (course.yearly_price > 0) {
                return (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{course.yearly_price} {course.currency || 'TND'}/an</span>
                  </div>
                );
              }
              
              return null;
            };

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 group"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!hasAccess && !course.is_free && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-medium text-white bg-black bg-opacity-70 px-2 py-1 rounded-full">
                      {course.difficulty_level}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {getAccessBadge()}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {course.level}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration_hours}h
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {course.category}
                    </span>
                    {getPriceDisplay()}
                  </div>
                  
                  {/* Course stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{Math.floor(Math.random() * 100) + 10} étudiants</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      <span>4.{Math.floor(Math.random() * 5) + 5}</span>
                    </div>
                  </div>
                  
                  {isExpiringSoon && (
                    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-800">
                        <strong>Expire dans {access?.daysRemaining} jours</strong>
                      </p>
                    </div>
                  )}
                  
                  <button 
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                      hasAccess
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      // Navigate to course detail page
                      window.location.href = `/course/${course.id}`;
                    }}
                  >
                    {hasAccess ? 'Voir le cours' : 'S\'abonner'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && !accessLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun cours trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {courses.length === 0 
                ? "Aucun cours n'est disponible pour le moment." 
                : "Essayez de modifier vos filtres ou votre recherche"
              }
            </p>
            {courses.length > 0 && (
              <button
                onClick={() => {
                  setSelectedLevel('Tous');
                  setSelectedCategory('Tous');
                  setSearchQuery('');
                  setSelectedAccessFilter('Tous');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
