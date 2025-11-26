import { BarChart3, Users, Shield, FileText, DollarSign, PieChart } from 'lucide-react';
import { AdminRole } from '../../types';

export interface AdminTabDef {
  id: 'overview' | 'users' | 'partners' | 'requests' | 'offers' | 'reports';
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
  { id: 'reports', label: 'Raporlar', icon: PieChart, allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE] },
];
