import { Award, Download, Share2, Calendar } from 'lucide-react';

interface Certificate {
  id: string;
  courseTitle: string;
  issuedDate: string;
  certificateNumber: string;
  thumbnailUrl: string;
}

export default function CertificatesSection() {
  const mockCertificates: Certificate[] = [
    {
      id: '1',
      courseTitle: 'Microsoft Excel Mastery',
      issuedDate: 'March 15, 2025',
      certificateNumber: 'PTA-2025-001234',
      thumbnailUrl: 'https://images.pexels.com/photos/7947664/pexels-photo-7947664.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      courseTitle: 'Introduction to Python Programming',
      issuedDate: 'February 28, 2025',
      certificateNumber: 'PTA-2025-001189',
      thumbnailUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const upcomingAchievements = [
    {
      title: 'Machine Learning Expert',
      progress: 40,
      requirement: 'Complete Machine Learning Fundamentals',
    },
    {
      title: 'Web Developer',
      progress: 25,
      requirement: 'Complete Web Development with React',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Certificates</h2>
            <p className="text-slate-600 mt-1">
              {mockCertificates.length} {mockCertificates.length === 1 ? 'certificate' : 'certificates'} earned
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {mockCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCertificates.map((cert) => (
              <div
                key={cert.id}
                className="group border-2 border-slate-200 rounded-xl overflow-hidden hover:border-amber-400 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-800 p-6 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <img
                      src={cert.thumbnailUrl}
                      alt={cert.courseTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative z-10 text-center">
                    <Award className="w-16 h-16 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-white font-bold text-lg">Certificate of Completion</h3>
                  </div>
                </div>

                <div className="p-6 bg-white">
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">
                    {cert.courseTitle}
                  </h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Issued: {cert.issuedDate}
                    </div>
                    <div className="text-sm text-slate-500">
                      Certificate No: {cert.certificateNumber}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                      <Download className="w-4 h-4" />
                      <span className="font-medium">Download</span>
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg mb-2">No certificates yet</p>
            <p className="text-slate-400 text-sm">Complete your courses to earn certificates</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Upcoming Achievements</h2>
            <p className="text-slate-600 mt-1">Keep learning to unlock these certificates</p>
          </div>
        </div>

        <div className="space-y-4">
          {upcomingAchievements.map((achievement, index) => (
            <div
              key={index}
              className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <Award className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-slate-600">{achievement.requirement}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{achievement.progress}%</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
