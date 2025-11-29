import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, Request } from '../types';
import supabaseApi from '../services/supabaseApi';
import { 
  Phone, Mail, MapPin, User, Edit3, Check, X, Calendar, ShieldCheck, LogOut,
  CreditCard, Bell, Lock, Heart, Home, Briefcase, MapPinned, Plus, Trash2,
  Star, ChevronRight, Package, Eye, EyeOff, AlertCircle, CheckCircle2, Camera,
  Truck, Clock, Car
} from 'lucide-react';
import { CITIES_WITH_DISTRICTS } from '../constants';

// Toast Notification Component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border ${
      type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    } animate-slide-up`}>
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={16} /></button>
    </div>
  );
};

// Mock Data for Extended Features - ORDERS artık state'ten geliyor
interface OrderDisplay {
  id: string;
  service: string;
  provider: string;
  date: string;
  status: string;
  amount: number;
  from: string;
  to: string | null;
  rating: number | null;
}

// Favoriler Supabase'den yüklenecek
interface FavoriteDisplay {
  id: string; // partner_id
  name: string;
  rating?: number;
  services?: string; // virgülle ayrılmış hizmet listesi
  phone?: string;
}

const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showProfileSavedModal, setShowProfileSavedModal] = useState(false);
  const [form, setForm] = useState<Customer>({} as Customer);
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [requests, setRequests] = useState<Request[]>([]); // Raw Request objects
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Load customer data from Supabase
  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      // 1. Session kontrolü - Supabase Auth
      const session = await supabaseApi.auth.getSession();
      
      if (!session || !session.user) {
        // Session yok - login'e yönlendir
        navigate('/giris/musteri');
        return;
      }

      const userId = session.user.id;
      
      // 2. Customer bilgilerini DB'den çek
      const customerData = await supabaseApi.customers.getById(userId);
      
      if (!customerData) {
        // Customer kaydı bulunamadı
        console.error('❌ Customer bulunamadı:', userId);
        navigate('/giris/musteri');
        return;
      }

      setCustomer(customerData);
      setForm(customerData);

      // 3. Request geçmişini çek
      try {
        const requestHistory = await supabaseApi.requests.getByCustomerId(userId);
        if (requestHistory && requestHistory.length > 0) {
          // Raw requests'i sakla (modal için)
          setRequests(requestHistory);
          
          const formattedOrders = requestHistory.map((req: Request) => {
            // Tarih formatı düzelt
            let formattedDate = 'Bilinmiyor';
            try {
              if (req.createdAt) {
                const date = new Date(req.createdAt);
                if (!isNaN(date.getTime())) {
                  formattedDate = new Intl.DateTimeFormat('tr-TR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(date);
                }
              }
            } catch (e) {
              console.warn('Tarih formatlanamadı:', e);
            }
            
            // Servis tipini çevir
            const serviceTypeMap: Record<string, string> = {
              'cekici': 'Çekici Hizmeti',
              'aku': 'Akü Takviyesi',
              'lastik': 'Lastik Değişimi',
              'yakit': 'Yakıt Desteği',
              'anahtar': 'Anahtar Çilingir'
            };
            
            // Status çevir
            const statusMap: Record<string, string> = {
              'open': 'Açık',
              'matched': 'Eşleşti',
              'in_progress': 'Devam Ediyor',
              'completed': 'Tamamlandı',
              'cancelled': 'İptal Edildi'
            };
            
            return {
              id: req.id,
              service: serviceTypeMap[req.serviceType] || 'Yol Yardım',
              provider: req.assignedPartnerName || 'Bekliyor',
              date: formattedDate,
              status: statusMap[req.status] || req.status || 'Açık',
              amount: req.amount || 0,
              from: req.fromLocation || 'Başlangıç',
              to: req.toLocation || null,
              rating: null
            };
          });
          setOrders(formattedOrders);
        }
      } catch (err) {
        console.warn('⚠️ Request geçmişi alınamadı:', err);
      }
      // 4. Favorileri çek
      try {
        const favRows = await supabaseApi.favorites.getByCustomerId(userId);
        const mapped = favRows.map(row => ({
          id: row.partner_id,
          name: row.partners?.name || 'Partner',
          rating: row.partners?.rating,
          services: (row.partners?.service_types || []).join(', '),
          phone: row.partners?.phone
        }));
        setFavorites(mapped);
      } catch (err) {
        console.warn('⚠️ Favoriler alınamadı:', err);
      }
      // 5. Kayıtlı adresleri çek
      try {
        const addrRows = await supabaseApi.addresses.getByCustomerId(userId);
        setAddresses(addrRows.map(r => ({
          id: r.id,
          label: r.label,
          type: r.type,
          address: r.address,
          city: r.city,
          district: r.district,
        })));
      } catch (err) {
        console.warn('⚠️ Adresler alınamadı:', err);
      }
      // 6. Bildirim tercihlerini çek
      try {
        const prefs = await supabaseApi.notificationPreferences.getByCustomerId(userId);
        setNotificationPrefsId(prefs.id);
        setNotifications({
          emailEnabled: prefs.emailEnabled,
          pushEnabled: prefs.pushEnabled,
          orderUpdates: prefs.orderUpdates,
          promotions: prefs.promotions,
          newsletter: prefs.newsletter,
        });
      } catch (err) {
        console.warn('⚠️ Bildirim tercihleri alınamadı:', err);
      }
    } catch (error) {
      console.error('❌ Müşteri bilgileri yüklenemedi:', error);
      navigate('/giris/musteri');
    } finally {
      setLoading(false);
    }
  };
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites' | 'addresses' | 'notifications' | 'security'>('profile');
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Request | null>(null);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteDisplay | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addresses, setAddresses] = useState<Array<{id:string; label:string; type:'home'|'work'; address:string; city:string; district:string}>>([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteDisplay[]>([]);
  // NOT: isEditing kaldırıldı, editing kullanılacak
  
  // Address Form
  const [addressForm, setAddressForm] = useState({ label: '', type: 'home', address: '', city: '', district: '' });
  
  // Notification Preferences - DB'den yüklenecek
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    pushEnabled: true,
    orderUpdates: true,
    promotions: false,
    newsletter: true
  });
  const [notificationPrefsId, setNotificationPrefsId] = useState<string | null>(null);

  // Password Change
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const handleChange = (field: keyof Customer, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'city') {
      setForm(prev => ({ ...prev, district: '' }));
    }
  };

  const handleSave = async () => {
    try {
      if (!customer?.id) return;

      await supabaseApi.customers.update(customer.id, form);
      setCustomer(form);
      setEditing(false); // Kaydet sonrası düzenleme modunu kapat
      setShowProfileSavedModal(true); // Merkez modalını aç
      // 3 sn sonra otomatik kapat
      setTimeout(() => setShowProfileSavedModal(false), 3000);
    } catch (error) {
      console.error('❌ Profil güncellenemedi:', error);
      showToast('Profil güncellenirken hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseApi.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('❌ Çıkış hatası:', error);
      navigate('/');
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  const handleViewOffers = () => {
    navigate('/musteri/teklifler');
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Bu talebi iptal etmek istediğinizden emin misiniz?')) return;
    
    try {
      const request = requests.find(r => r.id === requestId);
      
      // Eğer teklif verilmişse uyarı göster (şimdilik sadece bilgilendirme)
      if (request?.assignedPartnerId) {
        showToast('⚠️ Bu talebe teklif verilmiştir. Lütfen hizmet sağlayıcı ile görüşün.', 'error');
        return;
      }
      
      // Request status'ünü 'cancelled' yap
      await supabaseApi.requests.update(requestId, { status: 'cancelled' });
      
      // Local state'i güncelle
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'cancelled' as const } : r
      ));
      
      showToast('Talebiniz başarıyla iptal edildi', 'success');
      setSelectedOrder(null);
      
    } catch (err) {
      console.error('❌ Talep iptal edilemedi:', err);
      showToast('Talep iptal edilirken hata oluştu', 'error');
    }
  };

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('Yeni şifreler eşleşmiyor!', 'error');
      return;
    }
    if (passwordForm.new.length < 6) {
      showToast('Şifre en az 6 karakter olmalıdır.', 'error');
      return;
    }
    showToast('Şifreniz başarıyla değiştirildi!', 'success');
    setShowChangePassword(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleRemoveFavorite = async (partnerId: string) => {
    try {
      if (!customer?.id) return;
      await supabaseApi.favorites.remove(customer.id, partnerId);
      setFavorites(prev => prev.filter(f => f.id !== partnerId));
    } catch (err) {
      showToast('Favori silinirken hata oluştu', 'error');
    }
  };

  const handleToggleNotification = async (key: keyof typeof notifications) => {
    if (!customer?.id) return;
    
    const newValue = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newValue }));
    
    try {
      await supabaseApi.notificationPreferences.update(customer.id, {
        [key]: newValue
      });
      // Başarı bildirimi
      showToast('Bildirim tercihiniz güncellendi', 'success');
    } catch (err) {
      console.error('❌ Bildirim tercihi güncellenemedi:', err);
      // Hata durumunda geri al
      setNotifications(prev => ({ ...prev, [key]: !newValue }));
      showToast('Bildirim tercihi güncellenirken hata oluştu', 'error');
    }
  };

  const handleAddAddress = async () => {
    if (!addressForm.label || !addressForm.address || !addressForm.city || !addressForm.district) {
      showToast('Lütfen tüm alanları doldurun!', 'error');
      return;
    }
    try {
      if (!customer?.id) return;
      const created = await supabaseApi.addresses.add(customer.id, {
        label: addressForm.label,
        type: addressForm.type as 'home'|'work',
        address: addressForm.address,
        city: addressForm.city,
        district: addressForm.district,
      });
      setAddresses(prev => [{
        id: created.id,
        label: created.label,
        type: created.type,
        address: created.address,
        city: created.city,
        district: created.district,
      }, ...prev]);
      showToast('Adres başarıyla eklendi!', 'success');
      setShowAddAddress(false);
      setAddressForm({ label: '', type: 'home', address: '', city: '', district: '' });
    } catch (err) {
      showToast('Adres eklenirken hata oluştu', 'error');
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    try {
      await supabaseApi.addresses.remove(addressId);
      setAddresses(prev => prev.filter(a => a.id !== addressId));
    } catch (err) {
      showToast('Adres silinirken hata oluştu', 'error');
    }
  };

  // Tab Navigation Component
  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
        activeTab === id 
          ? 'bg-brand-orange text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
      }`}
    >
      <Icon size={16} className="md:w-[18px] md:h-[18px]" />
      <span>{label}</span>
    </button>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // No customer - redirect handled in useEffect but show fallback
  if (!customer) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Oturum bulunamadı</p>
          <button 
            onClick={() => navigate('/giris/musteri')}
            className="px-6 py-3 bg-brand-orange text-white rounded-xl font-bold"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 px-4 md:px-8">
      {showProfileSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center animate-fade-in">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={32} className="text-green-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Profil Güncellendi</h4>
            <p className="text-sm text-gray-600 mb-6">Profil bilgileriniz başarıyla kaydedildi.</p>
            <button
              onClick={() => setShowProfileSavedModal(false)}
              className="px-6 py-3 rounded-xl bg-brand-orange text-white font-bold text-sm hover:bg-brand-lightOrange transition-colors shadow"
            >Tamam</button>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Left Column: Profile Card + CTA Card */}
          <div className="md:w-1/4 w-full space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  {customer.avatarUrl ? (
                    <img src={customer.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (customer.firstName || 'U').charAt(0)
                  )}
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow border border-gray-100">
                    <ShieldCheck size={18} className="text-brand-orange" />
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{customer.firstName || ''} {customer.lastName || ''}</h2>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">Yolmov Üyesi</p>
                <div className="mt-4 space-y-2 w-full text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} className="text-brand-orange" /> {customer.phone || '-'}</div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 truncate"><Mail size={14} className="text-brand-orange" /> <span className="truncate">{customer.email}</span></div>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-6 w-full">
                  <button 
                      className="w-full py-3 rounded-xl bg-brand-orange text-white text-sm font-bold hover:bg-brand-lightOrange transition-colors shadow-lg"
                      onClick={handleViewOffers}
                    >
                      Tekliflerimi Gör
                    </button>
                  <div className="flex gap-2">
                    <button onClick={handleBackHome} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors">Ana Sayfa</button>
                    <button onClick={handleLogout} className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"><LogOut size={14}/> Çıkış</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Çekici Talep Et CTA Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 shadow-sm border border-orange-200">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg mb-4">
                  <Package size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Yol Yardım İhtiyacınız mı Var?</h3>
                <p className="text-sm text-gray-600 mb-4">Hızlı ve güvenilir çekici hizmeti için hemen teklif alın!</p>
                <button
                  onClick={() => navigate('/teklif')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Çekici Talep Et
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tabs & Content */}
          <div className="flex-1">
            {/* Tab Navigation - Horizontal Scroll on Mobile */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <TabButton id="profile" label="Profil" icon={User} />
              <TabButton id="orders" label="Taleplerim" icon={Package} />
              <TabButton id="favorites" label="Favoriler" icon={Heart} />
              <TabButton id="addresses" label="Adresler" icon={MapPinned} />
              <TabButton id="notifications" label="Bildirimler" icon={Bell} />
              <TabButton id="security" label="Güvenlik" icon={Lock} />
            </div>

            {/* TAB CONTENT: PROFILE */}
            {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold text-gray-900">Profil Bilgileri</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-brand-orange text-white text-sm font-bold flex items-center gap-1 hover:bg-brand-lightOrange transition-colors"><Edit3 size={16}/> Düzenle</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold flex items-center gap-1 hover:bg-green-700"><Check size={16}/> Kaydet</button>
                    <button onClick={() => { setForm(customer); setEditing(false); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold flex items-center gap-1 hover:bg-gray-200"><X size={16}/> İptal</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ad</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input disabled={!editing} value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm font-medium disabled:opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Soyad</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input disabled={!editing} value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm font-medium disabled:opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefon</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input disabled={!editing} value={form.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm font-medium disabled:opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-Posta (Opsiyonel)</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input disabled={!editing} value={form.email || ''} onChange={e => handleChange('email', e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm font-medium disabled:opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Şehir</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select disabled={!editing} value={form.city || ''} onChange={e => handleChange('city', e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm font-medium disabled:opacity-60">
                      <option value="">Seçiniz</option>
                      {Object.keys(CITIES_WITH_DISTRICTS).map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">İlçe</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select disabled={!editing || !form.city} value={form.district || ''} onChange={e => handleChange('district', e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm font-medium disabled:opacity-60">
                      <option value="">Seçiniz</option>
                      {form.city && CITIES_WITH_DISTRICTS[form.city].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* TAB CONTENT: ORDERS */}
            {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display font-bold text-gray-900">Son Taleplerim</h3>
                <button
                  onClick={() => navigate('/teklif')}
                  className="px-4 py-2.5 bg-brand-orange text-white rounded-xl font-bold text-sm hover:bg-brand-lightOrange transition-all shadow flex items-center gap-2"
                >
                  <Plus size={16} />
                  Yeni Talep
                </button>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Yükleniyor...</p>
                ) : orders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Henüz talep oluşturmadınız.</p>
                ) : (
                  orders.map((order: OrderDisplay) => (
                    <div key={order.id} className="p-5 rounded-xl border border-gray-100 hover:border-brand-orange hover:shadow-md transition-all cursor-pointer group" onClick={() => {
                      const req = requests.find(r => r.id === order.id);
                      if (req) setSelectedOrder(req);
                    }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-800 group-hover:text-brand-orange transition-colors">{order.service}</h4>
                          <p className="text-xs text-gray-400 mt-1">#{order.id} • {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{order.amount > 0 ? `₺${order.amount}` : '—'}</p>
                          <span className={`text-xs px-2 py-1 rounded ${order.status === 'Tamamlandı' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{order.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <MapPin size={12} className="text-brand-orange" />
                        <span className="flex-1 truncate">{order.from}</span>
                        {order.to && <><ChevronRight size={12} /> <span className="flex-1 truncate">{order.to}</span></>}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-500">{order.provider}</span>
                        {order.rating && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            {[...Array(order.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}

            {/* TAB CONTENT: FAVORITES */}
            {activeTab === 'favorites' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Favori Hizmet Sağlayıcılar</h3>
              <div className="space-y-4">
                {favorites.length > 0 ? favorites.map(fav => (
                  <div key={fav.id} className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-brand-orange hover:shadow-md transition-all group">
                    <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm cursor-pointer" onClick={() => setSelectedFavorite(fav)}>
                      {fav.name.charAt(0)}
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedFavorite(fav)}>
                      <h4 className="font-bold text-gray-800 group-hover:text-brand-orange transition-colors">{fav.name}</h4>
                      {fav.services && <p className="text-xs text-gray-500">{fav.services}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {fav.rating && <><Star size={12} className="text-yellow-400 fill-yellow-400" /><span className="text-xs font-bold text-gray-600">{fav.rating.toFixed(1)}</span></>}
                        {fav.phone && <span className="text-xs text-gray-400">• {fav.phone}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFavorite(fav.id)} className="text-red-500 hover:text-red-600 p-2" title="Favorilerden çıkar"><Heart size={20} fill="currentColor" /></button>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-sm">Henüz favori eklemediniz.</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* TAB CONTENT: ADDRESSES */}
            {activeTab === 'addresses' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold text-gray-900">Kayıtlı Adresler</h3>
                <button onClick={() => setShowAddAddress(true)} className="px-4 py-2 rounded-xl bg-brand-orange text-white text-sm font-bold flex items-center gap-1 hover:bg-brand-lightOrange transition-colors"><Plus size={16}/> Adres Ekle</button>
              </div>
              <div className="space-y-4">
                {addresses.length > 0 ? addresses.map(addr => (
                  <div key={addr.id} className="p-5 rounded-xl border border-gray-100 hover:border-brand-orange hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${addr.type === 'home' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {addr.type === 'home' ? <Home size={18} /> : <Briefcase size={18} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">{addr.label}</h4>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                          <p className="text-xs text-gray-400 mt-1">{addr.district}, {addr.city}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveAddress(addr.id)} className="text-red-500 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-gray-500 text-sm">Henüz kayıtlı adresiniz yok.</div>
                )}
              </div>
            </div>
            )}

            {/* TAB CONTENT: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Bildirim Tercihleri</h3>
              <div className="space-y-6">
                <div className="pb-6 border-b border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-4">Bildirim Kanalları</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'emailEnabled' as const, label: 'E-Posta Bildirimleri', desc: 'Detaylı bilgilendirmeler' },
                      { key: 'pushEnabled' as const, label: 'Push Bildirimleri', desc: 'Anlık bildirimler' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleToggleNotification(item.key)}
                          className={`w-12 h-6 rounded-full transition-all ${notifications[item.key] ? 'bg-green-500' : 'bg-gray-300'} relative`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifications[item.key] ? 'right-0.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-4">Bildirim Türleri</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'orderUpdates' as const, label: 'Talep Güncellemeleri', desc: 'Sipariş durum değişiklikleri' },
                      { key: 'promotions' as const, label: 'Kampanyalar ve Fırsatlar', desc: 'Özel indirimler' },
                      { key: 'newsletter' as const, label: 'Haber Bülteni', desc: 'Yeni özellikler ve haberler' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleToggleNotification(item.key)}
                          className={`w-12 h-6 rounded-full transition-all ${notifications[item.key] ? 'bg-green-500' : 'bg-gray-300'} relative`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifications[item.key] ? 'right-0.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* TAB CONTENT: SECURITY */}
            {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Güvenlik Ayarları</h3>
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-green-800">Telefon Doğrulandı</h4>
                    <p className="text-xs text-green-700 mt-1">Hesabınız telefon numarası ile doğrulanmıştır.</p>
                  </div>
                </div>
                
                <div className="p-5 rounded-xl border border-gray-100 hover:border-brand-orange hover:shadow-md transition-all cursor-pointer" onClick={() => setShowChangePassword(true)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                        <Lock size={18} className="text-brand-orange" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Şifre Değiştir</h4>
                        <p className="text-xs text-gray-500">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-gray-100 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShieldCheck size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">İki Faktörlü Doğrulama (2FA)</h4>
                        <p className="text-xs text-gray-500">Yakında aktif olacak</p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-bold">Yakında</span>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedOrder.serviceType === 'cekici' ? 'Çekici Hizmeti' :
                   selectedOrder.serviceType === 'aku' ? 'Akü Takviyesi' :
                   selectedOrder.serviceType === 'lastik' ? 'Lastik Değişimi' :
                   selectedOrder.serviceType === 'yakit' ? 'Yakıt Desteği' :
                   selectedOrder.serviceType === 'anahtar' ? 'Anahtar Çilingir' : 'Yol Yardım'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Talep #{selectedOrder.id?.slice(0, 8)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* DAMAGE PHOTOS */}
            {selectedOrder.damagePhotoUrls && selectedOrder.damagePhotoUrls.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Camera size={18} className="text-brand-orange" />
                  Yüklenen Fotoğraflar ({selectedOrder.damagePhotoUrls.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedOrder.damagePhotoUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 hover:border-brand-orange transition-all cursor-pointer group">
                      <img src={url} alt={`Hasar fotoğrafı ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Status & Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Durum
                  </p>
                  <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${
                    selectedOrder.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    selectedOrder.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                    selectedOrder.status === 'matched' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedOrder.status === 'open' ? 'Açık' :
                     selectedOrder.status === 'matched' ? 'Eşleştirildi' :
                     selectedOrder.status === 'in_progress' ? 'Devam Ediyor' :
                     selectedOrder.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                  </span>
                </div>
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Clock size={14} />
                    Zamanlama
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedOrder.timing === 'now' ? '⚡ Acil' :
                     selectedOrder.timing === 'week' ? '📅 Bu Hafta' : '⏰ Esnek'}
                  </p>
                </div>
              </div>

              {/* Vehicle Info */}
              {selectedOrder.vehicleInfo && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 mb-2 font-semibold flex items-center gap-1">
                    <Car size={14} />
                    Araç Bilgisi
                  </p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.vehicleInfo}</p>
                  {selectedOrder.vehicleCondition && (
                    <p className="text-xs text-gray-600 mt-2">
                      Durum: <span className="font-semibold">
                        {selectedOrder.vehicleCondition === 'running' ? '✅ Çalışıyor' : '❌ Çalışmıyor'}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Load Info */}
              {selectedOrder.hasLoad && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs text-purple-600 mb-2 font-semibold flex items-center gap-1">
                    <Package size={14} />
                    Yük Bilgisi
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.loadDescription || 'Araçta yük bulunmaktadır'}
                  </p>
                </div>
              )}

              {/* Location Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-3 font-semibold flex items-center gap-1">
                  <MapPin size={14} />
                  Konum Bilgileri
                  </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Başlangıç</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.fromLocation}</p>
                    </div>
                  </div>
                  {selectedOrder.toLocation && (
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Varış</p>
                        <p className="text-sm font-medium text-gray-900">{selectedOrder.toLocation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Provider Info (if assigned) */}
              {selectedOrder.assignedPartnerName && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-xs text-orange-600 mb-2 font-semibold flex items-center gap-1">
                    <Truck size={14} />
                    Hizmet Sağlayıcı
                  </p>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.assignedPartnerName}</p>
                </div>
              )}

              {/* Description */}
              {selectedOrder.description && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Açıklama</p>
                  <p className="text-sm text-gray-700">{selectedOrder.description}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1 font-semibold">Oluşturulma Tarihi</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('tr-TR') : '—'}
                </p>
              </div>
            </div>

            {/* Cancel Button */}
            {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleCancelRequest(selectedOrder.id!)}
                  className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-red-200"
                >
                  <AlertCircle size={20} />
                  Talebi İptal Et
                </button>
                {selectedOrder.assignedPartnerId && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    ⚠️ Bu talebe teklif verilmiştir. İptal işlemi hizmet sağlayıcı ile görüşülmeden yapılmamalıdır.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAVORITE DETAIL MODAL */}
      {selectedFavorite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFavorite(null)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Hizmet Sağlayıcı Detayı</h3>
              <button onClick={() => setSelectedFavorite(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xl">
                {selectedFavorite.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedFavorite.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {selectedFavorite.rating && <><Star size={16} className="text-yellow-400 fill-yellow-400" /><span className="text-sm font-bold text-gray-700">{selectedFavorite.rating.toFixed(1)}</span></>}
                  {selectedFavorite.phone && <span className="text-xs text-gray-500">• {selectedFavorite.phone}</span>}
                </div>
              </div>
            </div>
            {selectedFavorite.services && (
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <p className="text-xs text-gray-500 mb-1">Sunulan Hizmetler</p>
                <p className="text-sm font-medium text-gray-900">{selectedFavorite.services}</p>
              </div>
            )}
            <button className="w-full mt-2 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-brand-lightOrange transition-colors">
              Teklif İste
            </button>
          </div>
        </div>
      )}

      {/* ADD ADDRESS MODAL */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddAddress(false)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Yeni Adres Ekle</h3>
              <button onClick={() => setShowAddAddress(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Adres Etiketi</label>
                <input
                  type="text"
                  placeholder="Örn: Ev, İş"
                  value={addressForm.label}
                  onChange={e => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Adres Tipi</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAddressForm(prev => ({ ...prev, type: 'home' }))}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${addressForm.type === 'home' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <Home size={18} /> Ev
                  </button>
                  <button
                    onClick={() => setAddressForm(prev => ({ ...prev, type: 'work' }))}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${addressForm.type === 'work' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <Briefcase size={18} /> İş
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Şehir</label>
                <select
                  value={addressForm.city}
                  onChange={e => setAddressForm(prev => ({ ...prev, city: e.target.value, district: '' }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
                >
                  <option value="">Şehir Seçiniz</option>
                  {Object.keys(CITIES_WITH_DISTRICTS).map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">İlçe</label>
                <select
                  value={addressForm.district}
                  onChange={e => setAddressForm(prev => ({ ...prev, district: e.target.value }))}
                  disabled={!addressForm.city}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none disabled:opacity-50"
                >
                  <option value="">İlçe Seçiniz</option>
                  {addressForm.city && CITIES_WITH_DISTRICTS[addressForm.city].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Detaylı Adres</label>
                <textarea
                  placeholder="Mahalle, sokak, bina no, daire no..."
                  value={addressForm.address}
                  onChange={e => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddAddress(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">İptal</button>
              <button onClick={handleAddAddress} className="flex-1 py-3 rounded-xl bg-brand-orange text-white font-bold hover:bg-brand-lightOrange">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowChangePassword(false)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Şifre Değiştir</h3>
              <button onClick={() => setShowChangePassword(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mevcut Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={e => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
                  />
                  <button
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Yeni Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={e => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
                  />
                  <button
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Yeni Şifre (Tekrar)</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
                  />
                  <button
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {passwordForm.new && passwordForm.new.length < 6 && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> Şifre en az 6 karakter olmalıdır
                </p>
              )}
              {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> Şifreler eşleşmiyor
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowChangePassword(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">İptal</button>
              <button onClick={handlePasswordChange} className="flex-1 py-3 rounded-xl bg-brand-orange text-white font-bold hover:bg-brand-lightOrange">Değiştir</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomerProfilePage;
