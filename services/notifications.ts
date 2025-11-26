import { Request, Offer } from '../types';

const LS_KEYS = {
  notifications: 'yolmov_notifications'
};

export interface Notification {
  id: string;
  type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'request_matched' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string; // request or offer ID
}

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(prefix: string) {
  return prefix + '-' + Math.random().toString(36).slice(2, 9);
}

export function createNotification(data: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const notifications = load<Notification>(LS_KEYS.notifications);
  const notification: Notification = {
    id: genId('NOTIF'),
    timestamp: new Date().toISOString(),
    read: false,
    ...data
  };
  notifications.unshift(notification); // Add to beginning
  save(LS_KEYS.notifications, notifications);
  return notification;
}

export function getNotifications(): Notification[] {
  return load<Notification>(LS_KEYS.notifications);
}

export function markAsRead(notificationId: string) {
  const notifications = load<Notification>(LS_KEYS.notifications);
  const notif = notifications.find(n => n.id === notificationId);
  if (notif) {
    notif.read = true;
    save(LS_KEYS.notifications, notifications);
  }
}

export function markAllAsRead() {
  const notifications = load<Notification>(LS_KEYS.notifications);
  notifications.forEach(n => n.read = true);
  save(LS_KEYS.notifications, notifications);
}

export function clearNotifications() {
  localStorage.removeItem(LS_KEYS.notifications);
}

export function getUnreadCount(): number {
  const notifications = load<Notification>(LS_KEYS.notifications);
  return notifications.filter(n => !n.read).length;
}

// Helper: Trigger notification when offer is created
export function notifyOfferReceived(requestId: string, partnerId: string, price: number) {
  createNotification({
    type: 'offer_received',
    title: 'Yeni Teklif Alındı',
    message: `${partnerId} size ₺${price} tutarında teklif gönderdi.`,
    relatedId: requestId
  });
}

// Helper: Trigger notification when offer is accepted
export function notifyOfferAccepted(offerId: string, requestId: string) {
  createNotification({
    type: 'offer_accepted',
    title: 'Teklif Kabul Edildi',
    message: `Teklifiniz müşteri tarafından kabul edildi.`,
    relatedId: offerId
  });
}

// Helper: Trigger notification when offer is rejected
export function notifyOfferRejected(offerId: string, requestId: string) {
  createNotification({
    type: 'offer_rejected',
    title: 'Teklif Reddedildi',
    message: `Teklifiniz müşteri tarafından reddedildi.`,
    relatedId: offerId
  });
}

// Seed demo notifications
export function seedDemoNotifications() {
  if (getNotifications().length > 0) return;
  
  const demoNotifications = [
    {
      type: 'system' as const,
      title: 'Hoş Geldiniz! 🎉',
      message: 'YOLMOV platformuna hoş geldiniz! Yolda kaldığınız her an yanınızdayız.'
    },
    {
      type: 'offer_received' as const,
      title: 'Yeni Teklif Aldınız',
      message: 'Hızlı Çekici Hizmetleri size ₺850 tutarında teklif gönderdi. Teklifi görüntülemek için tıklayın.',
      relatedId: 'req-1'
    },
    {
      type: 'offer_received' as const,
      title: 'Yeni Teklif Aldınız',
      message: 'Express Yol Yardım size ₺900 tutarında teklif gönderdi.',
      relatedId: 'req-1'
    },
    {
      type: 'offer_accepted' as const,
      title: 'Teklif Kabul Edildi ✓',
      message: 'Güvenli Oto Servis teklifiniz müşteri tarafından kabul edildi. Hemen yola çıkın!',
      relatedId: 'offer-3'
    },
    {
      type: 'request_matched' as const,
      title: 'Talep Eşleşti',
      message: 'Yeni bir yol yardım talebi sizin bölgenizde! Hemen teklif gönderin.',
      relatedId: 'req-3'
    },
    {
      type: 'system' as const,
      title: 'Platform Güncellemesi',
      message: 'Yeni özellikler eklendi: Anlık konum paylaşımı, otomatik fiyatlandırma ve daha fazlası!'
    }
  ];

  demoNotifications.reverse().forEach(notif => {
    createNotification(notif);
  });
  
  console.log('✅ Demo notifications seeded:', demoNotifications.length);
}

