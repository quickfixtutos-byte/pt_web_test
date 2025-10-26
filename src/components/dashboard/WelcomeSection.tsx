import { BookOpen, Award, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function WelcomeSection() {
  const { user } = useAuth();
  const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const coursesEnrolled = 5;
  const coursesCompleted = 2;
  const certificatesEarned = 2;

  const stats = [
    {
      label: 'Courses Enrolled',
      value: coursesEnrolled,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Courses Completed',
      value: coursesCompleted,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Certificates Earned',
      value: certificatesEarned,
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, {studentName}!
            </h1>
            <p className="text-blue-100 text-lg">
              Keep learning. Keep growing. You're in control of your journey.
            </p>
          </div>
          <Clock className="w-16 h-16 text-white/20 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-blue-100 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
