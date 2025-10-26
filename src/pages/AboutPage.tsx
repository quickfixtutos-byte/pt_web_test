import { Target, Eye, Heart, Award, Users, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            À Propos de PathTech Academy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre mission est de démocratiser l'éducation en Tunisie en offrant des cours en ligne
            de qualité, accessibles à tous.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img
              src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Apprentissage en ligne"
              className="rounded-2xl shadow-xl"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              PathTech Academy est née d'une vision simple : rendre l'éducation de qualité
              accessible à tous les Tunisiens, peu importe leur localisation ou leurs moyens
              financiers.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Fondée en 2023, notre plateforme a rapidement grandi pour devenir une référence
              dans l'enseignement en ligne en Tunisie. Nous offrons des cours dans divers
              domaines, du baccalauréat aux formations professionnelles.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Aujourd'hui, nous comptons des milliers d'étudiants satisfaits et nous continuons
              d'innover pour offrir la meilleure expérience d'apprentissage possible.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-xl">
            <div className="bg-white/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Target className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Notre Mission</h2>
            <p className="text-blue-100 leading-relaxed">
              Offrir une éducation de qualité, pratique et abordable à tous les apprenants
              tunisiens, en utilisant les technologies modernes pour créer des expériences
              d'apprentissage engageantes et efficaces.
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-8 rounded-2xl shadow-xl">
            <div className="bg-white/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Eye className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Notre Vision</h2>
            <p className="text-teal-100 leading-relaxed">
              Devenir la plateforme d'apprentissage en ligne de référence en Tunisie et
              dans la région MENA, en aidant des millions d'apprenants à atteindre leurs
              objectifs éducatifs et professionnels.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nos Valeurs
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Passion</h3>
              <p className="text-gray-600">
                Nous sommes passionnés par l'éducation et nous nous engageons à aider chaque
                étudiant à réussir.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Excellence</h3>
              <p className="text-gray-600">
                Nous maintenons les plus hauts standards de qualité dans tous nos cours et
                services.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Accessibilité</h3>
              <p className="text-gray-600">
                L'éducation doit être accessible à tous, peu importe le lieu ou les moyens.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-2xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Globe className="h-12 w-12" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              L'Impact de l'Apprentissage en Ligne en Tunisie
            </h2>
            <p className="text-xl text-blue-100 mb-6 text-center">
              L'éducation en ligne transforme la façon dont les Tunisiens apprennent et se
              développent professionnellement.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <p className="text-blue-100">Étudiants Inscrits</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50+</div>
                <p className="text-blue-100">Cours Disponibles</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">95%</div>
                <p className="text-blue-100">Taux de Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
