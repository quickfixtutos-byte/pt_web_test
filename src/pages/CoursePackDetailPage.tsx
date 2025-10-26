import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Package
} from 'lucide-react';
import { CoursePack } from '../lib/supabase';
import { CoursePackService } from '../lib/coursePackService';
import { useAuth } from '../hooks/useAuth';
import { usePackAccessControl } from '../hooks/usePackAccessControl';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentFlow from '../components/subscription/PaymentFlow';
import toast from 'react-hot-toast';

export default function CoursePackDetailPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pack, setPack] = useState<CoursePack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  const {
    canAccess,
    accessType,
    daysRemaining,
    isExpiringSoon
  } = usePackAccessControl(packId ? parseInt(packId) : 0);

  const fetchPack = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const packData = await CoursePackService.getPackWithCourses(parseInt(packId!));
      if (packData) {
        setPack(packData);
      } else {
        setError('Pack de cours non trouvé');
      }
    } catch (error) {
      console.error('Error fetching pack:', error);
      setError('Failed to load course pack. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [packId]);

  useEffect(() => {
    if (packId) {
      fetchPack();
    }
  }, [packId, fetchPack]);

  const handlePaymentComplete = () => {
    setShowPaymentFlow(false);
    toast.success('Payment submitted! We will review your receipt and activate your access within 24 hours.');
  };

  const getAccessStatus = () => {
    if (pack?.is_free) {
      return {
        type: 'free',
        message: 'Pack Gratuit',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        color: 'text-green-600 bg-green-50'
      };
    }

    if (canAccess) {
      return {
        type: 'active',
        message: `Accès Actif (${accessType === 'monthly' ? 'Mensuel' : 'Annuel'})`,
        icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
        color: 'text-blue-600 bg-blue-50'
      };
    }

    return {
      type: 'locked',
      message: 'Pack Premium',
      icon: <Lock className="w-5 h-5 text-gray-600" />,
      color: 'text-gray-600 bg-gray-50'
    };
  };


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Chargement du pack...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !pack) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pack non trouvé</h2>
          <p className="text-gray-600 mb-4">{error || 'Ce pack de cours n\'existe pas.'}</p>
          <button
            onClick={() => navigate('/my-courses')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  const accessStatus = getAccessStatus();
  const hasAccess = canAccess || pack.is_free;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate('/my-courses')}
            className="hover:text-blue-600 transition-colors"
          >
            Mes Cours
          </button>
          <span>/</span>
          <span className="text-gray-900">{pack.title}</span>
        </nav>

        {/* Pack Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={pack.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                alt={pack.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-2/3 p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {pack.level}
                  </span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                    {pack.difficulty_level}
                  </span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${accessStatus.color}`}>
                  {accessStatus.icon}
                  <span className="ml-1">{accessStatus.message}</span>
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{pack.title}</h1>
              <p className="text-gray-600 mb-6 text-lg">{pack.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">Cours</p>
                  <p className="text-lg font-semibold text-gray-900">{pack.courses_count || 0}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="text-lg font-semibold text-gray-900">Variable</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Étudiants</p>
                  <p className="text-lg font-semibold text-gray-900">+100</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-600">Note</p>
                  <p className="text-lg font-semibold text-gray-900">4.8</p>
                </div>
              </div>

              {isExpiringSoon && (
                <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800">
                    <strong>⚠️ Votre accès expire dans {daysRemaining} jours</strong>
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Renouvelez votre abonnement pour continuer à accéder à ce pack.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  {pack.is_free ? (
                    <span className="text-lg font-semibold text-green-600">Gratuit</span>
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">
                      {pack.monthly_price > 0 && (
                        <span>{pack.monthly_price} {pack.currency}/mois</span>
                      )}
                      {pack.monthly_price > 0 && pack.yearly_price > 0 && (
                        <span className="text-gray-400 mx-2">•</span>
                      )}
                      {pack.yearly_price > 0 && (
                        <span>{pack.yearly_price} {pack.currency}/an</span>
                      )}
                    </div>
                  )}
                </div>
                
                {user ? (
                  hasAccess ? (
                    <button
                      onClick={() => navigate('/my-courses')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Accéder aux cours
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPaymentFlow(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      S'abonner
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Se connecter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Courses in Pack */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cours dans ce pack ({pack.courses?.length || 0})
          </h2>

          {pack.courses && pack.courses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {pack.courses.map((course, index) => (
                <div
                  key={course.id}
                  className={`border rounded-lg p-6 transition-all ${
                    hasAccess 
                      ? 'border-gray-200 hover:border-blue-300 hover:shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.category}</p>
                      </div>
                    </div>
                    {hasAccess ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.short_description || course.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration_hours}h
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {course.difficulty_level}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (hasAccess) {
                          navigate(`/course/${course.id}`);
                        } else {
                          setShowPaymentFlow(true);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasAccess
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                      disabled={!hasAccess}
                    >
                      {hasAccess ? 'Voir le cours' : 'Verrouillé'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun cours disponible
              </h3>
              <p className="text-gray-600">
                Ce pack ne contient aucun cours pour le moment.
              </p>
            </div>
          )}
        </div>

        {/* Payment Flow Modal */}
        {showPaymentFlow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  S'abonner au pack
                </h3>
                <button
                  onClick={() => setShowPaymentFlow(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <PaymentFlow
                course={pack}
                onClose={() => setShowPaymentFlow(false)}
                onPaymentComplete={handlePaymentComplete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
