import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Shield, FileText, Search, Eye, Edit, Trash2, UserPlus, CheckCircle, DollarSign, Mail, Phone, Star } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import RequestDetailModal from './modals/RequestDetailModal';
import VehicleDetailModal from './modals/VehicleDetailModal';
import { AdminRole } from '../../types';
import { useAdminFilter } from './hooks/useAdminFilter';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import LoadingSkeleton from './ui/LoadingSkeleton';

const AdminOffersTab = lazy(() => import('./tabs/AdminOffersTab'));
const AdminReportsTab = lazy(() => import('./tabs/AdminReportsTab'));
const AdminDocumentsTab = lazy(() => import('./tabs/AdminDocumentsTab'));
const AdminFleetTab = lazy(() => import('./tabs/AdminFleetTab'));
const AdminReviewsTab = lazy(() => import('./tabs/AdminReviewsTab'));
const AdminFinancialTab = lazy(() => import('./tabs/AdminFinancialTab'));
const AdminCreditsTab = lazy(() => import('./tabs/AdminCreditsTab'));
const AdminJobHistoryTab = lazy(() => import('./tabs/AdminJobHistoryTab'));
const AdminRequestsTab = lazy(() => import('./tabs/AdminRequestsTab'));

import type { Vehicle } from './tabs/AdminFleetTab';

interface User {
  id: string; name: string; email: string;
  type: 'customer' | 'partner'; status: 'active' | 'suspended'; joinDate: string;
  totalSpent?: number; totalEarned?: number;
}
interface Partner {
  id: string; name: string; email: string; phone: string; rating: number;
  completedJobs: number; credits: number; status: 'active' | 'pending' | 'suspended';
}
// Müşteri teklif talepleri (B2C) - ayrı sekmede
interface CustomerRequestLog {
  id: string; customerId: string; customerName: string; serviceType: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled'; createdAt: string; amount?: number;
}

// Partner lead satın alma talebi (B2B)
interface PartnerLeadRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  requestType: 'lead_purchase';
  serviceArea: string; // "Kadıköy, İstanbul"
  serviceType: string; // "cekici", "aku" vb
  creditCost: number; // 1 kredi
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string; // Admin user
  adminNotes?: string;
  customerInfo?: { // Onay sonrası görünür
    name: string;
    phone: string;
    location: string;
  };
}

// Partner hizmet alanı genişletme talebi
interface ServiceAreaRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  requestType: 'area_expansion';
  currentAreas: string[]; // ["Kadıköy", "Maltepe"]
  requestedAreas: string[]; // ["Beşiktaş", "Şişli"]
  reason: string; // Partner açıklaması
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNotes?: string;
}

// Partner destek/yardım talebi
interface PartnerSupportRequest {
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
  assignedTo?: string; // Admin user
  resolution?: string;
}

interface OfferLog {
  id: string; partnerId: string; partnerName: string; requestId: string; price: number;
  status: 'sent' | 'accepted' | 'rejected'; createdAt: string;
}

