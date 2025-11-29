
import { LucideIcon } from 'lucide-react';

// ============================================
// UI & NAVIGATION TYPES
// ============================================

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

// Favori sağlayıcılar için hafif partner özeti
export interface FavoritePartner {
  id: string;
  name: string;
  rating?: number;
  services?: string[];
  phone?: string;
  image?: string;
  location?: string;
}

export interface CustomerFavorite {
  id: string;          // favorite row id
  customerId: string;  // customer (auth user) id
  partnerId: string;   // partner id
  createdAt: string;   // eklenme zamanı
  partner?: FavoritePartner; // join edilmiş partner bilgisi
}

// ============================================
// PARTNER (B2B) TYPES
// ============================================

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
  estimatedPrice?: number; // Estimated price for customer
  notes?: string; // Additional notes
}

// ============================================
// CUSTOMER (B2C) TYPES
// ============================================

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

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  type: 'home' | 'work';
  address: string;
  city: string;
  district: string;
  created_at?: string;
}

// B2C Request (Talep) yapısı - TEK KAYNAK
export interface Request {
  id: string;
  customerId: string;
  customerName?: string; // Admin görüntülemesi için
  serviceType: string; // cekici | aku | lastik | yakit | yardim
  description: string;
  fromLocation: string;
  toLocation?: string;
  vehicleInfo?: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled' | 'in_progress';
  createdAt: string;
  amount?: number; // Tamamlanan işler için tutar
  
  // İş takibi alanları (Partner yola çıktığında doldurulur)
  jobStage?: 0 | 1 | 2 | 3 | 4; // 0: Yola çıkıldı, 1: Varış, 2: Yükleme, 3: Teslimat, 4: Tamamlandı
  assignedPartnerId?: string; // İşi üstlenen partner ID
  assignedPartnerName?: string; // İşi üstlenen partner adı
  stageUpdatedAt?: string; // Son aşama güncellemesi
  
  // Genişletilmiş alanlar (QuoteWizard'dan)
  vehicleCondition?: 'running' | 'broken'; // Araç çalışır/arızalı durumu
  hasLoad?: boolean; // Yük var mı?
  loadDescription?: string; // Yük açıklaması
  damagePhotoUrls?: string[]; // Hasar fotoğrafları (base64 veya URL)
  timing?: 'now' | 'week' | 'later'; // Zamanlama
  customerPhone?: string; // Müşteri telefonu
}

// B2B Offer (Teklif) yapısı
export interface Offer {
  id: string;
  requestId: string;
  partnerId: string;
  partnerName?: string;
  price: number;
  etaMinutes: number;
  message?: string;
  status: 'sent' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}

// ============================================
// ADMIN TYPES
// ============================================

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  SUPPORT = 'support',
  FINANCE = 'finance',
  OPERATIONS = 'operations',
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  createdAt: string;
}

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

// Admin tarafından görüntülenen müşteri talepleri (Request'ten türetilir)
export interface CustomerRequestLog {
  id: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  location: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  createdAt: string;
  amount?: number;
  description?: string;
  vehicleInfo?: string;
  toLocation?: string;
}

// ============================================
// PARTNER REQUEST TYPES (B2B Admin İşlemleri)
// ============================================

export interface PartnerLeadRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  requestType: 'lead_purchase';
  serviceArea: string;
  serviceType: string;
  creditCost: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNotes?: string;
  customerInfo?: {
    name: string;
    phone: string;
    location: string;
  };
}

export interface ServiceAreaRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  requestType: 'area_expansion';
  currentAreas: string[];
  requestedAreas: string[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNotes?: string;
}

export interface PartnerSupportRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  requestType: 'support' | 'billing' | 'technical' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  attachments?: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
}

// ============================================
// DOCUMENT & REVIEW TYPES
// ============================================

export interface PartnerDocument {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'license' | 'insurance' | 'registration' | 'tax' | 'identity';
  fileName: string;
  fileSize: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  expiryDate?: string;
  rejectionReason?: string;
  fileData?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PartnerReview {
  id: string;
  jobId: string;
  partnerId: string;
  partnerName: string;
  customerId: string;
  customerName: string;
  service: string;
  rating: number;
  comment: string;
  tags: string[];
  date: string;
  objection?: {
    id: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  };
}

export interface ReviewObjection {
  id: string;
  reviewId: string;
  partnerId: string;
  partnerName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNotes?: string;
}

// ============================================
// SUPPORT & TICKET TYPES
// ============================================

export interface SupportTicket {
  id: string;
  partnerId: string;
  partnerName: string;
  category: 'general' | 'technical' | 'billing' | 'account' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
  attachments?: string[];
}

// ============================================
// VEHICLE & FLEET TYPES
// ============================================

export interface PartnerVehicle {
  id: string;
  partnerId: string;
  partnerName: string;
  plate: string;
  model: string;
  type: string;
  driver: string;
  status: 'active' | 'maintenance' | 'disabled';
  registrationDate: string;
  lastService?: string;
  totalJobs: number;
  totalEarnings: number;
  image?: string;
}

// ============================================
// CREDIT & FINANCIAL TYPES
// ============================================

export interface PartnerCredit {
  partnerId: string;
  partnerName: string;
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  lastTransaction: string;
}

export interface CreditTransaction {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'purchase' | 'usage' | 'adjustment' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  date: string;
  requestId?: string;
  adminUser?: string;
}

// ============================================
// ROUTE & LOGISTICS TYPES
// ============================================

export interface EmptyTruckRoute {
  id: string;
  partnerId: string;
  partnerName: string;
  fromCity: string;
  toCity: string;
  departureDate: string;
  vehicleType: string;
  vehiclePlate: string;
  availableCapacity: string;
  pricePerKm?: number;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

// ============================================
// JOB & HISTORY TYPES
// ============================================

export interface CompletedJob {
  id: string;
  partnerId: string;
  partnerName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  startLocation: string;
  endLocation?: string;
  distance?: number;
  startTime: string;
  completionTime: string;
  duration: number;
  totalAmount: number;
  commission: number;
  partnerEarning: number;
  paymentMethod: 'kredi_karti' | 'nakit' | 'havale';
  rating?: number;
  vehicleType: string;
  vehiclePlate: string;
  status: 'completed' | 'cancelled' | 'refunded';
}

// ============================================
// NOTIFICATION PREFERENCES TYPES
// ============================================

export interface CustomerNotificationPreferences {
  id: string;
  customerId: string;
  // Bildirim Kanalları
  emailEnabled: boolean;
  pushEnabled: boolean;
  // Bildirim Türleri
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  createdAt: string;
  updatedAt: string;
}
