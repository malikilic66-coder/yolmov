import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Users, Shield, FileText, Search, Eye, Edit, Trash2, UserPlus, CheckCircle, DollarSign, Mail, Phone, Star, MapPin, Clock, User as UserIcon, CreditCard, XCircle, Truck, Calendar } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import RequestDetailModal from './modals/RequestDetailModal';
import VehicleDetailModal from './modals/VehicleDetailModal';
import { AdminRole, CustomerRequestLog } from '../../types';
import { useAdminFilter } from './hooks/useAdminFilter';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import LoadingSkeleton from './ui/LoadingSkeleton';
import { 
  getCustomerRequestsForAdmin, 
  initializeMockData,
  getAllUsers,
  getAllPartners,
  getAllLeadRequests,
  getAllAreaRequests,
  getAllTickets,
  getAllOffers,
  getAllReviews,
  getAllVehicles,
  User,
  Partner,
  PartnerLeadRequest,
  ServiceAreaRequest
} from '../../services/mockApi';

const AdminOffersTab = lazy(() => import('./tabs/AdminOffersTab'));
const AdminReportsTab = lazy(() => import('./tabs/AdminReportsTab'));
const AdminDocumentsTab = lazy(() => import('./tabs/AdminDocumentsTab'));
const AdminFleetTab = lazy(() => import('./tabs/AdminFleetTab'));
const AdminReviewsTab = lazy(() => import('./tabs/AdminReviewsTab'));
const AdminFinancialTab = lazy(() => import('./tabs/AdminFinancialTab'));
const AdminCreditsTab = lazy(() => import('./tabs/AdminCreditsTab'));
const AdminJobHistoryTab = lazy(() => import('./tabs/AdminJobHistoryTab'));
const AdminUsersTab = lazy(() => import('./tabs/AdminUsersTab'));
const AdminRequestsTab = lazy(() => import('./tabs/AdminRequestsTab'));
const AdminCustomerRequestsTab = lazy(() => import('./tabs/AdminCustomerRequestsTab'));

import type { Vehicle } from './tabs/AdminFleetTab';

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


