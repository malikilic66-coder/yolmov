import { BarChart3, Users, Shield, FileText, DollarSign, PieChart, FileCheck, Truck, Star, Wallet, History, CreditCard } from 'lucide-react';
import { AdminRole } from '../../types';

export interface AdminTabDef {
  id: 'overview' | 'users' | 'partners' | 'requests' | 'offers' | 'reports' | 'documents' | 'fleet' | 'reviews' | 'financial' | 'credits' | 'job-history';
  label: string;
  icon: any; // Lucide icon component
  allowedRoles?: AdminRole[]; // empty => all roles
}

export const adminTabs: AdminTabDef[] = [
  { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
  { id: 'users', label: 'Kullanıcılar', icon: Users },
  { id: 'partners', label: 'Partnerler', icon: Shield },
  { id: 'requests', label: 'Talepler', icon: FileText },
  { id: 'offers', label: 'Teklifler', icon: DollarSign, allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE] },
  { id: 'documents', label: 'Belgeler', icon: FileCheck, allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS] },
  { id: 'fleet', label: 'Filo Yönetimi', icon: Truck, allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS] },
  { id: 'reviews', label: 'Değerlendirmeler', icon: Star, allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.SUPPORT] },
  { id: 'financial', label: 'Finansal İşlemler', icon: Wallet, allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE] },
  { id: 'credits', label: 'Kredi Yönetimi', icon: CreditCard, allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE] },
  { id: 'job-history', label: 'İş Geçmişi', icon: History },
  { id: 'reports', label: 'Raporlar', icon: PieChart, allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE] },
];
