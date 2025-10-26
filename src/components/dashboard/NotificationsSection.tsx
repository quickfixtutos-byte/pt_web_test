import { Bell, CheckCircle, Info, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'update' | 'achievement';
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Course Available',
      message: 'Check out our new Advanced Python course for data analysis and automation.',
      type: 'announcement',
      isRead: false,
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Course Update',
      message: 'Machine Learning Fundamentals has been updated with new video lectures.',
      type: 'update',
      isRead: false,
      createdAt: '1 day ago',
    },
    {
      id: '3',
      title: 'Achievement Unlocked!',
      message: 'Congratulations! You have completed Microsoft Excel Mastery.',
      type: 'achievement',
      isRead: true,
      createdAt: '3 days ago',
    },
    {
      id: '4',
      title: 'Upcoming Webinar',
      message: 'Join our live webinar on AI trends this Friday at 3 PM.',
      type: 'announcement',
      isRead: true,
      createdAt: '5 days ago',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'update':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-green-50 border-green-200';
      case 'update':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-amber-50 border-amber-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative border-2 rounded-xl p-5 transition-all duration-300 ${
                notification.isRead
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : `${getNotificationColor(notification.type)} hover:shadow-lg`
              }`}
            >
              <button
                onClick={() => dismissNotification(notification.id)}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start space-x-4 pr-8">
                <div className="p-2 bg-white rounded-lg">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3
                      className={`text-lg font-semibold ${
                        notification.isRead ? 'text-slate-600' : 'text-slate-800'
                      }`}
                    >
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p
                    className={`text-sm mb-3 ${
                      notification.isRead ? 'text-slate-500' : 'text-slate-700'
                    }`}
                  >
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{notification.createdAt}</span>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No notifications</p>
            <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