import { SupportTicket, Offer } from '../../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string; vehicleId?: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'partners' | 'requests' | 'customer-requests' | 'offers' | 'reports' | 'documents' | 'fleet' | 'reviews' | 'financial' | 'credits' | 'job-history' | 'admin-users'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'customer' | 'partner'>('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequestLog | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const currentAdminRole: AdminRole = AdminRole.SUPER_ADMIN;
  
  // State for dynamic data
  const [users, setUsers] = useState<User[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leadRequests, setLeadRequests] = useState<PartnerLeadRequest[]>([]);
  const [areaRequests, setAreaRequests] = useState<ServiceAreaRequest[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportTicket[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  // mockApi'den müşteri taleplerini çek
  const [customerRequests, setCustomerRequests] = useState<CustomerRequestLog[]>([]);
  
  // Component mount olduğunda ve tab değiştiğinde verileri yükle
  useEffect(() => {
    initializeMockData();
    loadAllData();
  }, []);
  
  // Tab değiştiğinde verileri yenile
  useEffect(() => {
    loadAllData();
  }, [activeTab]);
  
  const loadAllData = () => {
    setCustomerRequests(getCustomerRequestsForAdmin());
    setUsers(getAllUsers());
    setPartners(getAllPartners());
    setLeadRequests(getAllLeadRequests());
    setAreaRequests(getAllAreaRequests());
    setSupportRequests(getAllTickets());
    setOffers(getAllOffers());
  };

  // URL'ye göre aktif tab'ı ayarla
  useEffect(() => {
    const pathMap: Record<string, typeof activeTab> = {
      '/admin': 'overview',
      '/admin/kullanicilar': 'users',
      '/admin/partnerler': 'partners',
      '/admin/talepler': 'requests',
      '/admin/musteri-talepleri': 'customer-requests',
      '/admin/teklifler': 'offers',
      '/admin/raporlar': 'reports',
      '/admin/belgeler': 'documents',
      '/admin/filo': 'fleet',
      '/admin/degerlendirmeler': 'reviews',
      '/admin/finansal': 'financial',
      '/admin/krediler': 'credits',
      '/admin/is-gecmisi': 'job-history',
      '/admin/admin-kullanicilari': 'admin-users'
    };
    
    // Detay sayfaları için tab belirleme
    if (location.pathname.startsWith('/admin/kullanicilar/')) {
      setActiveTab('users');
      return;
    }
    if (location.pathname.startsWith('/admin/partnerler/')) {
      setActiveTab('partners');
      return;
    }
    if (location.pathname.startsWith('/admin/talepler/')) {
      setActiveTab('requests');
      return;
    }
    if (location.pathname.startsWith('/admin/teklifler/')) {
      setActiveTab('offers');
      return;
    }
    if (location.pathname.startsWith('/admin/filo/')) {
      setActiveTab('fleet');
      return;
    }
    if (location.pathname.startsWith('/admin/degerlendirmeler/')) {
      setActiveTab('reviews');
      return;
    }
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
      'customer-requests': '/admin/musteri-talepleri',
      'offers': '/admin/teklifler',
      'reports': '/admin/raporlar',
      'documents': '/admin/belgeler',
      'fleet': '/admin/filo',
      'reviews': '/admin/degerlendirmeler',
      'financial': '/admin/finansal',
      'credits': '/admin/krediler',
      'job-history': '/admin/is-gecmisi',
      'admin-users': '/admin/admin-kullanicilari'
    };
    const newUrl = urlMap[tabId] || '/admin';
    navigate(newUrl);
  };

  const filteredUsers = userTypeFilter === 'all' ? users : users.filter(u => u.type === userTypeFilter);
  const usersFilter = useAdminFilter(filteredUsers, { searchKeys: ['name','email'] });
  const partnersFilter = useAdminFilter(partners, { searchKeys: ['name','email'], statusKey: 'status' });

  const stats = {
    totalUsers: users.filter(u => u.type === 'customer').length,
    totalPartners: partners.length,
    // Partner talep istatistikleri
    pendingLeadRequests: leadRequests.filter(r => r.status === 'pending').length,
    pendingAreaRequests: areaRequests.filter(r => r.status === 'pending').length,
    openSupportRequests: supportRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length,
    // Müşteri talep istatistikleri - mockApi'den dinamik veri
    activeCustomerRequests: customerRequests.filter(r => r.status === 'open').length,
    completedCustomerRequests: customerRequests.filter(r => r.status === 'completed').length,
    totalRevenue: customerRequests.filter(r => r.amount).reduce((sum, r) => sum + (r.amount || 0), 0),
    b2cUsers: users.filter(u => u.type === 'customer').length,
    b2bUsers: users.filter(u => u.type === 'partner').length,
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
                  {customerRequests.slice(0,5).map((req: CustomerRequestLog) => (
                    <div 
                      key={req.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setActiveTab('customer-requests');
                        navigate(`/admin/musteri-talepleri`);
                      }}
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
              {/* Eğer params.id varsa detay göster */}
              {params.id ? (
                <UserDetailPanel userId={params.id} onBack={() => navigate('/admin/kullanicilar')} />
              ) : (
                <>
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
                              onClick={() => navigate(`/admin/kullanicilar/${user.id}`)}
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
                            <button onClick={() => navigate(`/admin/kullanicilar/${user.id}`)} className="p-2 text-slate-400 hover:text-blue-600" aria-label={`Kullanıcı ${user.id} görüntüle`}><Eye size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-orange-600" aria-label={`Kullanıcı ${user.id} düzenle`}><Edit size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-red-600" aria-label={`Kullanıcı ${user.id} sil`}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              </>
              )}
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-6" id="panel-partners" role="tabpanel" aria-labelledby="partners">
              {/* Eğer params.id varsa detay göster */}
              {params.id ? (
                <PartnerDetailPanel partnerId={params.id} onBack={() => navigate('/admin/partnerler')} />
              ) : (
                <>
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
                                onClick={() => navigate(`/admin/partnerler/${partner.id}`)}
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
                            <button onClick={() => navigate(`/admin/partnerler/${partner.id}`)} className="p-2 text-slate-400 hover:text-blue-600" aria-label={`Partner ${partner.id} görüntüle`}><Eye size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-orange-600" aria-label={`Partner ${partner.id} düzenle`}><Edit size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-red-600" aria-label={`Partner ${partner.id} sil`}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              </>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {location.pathname.startsWith('/admin/talepler/lead/') && params.id ? (
                <LeadRequestDetailPanel 
                  requestId={params.id} 
                  onBack={() => navigate('/admin/talepler')} 
                />
              ) : location.pathname.startsWith('/admin/talepler/alan/') && params.id ? (
                <AreaRequestDetailPanel 
                  requestId={params.id} 
                  onBack={() => navigate('/admin/talepler')} 
                />
              ) : location.pathname.startsWith('/admin/talepler/destek/') && params.id ? (
                <SupportRequestDetailPanel 
                  requestId={params.id} 
                  onBack={() => navigate('/admin/talepler')} 
                />
              ) : (
                <Suspense fallback={<LoadingSkeleton rows={6} />}>
                  <AdminRequestsTab 
                    leadRequests={leadRequests}
                    areaRequests={areaRequests}
                    supportRequests={supportRequests}
                  />
                </Suspense>
              )}
            </div>
          )}

          {activeTab === 'customer-requests' && (
            <div>
              {params.id ? (
                <CustomerRequestDetailPanel 
                  requestId={params.id} 
                  onBack={() => navigate('/admin/musteri-talepleri')} 
                />
              ) : (
                <Suspense fallback={<LoadingSkeleton rows={6} />}>
                  <AdminCustomerRequestsTab requests={customerRequests} />
                </Suspense>
              )}
            </div>
          )}

          {activeTab === 'offers' && (
            <div>
              {params.id ? (
                <OfferDetailPanel 
                  offerId={params.id} 
                  onBack={() => navigate('/admin/teklifler')} 
                />
              ) : (
                <Suspense fallback={<LoadingSkeleton rows={6} />}>
                  <AdminOffersTab data={offers} onViewOffer={(offer) => navigate(`/admin/teklifler/${offer.id}`)} />
                </Suspense>
              )}
            </div>
          )}
          {activeTab === 'reports' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminReportsTab /></Suspense>
          )}
          {activeTab === 'documents' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminDocumentsTab /></Suspense>
          )}
          {activeTab === 'fleet' && (
            <div>
              {params.vehicleId ? (
                <VehicleDetailPanel 
                  vehicleId={params.vehicleId} 
                  onBack={() => navigate('/admin/filo')} 
                />
              ) : (
                <Suspense fallback={<LoadingSkeleton rows={6} />}>
                  <AdminFleetTab onViewVehicle={(vehicle: any) => navigate(`/admin/filo/${vehicle.id}`)} />
                </Suspense>
              )}
            </div>
          )}
          {activeTab === 'reviews' && (
            <div>
              {params.id ? (
                <ReviewDetailPanel 
                  reviewId={params.id} 
                  onBack={() => navigate('/admin/degerlendirmeler')} 
                />
              ) : (
                <Suspense fallback={<LoadingSkeleton rows={6} />}>
                  <AdminReviewsTab />
                </Suspense>
              )}
            </div>
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
          {activeTab === 'admin-users' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminUsersTab /></Suspense>
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

// Request Detail Panel Components (Inline)
interface LeadRequestDetailPanelProps {
  requestId: string;
  onBack: () => void;
}

const LeadRequestDetailPanel: React.FC<LeadRequestDetailPanelProps> = ({ requestId, onBack }) => {
  const [requestState, setRequestState] = React.useState<any>(null);

  React.useEffect(() => {
    const allRequests = getAllLeadRequests();
    const request = allRequests.find(r => r.id === requestId);
    setRequestState(request || null);
  }, [requestId]);

  const request = requestState;

  const handleApprove = () => {
    if (!request) return;
    if (confirm(`${request.partnerName} için lead talebi onaylanacak. Devam edilsin mi?`)) {
      setRequestState({ ...request, status: 'approved', resolvedAt: new Date().toISOString(), resolvedBy: 'Admin' });
      alert('Lead talebi onaylandı.');
    }
  };

  const handleReject = () => {
    if (!request) return;
    const notes = prompt('Red nedeni (opsiyonel):');
    if (confirm(`${request.partnerName} için lead talebi reddedilecek. Devam edilsin mi?`)) {
      setRequestState({ ...request, status: 'rejected', resolvedAt: new Date().toISOString(), resolvedBy: 'Admin', adminNotes: notes || undefined });
      alert('Lead talebi reddedildi.');
    }
  };

  if (!request) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Lead talebi bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Lead Talebi Detayı</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{request.partnerName}</h3>
            <p className="text-slate-500">{request.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            request.status === 'approved' ? 'bg-green-100 text-green-700' :
            request.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {request.status === 'approved' ? 'Onaylandı' : request.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <MapPin size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Bölge</p>
              <p className="font-medium text-slate-900">{request.serviceArea}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Phone size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Hizmet Tipi</p>
              <p className="font-medium text-slate-900">{request.serviceType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <CreditCard size={20} className="text-blue-600" />
            <div>
              <p className="text-xs text-blue-700 font-bold">Maliyet</p>
              <p className="font-black text-2xl text-blue-900">{request.creditCost} Kredi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Clock size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Oluşturulma</p>
              <p className="font-medium text-slate-900">{request.createdAt}</p>
            </div>
          </div>
        </div>

        {request.status === 'pending' && (
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleApprove}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Onayla
            </button>
            <button 
              onClick={handleReject}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <XCircle size={20} />
              Reddet
            </button>
          </div>
        )}

        {request.status !== 'pending' && request.resolvedAt && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600">
              <strong>Çözüldü:</strong> {request.resolvedAt} - {request.resolvedBy}
            </p>
            {request.adminNotes && (
              <p className="text-sm text-slate-600 mt-2">
                <strong>Not:</strong> {request.adminNotes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Area Request Detail Panel
const AreaRequestDetailPanel: React.FC<LeadRequestDetailPanelProps> = ({ requestId, onBack }) => {
  const [requestState, setRequestState] = React.useState<any>(null);

  React.useEffect(() => {
    const allRequests = getAllAreaRequests();
    const request = allRequests.find(r => r.id === requestId);
    setRequestState(request || null);
  }, [requestId]);

  const request = requestState;

  const handleApprove = () => {
    if (!request) return;
    if (confirm(`${request.partnerName} için alan genişletme talebi onaylanacak. Devam edilsin mi?`)) {
      setRequestState({ ...request, status: 'approved', resolvedAt: new Date().toISOString(), resolvedBy: 'Admin' });
      alert('Alan genişletme talebi onaylandı.');
    }
  };

  const handleReject = () => {
    if (!request) return;
    const notes = prompt('Red nedeni:');
    if (notes && confirm(`${request.partnerName} için alan genişletme talebi reddedilecek. Devam edilsin mi?`)) {
      setRequestState({ ...request, status: 'rejected', resolvedAt: new Date().toISOString(), resolvedBy: 'Admin', adminNotes: notes });
      alert('Alan genişletme talebi reddedildi.');
    }
  };

  if (!request) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Alan genişletme talebi bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Alan Genişletme Talebi</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{request.partnerName}</h3>
            <p className="text-slate-500">{request.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            request.status === 'approved' ? 'bg-green-100 text-green-700' :
            request.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {request.status === 'approved' ? 'Onaylandı' : request.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-2">Mevcut Bölgeler</p>
            <div className="flex flex-wrap gap-2">
              {request.currentAreas?.map((area: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-xs text-green-700 font-bold mb-2">İstenen Yeni Bölgeler</p>
            <div className="flex flex-wrap gap-2">
              {request.requestedAreas?.map((area: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-green-200 text-green-800 rounded-lg text-sm font-bold">
                  {area}
                </span>
              ))}
            </div>
          </div>

          {request.reason && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-700 font-bold mb-1">Gerekçe</p>
              <p className="text-sm text-blue-900">{request.reason}</p>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Clock size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Oluşturulma</p>
              <p className="font-medium text-slate-900">{request.createdAt}</p>
            </div>
          </div>
        </div>

        {request.status === 'pending' && (
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleApprove}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Onayla
            </button>
            <button 
              onClick={handleReject}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <XCircle size={20} />
              Reddet
            </button>
          </div>
        )}

        {request.status !== 'pending' && request.resolvedAt && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600">
              <strong>Çözüldü:</strong> {request.resolvedAt} - {request.resolvedBy}
            </p>
            {request.adminNotes && (
              <p className="text-sm text-slate-600 mt-2">
                <strong>Not:</strong> {request.adminNotes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Support Request Detail Panel
const SupportRequestDetailPanel: React.FC<LeadRequestDetailPanelProps> = ({ requestId, onBack }) => {
  const [requestState, setRequestState] = React.useState<any>(null);

  React.useEffect(() => {
    const allRequests = getAllTickets();
    const request = allRequests.find(r => r.id === requestId);
    setRequestState(request || null);
  }, [requestId]);

  const request = requestState;

  const handleResolve = () => {
    if (!request) return;
    const resolution = prompt('Çözüm açıklaması:');
    if (resolution && confirm('Destek talebi çözüldü olarak işaretlenecek. Devam edilsin mi?')) {
      setRequestState({ ...request, status: 'resolved', updatedAt: new Date().toISOString(), resolution });
      alert('Destek talebi çözüldü olarak işaretlendi.');
    }
  };

  const handleClose = () => {
    if (!request) return;
    if (confirm('Destek talebi kapatılacak. Devam edilsin mi?')) {
      setRequestState({ ...request, status: 'closed', updatedAt: new Date().toISOString() });
      alert('Destek talebi kapatıldı.');
    }
  };

  if (!request) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Destek talebi bulunamadı.
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Destek Talebi Detayı</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{request.partnerName}</h3>
            <p className="text-slate-500">{request.id}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(request.priority)}`}>
              {request.priority.toUpperCase()}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              request.status === 'resolved' ? 'bg-green-100 text-green-700' :
              request.status === 'closed' ? 'bg-slate-100 text-slate-700' :
              request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {request.status === 'resolved' ? 'Çözüldü' : request.status === 'closed' ? 'Kapatıldı' : request.status === 'in_progress' ? 'İşlemde' : 'Açık'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Konu</p>
            <p className="font-bold text-lg text-slate-900">{request.subject}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 font-bold mb-2">Açıklama</p>
            <p className="text-sm text-blue-900 whitespace-pre-wrap">{request.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <Clock size={20} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Oluşturulma</p>
                <p className="font-medium text-slate-900">{request.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <UserIcon size={20} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Atanan</p>
                <p className="font-medium text-slate-900">{request.assignedTo || 'Henüz atanmadı'}</p>
              </div>
            </div>
          </div>

          {request.resolution && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-xs text-green-700 font-bold mb-1">Çözüm</p>
              <p className="text-sm text-green-900">{request.resolution}</p>
            </div>
          )}
        </div>

        {(request.status === 'open' || request.status === 'in_progress') && (
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleResolve}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Çözüldü İşaretle
            </button>
            <button 
              onClick={handleClose}
              className="px-6 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <XCircle size={20} />
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Offer Detail Panel Component
interface OfferDetailPanelProps {
  offerId: string;
  onBack: () => void;
}

const OfferDetailPanel: React.FC<OfferDetailPanelProps> = ({ offerId, onBack }) => {
  const [offerState, setOfferState] = React.useState<any>(null);

  React.useEffect(() => {
    const allOffers = getAllOffers();
    const offer = allOffers.find(o => o.id === offerId);
    setOfferState(offer || null);
  }, [offerId]);

  const offer = offerState;

  const handleStatusChange = (newStatus: 'sent' | 'accepted' | 'rejected') => {
    if (!offer) return;
    if (confirm(`Teklif durumu "${newStatus}" olarak güncellenecek. Onaylıyor musunuz?`)) {
      setOfferState({ ...offer, status: newStatus });
      alert('Teklif durumu güncellendi.');
    }
  };

  if (!offer) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Teklif bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Teklif Detayı</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{offer.partnerName}</h3>
            <p className="text-slate-500 font-mono text-sm">{offer.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
            offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {offer.status === 'accepted' ? 'Kabul Edildi' :
             offer.status === 'rejected' ? 'Reddedildi' : 'Gönderildi'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <UserIcon size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Partner ID</p>
              <p className="font-medium text-slate-900">{offer.partnerId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <FileText size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Talep ID</p>
              <p className="font-medium text-slate-900">{offer.requestId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <DollarSign size={20} className="text-green-600" />
            <div>
              <p className="text-xs text-green-700 font-bold">Fiyat</p>
              <p className="font-black text-2xl text-green-900">₺{offer.price.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Clock size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Oluşturulma</p>
              <p className="font-medium text-slate-900">{offer.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-bold text-slate-700 mb-3">Durum Değiştir:</p>
          <div className="flex gap-2 flex-wrap">
            {(['sent', 'accepted', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={offer.status === status}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                  offer.status === status
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : status === 'accepted'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : status === 'rejected'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {status === 'accepted' ? 'Kabul Et' :
                 status === 'rejected' ? 'Reddet' : 'Gönderildi'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Vehicle (Fleet) Detail Panel Component
interface VehicleDetailPanelProps {
  vehicleId: string;
  onBack: () => void;
}

const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({ vehicleId, onBack }) => {
  const [vehicleState, setVehicleState] = React.useState<any>(null);

  React.useEffect(() => {
    const allVehicles = getAllVehicles();
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    setVehicleState(vehicle || null);
  }, [vehicleId]);

  const vehicle = vehicleState;

  const handleStatusChange = (newStatus: 'active' | 'maintenance' | 'disabled') => {
    if (!vehicle) return;
    if (confirm(`Araç durumu "${newStatus}" olarak güncellenecek. Onaylıyor musunuz?`)) {
      setVehicleState({ ...vehicle, status: newStatus });
      alert('Araç durumu güncellendi.');
    }
  };

  if (!vehicle) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Araç bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Araç Detayı</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{vehicle.plate}</h3>
            <p className="text-slate-500">{vehicle.model}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            vehicle.status === 'active' ? 'bg-green-100 text-green-700' :
            vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {vehicle.status === 'active' ? 'Aktif' :
             vehicle.status === 'maintenance' ? 'Bakımda' : 'Devre Dışı'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Shield size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Partner</p>
              <p className="font-bold text-slate-900">{vehicle.partnerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Truck size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Araç Tipi</p>
              <p className="font-medium text-slate-900">{vehicle.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <UserIcon size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Sürücü</p>
              <p className="font-medium text-slate-900">{vehicle.driver}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Calendar size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Kayıt Tarihi</p>
              <p className="font-medium text-slate-900">{vehicle.registrationDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <CheckCircle size={20} className="text-blue-600" />
            <div>
              <p className="text-xs text-blue-700 font-bold">Toplam İş</p>
              <p className="font-black text-2xl text-blue-900">{vehicle.totalJobs}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <DollarSign size={20} className="text-green-600" />
            <div>
              <p className="text-xs text-green-700 font-bold">Toplam Kazanç</p>
              <p className="font-black text-2xl text-green-900">₺{vehicle.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-bold text-slate-700 mb-3">Durum Değiştir:</p>
          <div className="flex gap-2 flex-wrap">
            {(['active', 'maintenance', 'disabled'] as const).map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={vehicle.status === status}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                  vehicle.status === status
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : status === 'active'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {status === 'active' ? 'Aktif Et' :
                 status === 'maintenance' ? 'Bakıma Al' : 'Devre Dışı Bırak'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Detail Panel Component
interface ReviewDetailPanelProps {
  reviewId: string;
  onBack: () => void;
}

const ReviewDetailPanel: React.FC<ReviewDetailPanelProps> = ({ reviewId, onBack }) => {
  const [reviewState, setReviewState] = React.useState<any>(null);

  React.useEffect(() => {
    const allReviews = getAllReviews();
    const review = allReviews.find(r => r.id === reviewId);
    setReviewState(review || null);
  }, [reviewId]);

  const review = reviewState;

  if (!review) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Değerlendirme bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Değerlendirme Detayı</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{review.partnerName}</h3>
            <p className="text-slate-500">{review.id}</p>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <UserIcon size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Müşteri</p>
              <p className="font-bold text-slate-900">{review.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <FileText size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">İş ID</p>
              <p className="font-medium text-slate-900">{review.jobId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Truck size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Hizmet</p>
              <p className="font-medium text-slate-900">{review.service}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Clock size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Tarih</p>
              <p className="font-medium text-slate-900">{review.date}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700 font-bold mb-2">Yorum</p>
          <p className="text-sm text-blue-900">{review.comment}</p>
        </div>

        {review.tags && review.tags.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-bold mb-2">Etiketler</p>
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Customer Request Detail Panel Component
interface CustomerRequestDetailPanelProps {
  requestId: string;
  onBack: () => void;
}

const CustomerRequestDetailPanel: React.FC<CustomerRequestDetailPanelProps> = ({ requestId, onBack }) => {
  const [requestState, setRequestState] = React.useState<CustomerRequestLog | null>(null);

  React.useEffect(() => {
    const allRequests = getCustomerRequestsForAdmin();
    const request = allRequests.find(r => r.id === requestId);
    setRequestState(request || null);
  }, [requestId]);

  const request = requestState;

  const handleStatusChange = (newStatus: CustomerRequestLog['status']) => {
    if (!request) return;
    if (confirm(`Talep durumu "${newStatus}" olarak güncellenecek. Onaylıyor musunuz?`)) {
      setRequestState({ ...request, status: newStatus });
      alert('Talep durumu güncellendi.');
    }
  };

  if (!request) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Müşteri talebi bulunamadı.
        </div>
      </div>
    );
  }

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'towing': 'Çekici',
      'battery': 'Akü Takviye',
      'fuel': 'Yakıt',
      'locksmith': 'Anahtar',
      'tire': 'Lastik',
      'winch': 'Vinç',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Müşteri Talebi Detayı</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{request.customerName}</h3>
            <p className="text-slate-500 font-mono text-sm">{request.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            request.status === 'completed' ? 'bg-green-100 text-green-700' :
            request.status === 'matched' ? 'bg-blue-100 text-blue-700' :
            request.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {request.status === 'completed' ? 'Tamamlandı' :
             request.status === 'matched' ? 'Eşleşti' :
             request.status === 'cancelled' ? 'İptal' : 'Açık'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <UserIcon size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Müşteri ID</p>
              <p className="font-medium text-slate-900">{request.customerId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Phone size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Hizmet Tipi</p>
              <p className="font-bold text-slate-900">{getServiceTypeLabel(request.serviceType)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <MapPin size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Konum</p>
              <p className="font-medium text-slate-900">{request.location}</p>
            </div>
          </div>
          {request.amount && (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <DollarSign size={20} className="text-green-600" />
              <div>
                <p className="text-xs text-green-700 font-bold">Tutar</p>
                <p className="font-black text-2xl text-green-900">₺{request.amount.toLocaleString()}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Clock size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Oluşturulma</p>
              <p className="font-medium text-slate-900">{request.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-bold text-slate-700 mb-3">Durum Değiştir:</p>
          <div className="flex gap-2 flex-wrap">
            {(['open', 'matched', 'completed', 'cancelled'] as const).map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={request.status === status}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                  request.status === status
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : status === 'completed'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : status === 'matched'
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : status === 'cancelled'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                {status === 'completed' ? 'Tamamlandı' :
                 status === 'matched' ? 'Eşleşti' :
                 status === 'cancelled' ? 'İptal Et' : 'Açık'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Detail Panel Component (Inline)
interface UserDetailPanelProps {
  userId: string;
  onBack: () => void;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ userId, onBack }) => {
  const [userState, setUserState] = React.useState<User | null>(null);

  React.useEffect(() => {
    const allUsers = getAllUsers();
    const foundUser = allUsers.find(u => u.id === userId);
    setUserState(foundUser || null);
  }, [userId]);
  
  const user = userState;

  const handleEdit = () => {
    alert(`${user?.name} kullanıcısı düzenleme özelliği yakında eklenecek.`);
    // TODO: Modal veya inline düzenleme formu göster
  };

  const handleToggleStatus = () => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'aktif edildi' : 'askıya alındı';
    if (confirm(`${user.name} kullanıcısı ${action}. Onaylıyor musunuz?`)) {
      setUserState({ ...user, status: newStatus });
      alert(`Kullanıcı başarıyla ${action}.`);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Kullanıcı bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Kullanıcı Detayı</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
              <p className="text-slate-500">{user.id}</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {user.status === 'active' ? 'Aktif' : 'Askıda'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Mail size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              user.type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {user.type === 'customer' ? 'Müşteri (B2C)' : 'Partner (B2B)'}
            </span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <DollarSign size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Toplam Harcama</p>
              <p className="font-bold text-slate-900">₺{(user.totalSpent || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-500">Kayıt Tarihi: {user.joinDate}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={handleEdit}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            Düzenle
          </button>
          <button 
            onClick={handleToggleStatus}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            {user.status === 'active' ? 'Askıya Al' : 'Aktif Et'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Partner Detail Panel Component (Inline)
interface PartnerDetailPanelProps {
  partnerId: string;
  onBack: () => void;
}

const PartnerDetailPanel: React.FC<PartnerDetailPanelProps> = ({ partnerId, onBack }) => {
  const [partnerState, setPartnerState] = React.useState<Partner | null>(null);

  React.useEffect(() => {
    const allPartners = getAllPartners();
    const foundPartner = allPartners.find(p => p.id === partnerId);
    setPartnerState(foundPartner || null);
  }, [partnerId]);
  
  const partner = partnerState;

  const handleEdit = () => {
    alert(`${partner?.name} partner bilgileri düzenleme özelliği yakında eklenecek.`);
    // TODO: Modal veya inline düzenleme formu göster
  };

  const handleAddCredit = () => {
    const creditAmount = prompt(`${partner?.name} için eklenecek kredi miktarını girin:`);
    if (creditAmount && partner) {
      const amount = parseInt(creditAmount);
      if (!isNaN(amount) && amount > 0) {
        setPartnerState({ ...partner, credits: partner.credits + amount });
        alert(`${amount} kredi başarıyla eklendi. Yeni bakiye: ${partner.credits + amount}`);
      } else {
        alert('Geçerli bir kredi miktarı girin.');
      }
    }
  };

  const handleToggleStatus = () => {
    if (!partner) return;
    let newStatus: 'active' | 'pending' | 'suspended';
    let action: string;
    
    if (partner.status === 'pending') {
      newStatus = 'active';
      action = 'onaylandı';
    } else if (partner.status === 'active') {
      newStatus = 'suspended';
      action = 'askıya alındı';
    } else {
      newStatus = 'active';
      action = 'aktif edildi';
    }

    if (confirm(`${partner.name} partner ${action}. Onaylıyor musunuz?`)) {
      setPartnerState({ ...partner, status: newStatus });
      alert(`Partner başarıyla ${action}.`);
    }
  };

  if (!partner) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          ← Geri Dön
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Partner bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Partner Detayı</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
              <Shield size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{partner.name}</h3>
              <p className="text-slate-500">{partner.id}</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            partner.status === 'active' ? 'bg-green-100 text-green-700' :
            partner.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {partner.status === 'active' ? 'Aktif' : partner.status === 'pending' ? 'Onay Bekliyor' : 'Askıda'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Mail size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-900">{partner.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Phone size={20} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Telefon</p>
              <p className="font-medium text-slate-900">{partner.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
            <div>
              <p className="text-xs text-slate-500">Puan</p>
              <p className="font-bold text-slate-900">{partner.rating}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <CheckCircle size={20} className="text-green-500" />
            <div>
              <p className="text-xs text-slate-500">Tamamlanan İşler</p>
              <p className="font-bold text-slate-900">{partner.completedJobs}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <DollarSign size={20} className="text-orange-600" />
            <div>
              <p className="text-xs text-orange-700 font-bold">Kredi Bakiyesi</p>
              <p className="font-black text-2xl text-orange-900">{partner.credits}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={handleEdit}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            Düzenle
          </button>
          <button 
            onClick={handleAddCredit}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Kredi Ekle
          </button>
          <button 
            onClick={handleToggleStatus}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            {partner.status === 'active' ? 'Askıya Al' : 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
