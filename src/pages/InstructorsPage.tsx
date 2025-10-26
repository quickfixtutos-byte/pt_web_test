import { useEffect, useState } from 'react';
import { Award, BookOpen, Users } from 'lucide-react';
import { supabase, Instructor } from '../lib/supabase';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    const { data } = await supabase
      .from('instructors')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setInstructors(data);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nos Formateurs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rencontrez notre équipe d'experts passionnés et certifiés, prêts à vous accompagner
            dans votre parcours d'apprentissage.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Experts Certifiés</h3>
            <p className="text-gray-600">
              Tous nos formateurs sont certifiés et possèdent une expertise reconnue dans leur domaine.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="bg-teal-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pédagogues Expérimentés</h3>
            <p className="text-gray-600">
              Des années d'expérience dans l'enseignement et la formation professionnelle.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Toujours Disponibles</h3>
            <p className="text-gray-600">
              Nos formateurs sont là pour répondre à vos questions et vous accompagner.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={instructor.photo_url}
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {instructor.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">{instructor.expertise}</p>
                {instructor.bio && (
                  <p className="text-gray-600 text-sm">{instructor.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {instructors.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">Chargement des formateurs...</p>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Vous souhaitez rejoindre notre équipe?</h2>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Nous recherchons toujours des formateurs passionnés et qualifiés pour enrichir
            notre catalogue de cours.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Devenir Formateur
          </button>
        </div>
      </div>
    </div>
  );
}
