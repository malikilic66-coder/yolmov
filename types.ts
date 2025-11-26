
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Advantage {
  id: string;
  title: string;
  icon: LucideIcon;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  image: string;
}

export interface Provider {
  id: string;
  name: string;
  serviceType: string;
  rating: number;
  reviewCount: number;
  distance: string; // e.g. "2.5 km"
  eta: string; // e.g. "15 dk"
  priceStart: number;
  isVerified: boolean;
  location: string;
  image: string;
}

export interface JobRequest {
  id: string;
  serviceType: string;
  location: string;
  dropoffLocation?: string; // New: Destination address
  distance: string;
  price: number; // Estimated earnings
  timestamp: string;
  customerName: string;
  vehicleInfo: string;
  urgency: 'high' | 'normal';
  expiresIn?: number; // New: Seconds left to accept
}

// Customer (B2C) user profile information
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  city?: string;
  district?: string;
  createdAt?: string;
}

// B2C Request (Talep) yapısı
export interface Request {
  id: string;
  customerId: string;
  serviceType: string; // cekici | aku | lastik | yakit | yardim
  description: string;
  fromLocation: string;
  toLocation?: string;
  vehicleInfo?: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  createdAt: string;
}

// B2B Offer (Teklif) yapısı
export interface Offer {
  id: string;
  requestId: string;
  partnerId: string; // ileride gerçek partner id
  price: number;
  etaMinutes: number;
  message?: string;
  status: 'sent' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}

// Admin User Roles
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  SUPPORT = 'support',
  FINANCE = 'finance',
  OPERATIONS = 'operations',
}

// Admin User
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  createdAt: string;
}

// System Log Entry
export interface SystemLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'approve' | 'reject' | 'delete' | 'update' | 'create';
  entity: 'user' | 'partner' | 'request' | 'offer' | 'document';
  entityId: string;
  details: string;
  timestamp: string;
}
