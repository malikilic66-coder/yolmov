import React from 'react';

export type StatusBadgeType = 'user' | 'partner' | 'request' | 'offer';

interface StatusBadgeProps {
  type: StatusBadgeType;
  status: string;
  className?: string;
}

const maps: Record<StatusBadgeType, Record<string, { label: string; classes: string }>> = {
  user: {
    active: { label: 'Aktif', classes: 'bg-green-100 text-green-700' },
    suspended: { label: 'Askıda', classes: 'bg-red-100 text-red-700' }
  },
  partner: {
    active: { label: 'Aktif', classes: 'bg-green-100 text-green-700' },
    pending: { label: 'Beklemede', classes: 'bg-yellow-100 text-yellow-700' },
    suspended: { label: 'Askıda', classes: 'bg-red-100 text-red-700' }
  },
  request: {
    open: { label: 'Açık', classes: 'bg-yellow-100 text-yellow-700' },
    matched: { label: 'Eşleşti', classes: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Tamamlandı', classes: 'bg-green-100 text-green-700' },
    cancelled: { label: 'İptal', classes: 'bg-red-100 text-red-700' }
  },
  offer: {
    sent: { label: 'Gönderildi', classes: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'Kabul', classes: 'bg-green-100 text-green-700' },
    rejected: { label: 'Red', classes: 'bg-red-100 text-red-700' }
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, className }) => {
  const def = maps[type][status] || { label: status, classes: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${def.classes} ${className || ''}`}>{def.label}</span>
  );
};

export default StatusBadge;
