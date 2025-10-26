import { Youtube, Linkedin, Instagram, Mail } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
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
      setSubscribeStatus('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/no_background_white.png"
                alt="PathTech Academy"
                className="h-10 w-auto brightness-0 invert"
              />
              <span className="text-lg font-bold">PathTech Academy</span>
            </div>
            <p className="text-gray-400 text-sm">
              La plateforme d'apprentissage en ligne pour tous les Tunisiens
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cours
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  À propos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                S'abonner
              </button>
              {subscribeStatus && (
                <p className="text-xs text-green-400">{subscribeStatus}</p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            2024 PathTech Academy. Tous droits réservés.
          </p>
          <div className="flex space-x-6">
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="mailto:contact@pathtech.tn"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
