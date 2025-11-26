import React, { useState, lazy, Suspense } from 'react';
import { Users, Shield, FileText, Search, Eye, Edit, Trash2, UserPlus, CheckCircle, DollarSign, Mail, Phone } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { AdminRole } from '../../types';
import { useAdminFilter } from './hooks/useAdminFilter';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import LoadingSkeleton from './ui/LoadingSkeleton';

const AdminOffersTab = lazy(() => import('./tabs/AdminOffersTab'));
const AdminReportsTab = lazy(() => import('./tabs/AdminReportsTab'));

interface AdminDashboardProps { onLogout: () => void; }

interface User {
  id: string; name: string; email: string;
  type: 'customer' | 'partner'; status: 'active' | 'suspended'; joinDate: string;
  totalSpent?: number; totalEarned?: number;
}
interface Partner {
  id: string; name: string; email: string; phone: string; rating: number;
  completedJobs: number; credits: number; status: 'active' | 'pending' | 'suspended';
}
interface RequestLog {
  id: string; customerId: string; customerName: string; serviceType: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled'; createdAt: string; amount?: number;
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
const MOCK_REQUESTS: RequestLog[] = [
  { id: 'REQ-001', customerId: 'USR-001', customerName: 'Ahmet Yılmaz', serviceType: 'cekici', status: 'completed', createdAt: '2023-11-22 14:30', amount: 850 },
  { id: 'REQ-002', customerId: 'USR-002', customerName: 'Selin Kaya', serviceType: 'aku', status: 'matched', createdAt: '2023-11-23 09:15', amount: 400 },
  { id: 'REQ-003', customerId: 'USR-001', customerName: 'Ahmet Yılmaz', serviceType: 'lastik', status: 'open', createdAt: '2023-11-24 11:00' },
];
const MOCK_OFFERS: OfferLog[] = [
  { id: 'OFF-001', partnerId: 'PTR-001', partnerName: 'Yılmaz Oto', requestId: 'REQ-001', price: 850, status: 'accepted', createdAt: '2023-11-22 14:35' },
  { id: 'OFF-002', partnerId: 'PTR-002', partnerName: 'Hızlı Yol', requestId: 'REQ-002', price: 400, status: 'accepted', createdAt: '2023-11-23 09:20' },
  { id: 'OFF-003', partnerId: 'PTR-001', partnerName: 'Yılmaz Oto', requestId: 'REQ-003', price: 600, status: 'sent', createdAt: '2023-11-24 11:05' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'partners' | 'requests' | 'offers' | 'reports'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const currentAdminRole: AdminRole = AdminRole.SUPER_ADMIN;

  const usersFilter = useAdminFilter(MOCK_USERS, { searchKeys: ['name','email'] });
  const partnersFilter = useAdminFilter(MOCK_PARTNERS, { searchKeys: ['name','email'], statusKey: 'status' });
  const requestsFilter = useAdminFilter(MOCK_REQUESTS, { searchKeys: ['id','customerName'], statusKey: 'status' });

  const stats = {
    totalUsers: MOCK_USERS.filter(u => u.type === 'customer').length,
    totalPartners: MOCK_PARTNERS.length,
    activeRequests: MOCK_REQUESTS.filter(r => r.status === 'open').length,
    completedRequests: MOCK_REQUESTS.filter(r => r.status === 'completed').length,
    totalRevenue: MOCK_REQUESTS.filter(r => r.amount).reduce((sum, r) => sum + (r.amount || 0), 0),
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {mobileSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />}
      <div className="hidden md:block">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={(id) => setActiveTab(id as any)}
          onLogout={onLogout}
          role={currentAdminRole}
        />
      </div>
      <div className={`fixed inset-y-0 left-0 z-40 transform md:hidden transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={(id) => setActiveTab(id as any)}
          onLogout={onLogout}
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
                  <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.completedRequests}</h3>
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
                <h3 className="text-lg font-bold text-slate-900 mb-4">Son Aktiviteler</h3>
                <div className="space-y-3">
                  {MOCK_REQUESTS.slice(0,5).map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
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
                <button className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 flex items-center gap-2" aria-label="Yeni kullanıcı oluştur">
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
                            <div>
                              <p className="font-bold text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4" role="cell"><span className={`px-3 py-1 rounded-full text-xs font-bold ${user.type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{user.type === 'customer' ? 'Müşteri' : 'Partner'}</span></td>
                          <td className="px-6 py-4" role="cell"><StatusBadge type="user" status={user.status} /></td>
                          <td className="px-6 py-4 text-sm text-slate-600" role="cell">{user.joinDate}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900" role="cell">₺{(user.totalSpent || user.totalEarned || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right" role="cell">
                            <button className="p-2 text-slate-400 hover:text-blue-600" aria-label={`Kullanıcı ${user.id} görüntüle`}><Eye size={18} /></button>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="region" aria-label="Partner kartları">
                {partnersFilter.filtered.length === 0 ? <EmptyState title="Partner Yok" description="Arama kriterine uygun partner yok." /> : partnersFilter.filtered.map(partner => (
                  <div key={partner.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items_center gap-3">
                        <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center"><Shield size={28} className="text-orange-600" /></div>
                        <div>
                          <h3 className="font-bold text-slate-900">{partner.name}</h3>
                          <p className="text-xs text-slate-500">{partner.id}</p>
                        </div>
                      </div>
                      <StatusBadge type="partner" status={partner.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500 mb-1">Tamamlanan</p><p className="text-xl font-bold text-slate-900">{partner.completedJobs}</p></div>
                      <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500 mb-1">Puan</p><p className="text-xl font-bold text-yellow-600">★ {partner.rating}</p></div>
                    </div>
                    <div className="flex items-center justify_between text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2"><Mail size={16} /><span>{partner.email}</span></div>
                      <div className="flex items-center gap-2"><Phone size={16} /><span>{partner.phone}</span></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm"><DollarSign size={16} className="text-orange-500" /><span className="font-bold text-slate-900">{partner.credits} Kredi</span></div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100" aria-label={`Partner ${partner.id} görüntüle`}>Görüntüle</button>
                        <button className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100" aria-label={`Partner ${partner.id} düzenle`}>Düzenle</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6" id="panel-requests" role="tabpanel" aria-labelledby="requests">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Talep ara..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={requestsFilter.searchTerm}
                    onChange={(e) => requestsFilter.setSearchTerm(e.target.value)}
                    aria-label="Talep arama"
                  />
                </div>
                <select
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={requestsFilter.filterType}
                  onChange={(e) => requestsFilter.setFilterType(e.target.value)}
                  aria-label="Talep durum filtresi"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="open">Açık</option>
                  <option value="matched">Eşleşti</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" role="region" aria-label="Talep tablosu">
                {requestsFilter.filtered.length === 0 ? <EmptyState title="Talep Yok" description="Arama kriterine uygun talep yok." /> : (
                  <table className="w-full" role="table">
                    <thead className="bg-slate-50 border-b border-slate-200" role="rowgroup">
                      <tr role="row">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Talep ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Müşteri</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Hizmet</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Durum</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Tarih</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase" role="columnheader">Tutar</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase" role="columnheader">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100" role="rowgroup">
                      {requestsFilter.filtered.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50" role="row">
                          <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900" role="cell">{req.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-900" role="cell">{req.customerName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600" role="cell">{req.serviceType}</td>
                          <td className="px-6 py-4" role="cell"><StatusBadge type="request" status={req.status} /></td>
                          <td className="px-6 py-4 text-sm text-slate-600" role="cell">{req.createdAt}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900" role="cell">{req.amount ? `₺${req.amount}` : '-'}</td>
                          <td className="px-6 py-4 text-right" role="cell"><button className="p-2 text-slate-400 hover:text-blue-600" aria-label={`Talep ${req.id} görüntüle`}><Eye size={18} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminOffersTab data={MOCK_OFFERS} /></Suspense>
          )}
          {activeTab === 'reports' && (
            <Suspense fallback={<LoadingSkeleton rows={6} />}><AdminReportsTab /></Suspense>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