const MOCK_USERS: User[] = [
  { id: 'USR-001', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', type: 'customer', status: 'active', joinDate: '2023-10-15', totalSpent: 2400 },
  { id: 'USR-002', name: 'Selin Kaya', email: 'selin@example.com', type: 'customer', status: 'active', joinDate: '2023-11-01', totalSpent: 800 },
  { id: 'PTR-001', name: 'Yılmaz Oto Kurtarma', email: 'yilmaz@partner.com', type: 'partner', status: 'active', joinDate: '2023-09-10', totalEarned: 15600 },
  { id: 'PTR-002', name: 'Hızlı Yol Yardım', email: 'hizli@partner.com', type: 'partner', status: 'active', joinDate: '2023-08-20', totalEarned: 28900 },
];
const MOCK_PARTNERS: Partner[] = [
  { id: 'PTR-001', name: 'Yılmaz Oto Kurtarma', email: 'yilmaz@partner.com', phone: '0532 XXX XX 01', rating: 4.9, completedJobs: 128, credits: 25, status: 'active' },
  { id: 'PTR-002', name: 'Hızlı Yol Yardım', email: 'hizli@partner.com', phone: '0533 XXX XX 02', rating: 4.7, completedJobs: 203, credits: 50, status: 'active' },
  { id: 'PTR-003', name: 'Mega Çekici', email: 'mega@partner.com', phone: '0534 XXX XX 03', rating: 4.5, completedJobs: 89, credits: 10, status: 'pending' },
];
// Müşteri teklif talepleri (ayrı sekmede gösterilecek)
const MOCK_CUSTOMER_REQUESTS: CustomerRequestLog[] = [
  { id: 'CREQ-001', customerId: 'USR-001', customerName: 'Ahmet Yılmaz', serviceType: 'cekici', status: 'completed', createdAt: '2024-11-22 14:30', amount: 850 },
  { id: 'CREQ-002', customerId: 'USR-002', customerName: 'Selin Kaya', serviceType: 'aku', status: 'matched', createdAt: '2024-11-23 09:15', amount: 400 },
  { id: 'CREQ-003', customerId: 'USR-001', customerName: 'Ahmet Yılmaz', serviceType: 'lastik', status: 'open', createdAt: '2024-11-24 11:00' },
];

// Partner lead satın alma talepleri
const MOCK_LEAD_REQUESTS: PartnerLeadRequest[] = [
  {
    id: 'LREQ-001',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    requestType: 'lead_purchase',
    serviceArea: 'Kadıköy, İstanbul',
    serviceType: 'cekici',
    creditCost: 1,
    status: 'approved',
    createdAt: '2024-11-26 14:30',
    resolvedAt: '2024-11-26 15:00',
    resolvedBy: 'Admin User',
    adminNotes: 'Onaylandı, 1 kredi düşüldü',
    customerInfo: {
      name: 'Mehmet Demir',
      phone: '0532 111 22 33',
      location: 'Kadıköy Moda Caddesi, İstanbul'
    }
  },
  {
    id: 'LREQ-002',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    requestType: 'lead_purchase',
    serviceArea: 'Beşiktaş, İstanbul',
    serviceType: 'aku',
    creditCost: 1,
    status: 'pending',
    createdAt: '2024-11-27 09:15',
  },
  {
    id: 'LREQ-003',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    requestType: 'lead_purchase',
    serviceArea: 'Bornova, İzmir',
    serviceType: 'lastik',
    creditCost: 1,
    status: 'pending',
    createdAt: '2024-11-27 10:30',
  },
  {
    id: 'LREQ-004',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    requestType: 'lead_purchase',
    serviceArea: 'Maltepe, İstanbul',
    serviceType: 'yakit',
    creditCost: 1,
    status: 'rejected',
    createdAt: '2024-11-25 16:20',
    resolvedAt: '2024-11-25 17:00',
    resolvedBy: 'Admin User',
    adminNotes: 'Yetersiz kredi bakiyesi'
  },
];

// Partner hizmet alanı genişletme talepleri
const MOCK_AREA_REQUESTS: ServiceAreaRequest[] = [
  {
    id: 'AREQ-001',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    requestType: 'area_expansion',
    currentAreas: ['Çankaya, Ankara', 'Keçiören, Ankara'],
    requestedAreas: ['Mamak, Ankara', 'Etimesgut, Ankara'],
    reason: 'Filomuz bu bölgelere yeterli. 2 yeni araç ekledik.',
    status: 'pending',
    createdAt: '2024-11-26 11:00',
  },
  {
    id: 'AREQ-002',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    requestType: 'area_expansion',
    currentAreas: ['Kadıköy, İstanbul', 'Maltepe, İstanbul'],
    requestedAreas: ['Beşiktaş, İstanbul', 'Şişli, İstanbul'],
    reason: 'Avrupa yakasında da hizmet vermek istiyoruz.',
    status: 'approved',
    createdAt: '2024-11-24 14:20',
    resolvedAt: '2024-11-25 09:00',
    resolvedBy: 'Admin User',
    adminNotes: 'Filo kapasitesi yeterli, onaylandı.'
  },
  {
    id: 'AREQ-003',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    requestType: 'area_expansion',
    currentAreas: ['Bornova, İzmir'],
    requestedAreas: ['Karşıyaka, İzmir', 'Konak, İzmir', 'Çiğli, İzmir'],
    reason: 'İzmir genelinde hizmet kapsamını genişletmek istiyoruz.',
    status: 'rejected',
    createdAt: '2024-11-20 16:45',
    resolvedAt: '2024-11-21 10:00',
    resolvedBy: 'Admin User',
    adminNotes: 'Filo kapasitesi yetersiz. En az 2 araç daha eklemeniz gerekiyor.'
  },
];

// Partner destek talepleri
const MOCK_SUPPORT_REQUESTS: PartnerSupportRequest[] = [
  {
    id: 'SREQ-001',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    requestType: 'billing',
    priority: 'high',
    subject: 'Ödeme sistemi sorunu',
    description: 'Son 3 gündür ödeme çekme işlemi gerçekleştiremiyorum. Bakiye görünüyor ama çekim yapamıyorum.',
    status: 'in_progress',
    createdAt: '2024-11-27 08:30',
    updatedAt: '2024-11-27 09:00',
    assignedTo: 'Admin User',
  },
  {
    id: 'SREQ-002',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    requestType: 'technical',
    priority: 'medium',
    subject: 'Mobil uygulama GPS sorunu',
    description: 'Mobil uygulamada konum paylaşımı zaman zaman kopuyor.',
    status: 'resolved',
    createdAt: '2024-11-25 14:15',
    updatedAt: '2024-11-26 10:00',
    assignedTo: 'Tech Support',
    resolution: 'GPS izinleri yeniden ayarlandı. Uygulama güncellemesi yayınlandı.'
  },
  {
    id: 'SREQ-003',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    requestType: 'feature',
    priority: 'low',
    subject: 'Toplu SMS gönderme özelliği',
    description: 'Müşterilere kampanya duyurusu için toplu SMS gönderebilir miyiz?',
    status: 'open',
    createdAt: '2024-11-26 16:00',
    updatedAt: '2024-11-26 16:00',
  },
  {
    id: 'SREQ-004',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    requestType: 'support',
    priority: 'urgent',
    subject: 'Hesap askıya alındı',
    description: 'Hesabım neden askıya alındı? Acil çözüm gerekiyor, işlerimiz durdu.',
    status: 'resolved',
    createdAt: '2024-11-24 10:00',
    updatedAt: '2024-11-24 12:30',
    assignedTo: 'Admin User',
    resolution: 'Doğrulama eksikliği. Belgeler tamamlandı, hesap aktif edildi.'
  },
];
const MOCK_OFFERS: OfferLog[] = [
  { id: 'OFF-001', partnerId: 'PTR-001', partnerName: 'Yılmaz Oto', requestId: 'REQ-001', price: 850, status: 'accepted', createdAt: '2023-11-22 14:35' },
  { id: 'OFF-002', partnerId: 'PTR-002', partnerName: 'Hızlı Yol', requestId: 'REQ-002', price: 400, status: 'accepted', createdAt: '2023-11-23 09:20' },
  { id: 'OFF-003', partnerId: 'PTR-001', partnerName: 'Yılmaz Oto', requestId: 'REQ-003', price: 600, status: 'sent', createdAt: '2023-11-24 11:05' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'partners' | 'requests' | 'offers' | 'reports' | 'documents' | 'fleet' | 'reviews' | 'financial' | 'credits' | 'job-history'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'customer' | 'partner'>('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequestLog | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const currentAdminRole: AdminRole = AdminRole.SUPER_ADMIN;

  // URL'ye göre aktif tab'ı ayarla
  useEffect(() => {
    const pathMap: Record<string, typeof activeTab> = {
      '/admin': 'overview',
      '/admin/kullanicilar': 'users',
      '/admin/partnerler': 'partners',
      '/admin/talepler': 'requests',
      '/admin/teklifler': 'offers',
      '/admin/raporlar': 'reports',
      '/admin/belgeler': 'documents',
      '/admin/filo': 'fleet',
      '/admin/degerlendirmeler': 'reviews',
      '/admin/finansal': 'financial',
      '/admin/krediler': 'credits',
      '/admin/is-gecmisi': 'job-history'
    };
    const newTab = pathMap[location.pathname];
    if (newTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname]);

  // Tab değiştiğinde URL'i güncelle
  const handleTabChange = (tabId: string) => {
    const urlMap: Record<string, string> = {
      'overview': '/admin',
      'users': '/admin/kullanicilar',
      'partners': '/admin/partnerler',
      'requests': '/admin/talepler',
      'offers': '/admin/teklifler',
      'reports': '/admin/raporlar',
      'documents': '/admin/belgeler',
      'fleet': '/admin/filo',
      'reviews': '/admin/degerlendirmeler',
      'financial': '/admin/finansal',
      'credits': '/admin/krediler',
      'job-history': '/admin/is-gecmisi'
    };
    const newUrl = urlMap[tabId] || '/admin';
    navigate(newUrl);
  };

  const filteredUsers = userTypeFilter === 'all' ? MOCK_USERS : MOCK_USERS.filter(u => u.type === userTypeFilter);
  const usersFilter = useAdminFilter(filteredUsers, { searchKeys: ['name','email'] });
  const partnersFilter = useAdminFilter(MOCK_PARTNERS, { searchKeys: ['name','email'], statusKey: 'status' });

  const stats = {
    totalUsers: MOCK_USERS.filter(u => u.type === 'customer').length,
    totalPartners: MOCK_PARTNERS.length,
    // Partner talep istatistikleri
    pendingLeadRequests: MOCK_LEAD_REQUESTS.filter(r => r.status === 'pending').length,
    pendingAreaRequests: MOCK_AREA_REQUESTS.filter(r => r.status === 'pending').length,
    openSupportRequests: MOCK_SUPPORT_REQUESTS.filter(r => r.status === 'open' || r.status === 'in_progress').length,
    // Müşteri talep istatistikleri (ayrı sekme için)
    activeCustomerRequests: MOCK_CUSTOMER_REQUESTS.filter(r => r.status === 'open').length,
    completedCustomerRequests: MOCK_CUSTOMER_REQUESTS.filter(r => r.status === 'completed').length,
    totalRevenue: MOCK_CUSTOMER_REQUESTS.filter(r => r.amount).reduce((sum, r) => sum + (r.amount || 0), 0),
    b2cUsers: MOCK_USERS.filter(u => u.type === 'customer').length,
    b2bUsers: MOCK_USERS.filter(u => u.type === 'partner').length,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {mobileSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />}
      <div className="hidden md:block">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          onLogout={() => navigate('/')}
          role={currentAdminRole}
        />
      </div>
      <div className={`fixed inset-y-0 left-0 z-40 transform md:hidden transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          onLogout={() => navigate('/')}
          role={currentAdminRole}
          mobile
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          activeTab={activeTab}
          notificationsCount={3}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6" id="panel-overview" role="tabpanel" aria-labelledby="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><Users size={24} className="text-blue-600" /></div>
                    <span className="text-xs font-bold text-green-600">+12%</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalUsers}</h3>
                  <p className="text-sm text-slate-500 font-medium">Toplam Kullanıcı</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center"><Shield size={24} className="text-orange-600" /></div>
                    <span className="text-xs font-bold text-green-600">+8%</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalPartners}</h3>
                  <p className="text-sm text-slate-500 font-medium">Aktif Partner</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle size={24} className="text-green-600" /></div>
                    <span className="text-xs font-bold text-green-600">+23%</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.completedCustomerRequests}</h3>
                  <p className="text-sm text-slate-500 font-medium">Tamamlanan İş</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><DollarSign size={24} className="text-purple-600" /></div>
                    <span className="text-xs font-bold text-green-600">+31%</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">₺{stats.totalRevenue.toLocaleString()}</h3>
                  <p className="text-sm text-slate-500 font-medium">Toplam Ciro</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6" role="region" aria-label="Son Aktiviteler">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Son Müşteri Talepleri</h3>
                <div className="space-y-3">
                  {MOCK_CUSTOMER_REQUESTS.slice(0,5).map((req: CustomerRequestLog) => (
                    <div 
                      key={req.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/musteri-talepleri/${req.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText size={20} className="text-blue-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{req.customerName}</p>
                          <p className="text-xs text-slate-500">{req.serviceType} - {req.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge type="request" status={req.status} />
                        <p className="text-xs text-slate-400 mt-1">{req.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6" id="panel-users" role="tabpanel" aria-labelledby="users">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Kullanıcı ara..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={usersFilter.searchTerm}
                    onChange={(e) => usersFilter.setSearchTerm(e.target.value)}
                    aria-label="Kullanıcı arama"
                  />
                </div>
                <select
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value as 'all' | 'customer' | 'partner')}
                  aria-label="Kullanıcı tipi filtresi"
                >
                  <option value="all">Tüm Kullanıcılar</option>
                  <option value="customer">Sadece Müşteriler (B2C)</option>
                  <option value="partner">Sadece Partnerler (B2B)</option>
                </select>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 flex items-center gap-2" 
                  aria-label="Yeni kullanıcı oluştur"
                >
                  <UserPlus size={20} /> Yeni Kullanıcı
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" role="region" aria-label="Kullanıcı listesi">
                {usersFilter.filtered.length === 0 ? <EmptyState title="Kullanıcı Yok" description="Arama kriterine uygun kullanıcı bulunamadı." /> : (
                  <table className="w-full" role="table">
                    <thead className="bg-slate-50 border-b border-slate-200" role="rowgroup">
                      <tr role="row">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Kullanıcı</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Tip</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Durum</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Kayıt Tarihi</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Toplam</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase" role="columnheader">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100" role="rowgroup">
                      {usersFilter.filtered.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50" role="row">
                          <td className="px-6 py-4" role="cell">
                            <div 
                              className="cursor-pointer hover:text-orange-600 transition-colors"
                              onClick={() => navigate(`/admin/kullanici/${user.id}`)}
                            >
                              <p className="font-bold text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4" role="cell"><span className={`px-3 py-1 rounded-full text-xs font-bold ${user.type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{user.type === 'customer' ? 'Müşteri' : 'Partner'}</span></td>
                          <td className="px-6 py-4" role="cell"><StatusBadge type="user" status={user.status} /></td>
                          <td className="px-6 py-4 text-sm text-slate-600" role="cell">{user.joinDate}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900" role="cell">₺{(user.totalSpent || user.totalEarned || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right" role="cell">
                            <button onClick={() => navigate(`/admin/kullanici/${user.id}`)} className="p-2 text-slate-400 hover:text-blue-600" aria-label={`Kullanıcı ${user.id} görüntüle`}><Eye size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-orange-600" aria-label={`Kullanıcı ${user.id} düzenle`}><Edit size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-red-600" aria-label={`Kullanıcı ${user.id} sil`}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-6" id="panel-partners" role="tabpanel" aria-labelledby="partners">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Partner ara..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={partnersFilter.searchTerm}
                    onChange={(e) => partnersFilter.setSearchTerm(e.target.value)}
                    aria-label="Partner arama"
                  />
                </div>
                <select
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={partnersFilter.filterType}
                  onChange={(e) => partnersFilter.setFilterType(e.target.value)}
                  aria-label="Partner durum filtresi"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="pending">Onay Bekliyor</option>
                  <option value="suspended">Askıda</option>
                </select>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" role="region" aria-label="Partner listesi">
                {partnersFilter.filtered.length === 0 ? <EmptyState title="Partner Yok" description="Arama kriterine uygun partner yok." /> : (
                  <table className="w-full" role="table">
                    <thead className="bg-slate-50 border-b border-slate-200" role="rowgroup">
                      <tr role="row">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Partner</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">İletişim</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Puan</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">İş Sayısı</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Kredi</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Durum</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase" role="columnheader">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100" role="rowgroup">
                      {partnersFilter.filtered.map(partner => (
                        <tr key={partner.id} className="hover:bg-slate-50" role="row">
                          <td className="px-6 py-4" role="cell">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Shield size={20} className="text-orange-600" /></div>
                              <div 
                                className="cursor-pointer hover:text-orange-600 transition-colors"
                                onClick={() => navigate(`/admin/partner/${partner.id}`)}
                              >
                                <p className="font-bold text-slate-900">{partner.name}</p>
                                <p className="text-xs text-slate-500">{partner.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4" role="cell">
                            <div className="text-sm">
                              <p className="text-slate-900">{partner.email}</p>
                              <p className="text-slate-500">{partner.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4" role="cell">
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-slate-900">{partner.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900" role="cell">{partner.completedJobs}</td>
                          <td className="px-6 py-4" role="cell">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">{partner.credits}</span>
                          </td>
                          <td className="px-6 py-4" role="cell"><StatusBadge type="partner" status={partner.status} /></td>
                          <td className="px-6 py-4 text-right" role="cell">
                            <button onClick={() => navigate(`/admin/partner/${partner.id}`)} className="p-2 text-slate-400 hover:text-blue-600" aria-label={`Partner ${partner.id} görüntüle`}><Eye size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-orange-600" aria-label={`Partner ${partner.id} düzenle`}><Edit size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-red-600" aria-label={`Partner ${partner.id} sil`}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}>
              <AdminRequestsTab 
                leadRequests={MOCK_LEAD_REQUESTS}
                areaRequests={MOCK_AREA_REQUESTS}
                supportRequests={MOCK_SUPPORT_REQUESTS}
              />
            </Suspense>
          )}

          {activeTab === 'offers' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminOffersTab data={MOCK_OFFERS} onViewOffer={(offer) => navigate(`/admin/teklif/${offer.id}`)} /></Suspense>
          )}
          {activeTab === 'reports' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminReportsTab /></Suspense>
          )}
          {activeTab === 'documents' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminDocumentsTab /></Suspense>
          )}
          {activeTab === 'fleet' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminFleetTab onViewVehicle={setSelectedVehicle} /></Suspense>
          )}
          {activeTab === 'reviews' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminReviewsTab /></Suspense>
          )}
          {activeTab === 'financial' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminFinancialTab /></Suspense>
          )}
          {activeTab === 'credits' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminCreditsTab /></Suspense>
          )}
          {activeTab === 'job-history' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminJobHistoryTab /></Suspense>
          )}
        </main>
      </div>

      {/* Modals */}
      <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddUserModal(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Yeni Kullanıcı Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kullanıcı Tipi</label>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                  <option value="customer">Müşteri (B2C)</option>
                  <option value="partner">Partner (B2B)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    alert('Kullanıcı eklendi!');
                    setShowAddUserModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
