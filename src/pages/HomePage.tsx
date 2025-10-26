import { useEffect, useState } from 'react';
import { Star, ArrowRight, Clock, Award, TrendingUp } from 'lucide-react';
import { supabase, Course, Testimonial } from '../lib/supabase';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');

  useEffect(() => {
    fetchFeaturedCourses();
    fetchTestimonials();
  }, []);

  const fetchFeaturedCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .limit(3);
    if (data) setFeaturedCourses(data);
  };

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .limit(3);
    if (data) setTestimonials(data);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) throw error;

      setSubscribeStatus('Merci pour votre inscription!');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 3000);
    } catch {
      setSubscribeStatus('Erreur lors de l\'inscription.');
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Apprends. Progresse. Réussis avec PathTech Academy
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Des cours en ligne de qualité pour les étudiants et professionnels tunisiens.
                Accessible, flexible et abordable.
              </p>
              <button
                onClick={() => onNavigate('courses')}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
              >
                <span>Commencer à apprendre</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Étudiant en ligne"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Notre Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rendre l'éducation accessible, pratique et abordable pour tous les apprenants tunisiens,
              du lycée à la vie professionnelle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Apprentissage Flexible</h3>
              <p className="text-gray-600">
                Apprenez à votre rythme, où vous voulez et quand vous voulez.
                Accès 24/7 à tous vos cours.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-7 w-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Formateurs Certifiés</h3>
              <p className="text-gray-600">
                Nos formateurs sont des experts dans leurs domaines avec des années d'expérience.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Cours Accessibles à Tous</h3>
              <p className="text-gray-600">
                Des prix abordables et du contenu adapté à tous les niveaux d'apprentissage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cours Populaires
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez nos formations les plus demandées
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {course.level}
                    </span>
                    <span className="text-sm text-gray-500">{course.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <button
                    onClick={() => onNavigate('courses')}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    S'inscrire
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('courses')}
              className="inline-flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              <span>Voir tous les cours</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos étudiants
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des milliers d'apprenants satisfaits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <p className="font-semibold text-gray-900">{testimonial.student_name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Restez informé de nos nouveautés
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Inscrivez-vous à notre newsletter pour recevoir nos derniers cours et offres exclusives
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              S'inscrire
            </button>
          </form>
          {subscribeStatus && (
            <p className="mt-4 text-blue-100">{subscribeStatus}</p>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Suivez-nous sur YouTube
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Découvrez nos tutoriels gratuits et nos playlists éducatives
          </p>
          <a
            href="https://youtube.com/@pathtechacademy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <span>Visiter notre chaîne YouTube</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
