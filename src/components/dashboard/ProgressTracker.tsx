import { TrendingUp, Target, Clock, Award } from 'lucide-react';

export default function ProgressTracker() {
  const lessonsCompleted = 29;
  const totalLessons = 90;
  const hoursStudied = 48;
  const averageScore = 87;
  const completionRate = Math.round((lessonsCompleted / totalLessons) * 100);

  const stats = [
    {
      label: 'Lessons Completed',
      value: lessonsCompleted,
      total: totalLessons,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Hours Studied',
      value: hoursStudied,
      suffix: 'hrs',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Average Score',
      value: averageScore,
      suffix: '%',
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Your Progress</h2>
        <TrendingUp className="w-6 h-6 text-green-600" />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-slate-700">Overall Completion</span>
          <span className="text-3xl font-bold text-blue-600">{completionRate}%</span>
        </div>
        <div className="relative w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${completionRate}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {lessonsCompleted} of {totalLessons} lessons completed
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`border-2 ${stat.borderColor} ${stat.bgColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <div className="text-right">
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                    {stat.suffix || ''}
                    {stat.total && <span className="text-slate-400 text-xl">/{stat.total}</span>}
                  </p>
                </div>
              </div>
              <p className="text-slate-600 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
        <p className="text-slate-700 text-center">
          <span className="font-semibold text-blue-600">Great progress!</span> Keep up the momentum and you'll reach your goals in no time.
        </p>
      </div>
    </div>
  );
}
