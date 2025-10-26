import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Youtube, Linkedin, Instagram, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus('Merci pour votre message! Nous vous répondrons dans les plus brefs délais.');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSubmitStatus('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(''), 5000);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une question? Une suggestion? N'hésitez pas à nous contacter. Notre équipe est là
            pour vous aider.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
                >
                  <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                  <Send className="h-5 w-5" />
                </button>

                {submitStatus && (
                  <div
                    className={`p-4 rounded-lg ${
                      submitStatus.includes('Merci')
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {submitStatus}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations de contact</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a
                      href="mailto:contact@pathtech.tn"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      contact@pathtech.tn
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                    <a href="tel:+21612345678" className="text-blue-600 hover:text-blue-700">
                      +216 12 345 678
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/21612345678"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      +216 12 345 678
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">Tunis, Tunisie</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Suivez-nous</h2>
              <p className="text-blue-100 mb-6">
                Restez connecté avec nous sur les réseaux sociaux pour ne rien manquer de nos
                actualités et nouveaux cours.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://youtube.com/@pathtechacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Youtube className="h-6 w-6" />
                </a>
                <a
                  href="https://linkedin.com/company/pathtech-academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
                <a
                  href="https://instagram.com/pathtechacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Horaires d'ouverture</h2>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span className="font-medium text-gray-900">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-medium text-gray-900">9h00 - 14h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-medium text-gray-900">Fermé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
