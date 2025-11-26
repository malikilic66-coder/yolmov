import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, type Notification } from '../../services/notifications';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    const notifs = getNotifications();
    setNotifications(notifs);
    setUnreadCount(getUnreadCount());
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'offer_received':
        return '💰';
      case 'offer_accepted':
        return '✅';
      case 'offer_rejected':
        return '❌';
      case 'request_matched':
        return '🤝';
      case 'system':
        return '🔔';
      default:
        return '📬';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        aria-label="Bildirimler"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Bildirimler
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs text-slate-500">({unreadCount} okunmamış)</span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">Henüz bildiriminiz yok</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl shrink-0">{getNotificationIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></div>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(notif.timestamp).toLocaleString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
