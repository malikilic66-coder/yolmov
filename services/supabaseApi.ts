/**
 * YOLMOV SUPABASE API SERVICE
 * 
 * localStorage tabanlı mockApi.ts yerine gerçek Supabase PostgreSQL veritabanı kullanımı
 * 
 * ÖZELLIKLER:
 * - Gerçek zamanlı veri senkronizasyonu
 * - Row Level Security (RLS) ile güvenlik
 * - PostgreSQL ilişkisel veritabanı
 * - Dosya yükleme için Supabase Storage
 * - Auth ile kullanıcı kimlik doğrulama
 */

import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';
import type {
  Customer,
  AdminUser,
  Request,
  Offer,
  CompletedJob,
  PartnerReview,
  ReviewObjection,
  PartnerDocument,
  SupportTicket,
  PartnerVehicle,
  PartnerCredit,
  CreditTransaction,
  EmptyTruckRoute,
  PartnerLeadRequest,
  ServiceAreaRequest,
  SystemLog,
} from '../types';

// Partner interface (types.ts'de eksik olduğu için burada tanımlıyoruz)
interface Partner {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  services?: string[];
  rating?: number;
  created_at: string;
  updated_at?: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Hata yönetimi için yardımcı fonksiyon
 */
const handleError = (error: any, operation: string) => {
  console.error(`[Supabase API Error] ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`);
};

/**
 * ID oluşturucu (UUID yerine kullanılabilir)
 */
const generateId = () => {
  return crypto.randomUUID();
};

// ============================================
// AUTHENTICATION
// ============================================

export const authApi = {
  /**
   * Müşteri kaydı - Email doğrulama ile
   */
  signUpCustomer: async (email: string, password: string, customerData: Partial<Customer>) => {
    try {
      // Telefon numarası validasyonu
      if (!customerData.phone || customerData.phone.length < 10) {
        throw new Error('Telefon numarası gerekli (minimum 10 karakter)');
      }

      // 1. Auth kullanıcısı oluştur (Email confirmation otomatik gönderilir)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-dogrulama`,
          data: {
            user_type: 'customer',
            first_name: customerData.firstName,
            last_name: customerData.lastName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

      // 2. Customer kaydı oluştur (snake_case)
      const dbCustomer = {
        id: authData.user.id,
        first_name: customerData.firstName || '',
        last_name: customerData.lastName || '',
        phone: customerData.phone, // Artık validasyon yapıldı, kesinlikle var
        email: email,
        avatar_url: customerData.avatarUrl || null,
        city: customerData.city || null,
        district: customerData.district || null,
      };

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert(dbCustomer)
        .select()
        .single();

      if (customerError) {
        // Rollback: Auth user'ı sil
        console.error('❌ Customer insert failed, rolling back auth user:', customerError);
        await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
        
        // Detaylı hata mesajı
        if (customerError.code === '23505') {
          if (customerError.message.includes('phone')) {
            throw new Error('Bu telefon numarası zaten kayıtlı');
          }
          if (customerError.message.includes('email')) {
            throw new Error('Bu email adresi zaten kayıtlı');
          }
        }
        throw customerError;
      }

      // snake_case → camelCase dönüşümü
      const customerCamelCase: Customer = {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        email: customer.email || undefined,
        avatarUrl: customer.avatar_url || undefined,
        city: customer.city || undefined,
        district: customer.district || undefined,
        createdAt: customer.created_at,
      };

      return { 
        user: authData.user, 
        customer: customerCamelCase,
        session: authData.session 
      };
    } catch (error) {
      handleError(error, 'Customer Sign Up');
      throw error;
    }
  },

  /**
   * Partner kaydı
   */
  signUpPartner: async (email: string, password: string, partnerData: Partial<Partner>) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'partner',
            ...partnerData,
          },
        },
      });

      if (authError) throw authError;

      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .insert({
          id: authData.user!.id,
          ...partnerData,
          email,
        })
        .select()
        .single();

      if (partnerError) throw partnerError;

      // Partner için kredi bakiyesi oluştur
      await supabase.from('partner_credits').insert({
        partner_id: partner.id,
        partner_name: partner.name,
        balance: 0,
        total_purchased: 0,
        total_used: 0,
      });

      return { user: authData.user, partner };
    } catch (error) {
      handleError(error, 'Partner Sign Up');
    }
  },

  /**
   * Giriş yap - Email + Password
   * RAW FETCH KULLANIMI - Supabase SDK storage problemi yüzünden
   */
  signIn: async (email: string, password: string) => {
    try {
      console.log('🔐 signIn started for:', email);
      
      const authUrl = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
      const apiKey = SUPABASE_ANON_KEY;
      
      console.log('🔐 Using RAW FETCH to Supabase auth...');
      const startTime = Date.now();
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ email, password })
      });
      
      const duration = Date.now() - startTime;
      console.log('🔐 Auth response received in', `${duration}ms`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔐 Auth failed:', errorData);
        
        if (errorData.error_description?.includes('Invalid login credentials')) {
          throw new Error('Email veya şifre hatalı');
        }
        if (errorData.error_description?.includes('Email not confirmed')) {
          throw new Error('Email adresinizi doğrulamanız gerekiyor. Lütfen mail kutunuzu kontrol edin.');
        }
        throw new Error(errorData.error_description || 'Giriş başarısız');
      }
      
      const authData = await response.json();
      console.log('🔐 Auth successful:', {
        hasAccessToken: !!authData.access_token,
        hasUser: !!authData.user,
        userId: authData.user?.id
      });
      
      if (!authData.user) {
        throw new Error('Kullanıcı bilgisi alınamadı');
      }
      
      // Session'ı manuel olarak localStorage'a kaydet
      const session = {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in: authData.expires_in,
        expires_at: authData.expires_at,
        user: authData.user
      };
      
      localStorage.setItem('yolmov-auth-session', JSON.stringify(session));
      console.log('💾 Session saved to localStorage');
      
      // Customer kaydını kontrol et
      console.log('🔐 Checking customer record...');
      const customerResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/customers?id=eq.${authData.user.id}&select=id`,
        {
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${authData.access_token}`
          }
        }
      );
      
      const customers = await customerResponse.json();
      console.log('🔐 Customer check result:', { count: customers?.length });
      
      if (!customers || customers.length === 0) {
        console.error('❌ Customer record not found');
        throw new Error('Kayıt işleminiz tamamlanmamış. Lütfen tekrar kayıt olmayı deneyin.');
      }
      
      console.log('✅ signIn successful');
      return { 
        user: authData.user, 
        session: session
      };
    } catch (error: any) {
      console.error('❌ Sign In Error:', error);
      throw error;
    }
  },

  /**
   * Çıkış yap
   */
  signOut: async () => {
    try {
      // Manual sign out: clear local session
      localStorage.removeItem('yolmov-auth-session');
    } catch (error) {
      handleError(error, 'Sign Out');
    }
  },

  /**
   * Mevcut kullanıcıyı getir
   */
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('❌ Get Current User Error:', error);
      return null;
    }
  },

  /**
   * Mevcut session'ı getir - Manuel localStorage okuma
   */
  getSession: async () => {
    try {
      const sessionStr = localStorage.getItem('yolmov-auth-session');
      if (!sessionStr) return null;
      
      const session = JSON.parse(sessionStr);
      
      // Token süresi dolmuş mu kontrol et
      if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
        console.log('⏰ Session expired, clearing...');
        localStorage.removeItem('yolmov-auth-session');
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('❌ Get Session Error:', error);
      return null;
    }
  },

  /**
   * Session state değişikliklerini dinle - Manuel storage event
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'yolmov-auth-session') {
        const sessionStr = e.newValue;
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          callback('SIGNED_IN', session);
        } else {
          callback('SIGNED_OUT', null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('storage', handleStorageChange);
          }
        }
      }
    };
  },

  /**
   * Kullanıcı rolünü getir
   */
  getUserRole: async () => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) return null;

      // Admin kontrolü
      const { data: admin } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (admin) return { type: 'admin', role: admin.role };

      // Partner kontrolü
      const { data: partner } = await supabase
        .from('partners')
        .select('status')
        .eq('id', user.id)
        .single();

      if (partner) return { type: 'partner', status: partner.status };

      // Customer kontrolü
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', user.id)
        .single();

      if (customer) return { type: 'customer' };

      return null;
    } catch (error) {
      handleError(error, 'Get User Role');
    }
  },
};

// ============================================
// CUSTOMERS API
// ============================================

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // snake_case → camelCase
      return (data || []).map(d => ({
        id: d.id,
        firstName: d.first_name,
        lastName: d.last_name,
        phone: d.phone,
        email: d.email,
        avatarUrl: d.avatar_url,
        city: d.city,
        district: d.district,
        createdAt: d.created_at,
      }));
    } catch (error) {
      handleError(error, 'Get All Customers');
      return [];
    }
  },

  getById: async (id: string): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // snake_case → camelCase
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        email: data.email,
        avatarUrl: data.avatar_url,
        city: data.city,
        district: data.district,
        createdAt: data.created_at,
      };
    } catch (error) {
      handleError(error, `Get Customer ${id}`);
      return null;
    }
  },

  create: async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    try {
      // camelCase → snake_case dönüşümü
      const dbCustomer = {
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone: customer.phone || '',
        email: customer.email || null,
        avatar_url: customer.avatarUrl || null,
        city: customer.city || null,
        district: customer.district || null,
      };

      const { data, error } = await supabase
        .from('customers')
        .insert(dbCustomer)
        .select()
        .single();

      if (error) throw error;
      
      // snake_case → camelCase dönüşümü
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        email: data.email || undefined,
        avatarUrl: data.avatar_url || undefined,
        city: data.city || undefined,
        district: data.district || undefined,
        createdAt: data.created_at,
      };
    } catch (error) {
      handleError(error, 'Create Customer');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    try {
      // camelCase → snake_case
      const dbUpdates: any = {};
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.district !== undefined) dbUpdates.district = updates.district;

      const { data, error } = await supabase
        .from('customers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // snake_case → camelCase
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        email: data.email,
        avatarUrl: data.avatar_url,
        city: data.city,
        district: data.district,
        createdAt: data.created_at,
      };
    } catch (error) {
      handleError(error, `Update Customer ${id}`);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, `Delete Customer ${id}`);
    }
  },
};

// ============================================
// PARTNERS API
// ============================================

export const partnersApi = {
  getAll: async (): Promise<Partner[]> => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Partners');
      return [];
    }
  },

  getActive: async (): Promise<Partner[]> => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('status', 'active')
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get Active Partners');
      return [];
    }
  },

  getById: async (id: string): Promise<Partner | null> => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Get Partner ${id}`);
      return null;
    }
  },

  update: async (id: string, updates: Partial<Partner>): Promise<Partner> => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Partner ${id}`);
      throw error;
    }
  },

  approve: async (id: string): Promise<Partner> => {
    return partnersApi.update(id, { status: 'active' });
  },

  suspend: async (id: string): Promise<Partner> => {
    return partnersApi.update(id, { status: 'suspended' });
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, `Delete Partner ${id}`);
    }
  },
};

// ============================================
// REQUESTS API
// ============================================

export const requestsApi = {
  getAll: async (): Promise<Request[]> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Requests');
      return [];
    }
  },

  getByCustomerId: async (customerId: string): Promise<Request[]> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Requests for Customer ${customerId}`);
      return [];
    }
  },

  getByPartnerId: async (partnerId: string): Promise<Request[]> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('assigned_partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Requests for Partner ${partnerId}`);
      return [];
    }
  },

  getOpen: async (): Promise<Request[]> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get Open Requests');
      return [];
    }
  },

  getById: async (id: string): Promise<Request | null> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Get Request ${id}`);
      return null;
    }
  },

  create: async (request: Omit<Request, 'id' | 'createdAt'>): Promise<Request> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Request');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Request>): Promise<Request> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Request ${id}`);
      throw error;
    }
  },

  updateStatus: async (id: string, status: Request['status']): Promise<Request> => {
    return requestsApi.update(id, { status });
  },

  updateJobStage: async (
    id: string,
    jobStage: 0 | 1 | 2 | 3 | 4,
    assignedPartnerId?: string,
    assignedPartnerName?: string
  ): Promise<Request> => {
    return requestsApi.update(id, {
      jobStage,
      assignedPartnerId,
      assignedPartnerName,
      stageUpdatedAt: new Date().toISOString(),
    });
  },

  assignPartner: async (
    requestId: string,
    partnerId: string,
    partnerName: string
  ): Promise<Request> => {
    return requestsApi.update(requestId, {
      assignedPartnerId: partnerId,
      assignedPartnerName: partnerName,
      status: 'matched',
      jobStage: 0,
      stageUpdatedAt: new Date().toISOString(),
    });
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, `Delete Request ${id}`);
    }
  },
};

// ============================================
// OFFERS API
// ============================================

export const offersApi = {
  getAll: async (): Promise<Offer[]> => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Offers');
      return [];
    }
  },

  getByRequestId: async (requestId: string): Promise<Offer[]> => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('request_id', requestId)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Offers for Request ${requestId}`);
      return [];
    }
  },

  getByPartnerId: async (partnerId: string): Promise<Offer[]> => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Offers for Partner ${partnerId}`);
      return [];
    }
  },

  create: async (offer: Omit<Offer, 'id' | 'createdAt'>): Promise<Offer> => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .insert(offer)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Offer');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Offer>): Promise<Offer> => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Offer ${id}`);
      throw error;
    }
  },

  accept: async (offerId: string): Promise<Offer> => {
    try {
      // 1. Teklifi kabul et
      const offer = await offersApi.update(offerId, { status: 'accepted' });

      // 2. Aynı talebe ait diğer teklifleri reddet
      const { error: rejectError } = await supabase
        .from('offers')
        .update({ status: 'rejected' })
        .eq('request_id', offer.requestId)
        .neq('id', offerId);

      if (rejectError) throw rejectError;

      // 3. Talebi güncelle (eşleşti durumuna al)
      await requestsApi.assignPartner(
        offer.requestId,
        offer.partnerId,
        offer.partnerName || 'Partner'
      );

      return offer;
    } catch (error) {
      handleError(error, `Accept Offer ${offerId}`);
      throw error;
    }
  },

  reject: async (id: string): Promise<Offer> => {
    return offersApi.update(id, { status: 'rejected' });
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, `Delete Offer ${id}`);
    }
  },
};

// ============================================
// COMPLETED JOBS API
// ============================================

export const completedJobsApi = {
  getAll: async (): Promise<CompletedJob[]> => {
    try {
      const { data, error } = await supabase
        .from('completed_jobs')
        .select('*')
        .order('completion_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Completed Jobs');
      return [];
    }
  },

  getByPartnerId: async (partnerId: string): Promise<CompletedJob[]> => {
    try {
      const { data, error } = await supabase
        .from('completed_jobs')
        .select('*')
        .eq('partner_id', partnerId)
        .order('completion_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Completed Jobs for Partner ${partnerId}`);
      return [];
    }
  },

  getByCustomerId: async (customerId: string): Promise<CompletedJob[]> => {
    try {
      const { data, error } = await supabase
        .from('completed_jobs')
        .select('*')
        .eq('customer_id', customerId)
        .order('completion_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Completed Jobs for Customer ${customerId}`);
      return [];
    }
  },

  create: async (job: Omit<CompletedJob, 'id' | 'createdAt'>): Promise<CompletedJob> => {
    try {
      const { data, error } = await supabase
        .from('completed_jobs')
        .insert(job)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Completed Job');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<CompletedJob>): Promise<CompletedJob> => {
    try {
      const { data, error } = await supabase
        .from('completed_jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Completed Job ${id}`);
      throw error;
    }
  },
};

// ============================================
// PARTNER REVIEWS API
// ============================================

export const partnerReviewsApi = {
  getAll: async (): Promise<PartnerReview[]> => {
    try {
      const { data, error } = await supabase
        .from('partner_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Partner Reviews');
      return [];
    }
  },

  getByPartnerId: async (partnerId: string): Promise<PartnerReview[]> => {
    try {
      const { data, error } = await supabase
        .from('partner_reviews')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Reviews for Partner ${partnerId}`);
      return [];
    }
  },

  create: async (review: Omit<PartnerReview, 'id' | 'createdAt'>): Promise<PartnerReview> => {
    try {
      const { data, error } = await supabase
        .from('partner_reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Partner Review');
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('partner_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, `Delete Review ${id}`);
    }
  },
};

// ============================================
// PARTNER DOCUMENTS API
// ============================================

export const partnerDocumentsApi = {
  getAll: async (): Promise<PartnerDocument[]> => {
    try {
      const { data, error } = await supabase
        .from('partner_documents')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Partner Documents');
      return [];
    }
  },

  getByPartnerId: async (partnerId: string): Promise<PartnerDocument[]> => {
    try {
      const { data, error } = await supabase
        .from('partner_documents')
        .select('*')
        .eq('partner_id', partnerId)
        .order('upload_date', { ascending: false});

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Documents for Partner ${partnerId}`);
      return [];
    }
  },

  create: async (document: Omit<PartnerDocument, 'id' | 'uploadDate'>): Promise<PartnerDocument> => {
    try {
      const { data, error } = await supabase
        .from('partner_documents')
        .insert(document)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Partner Document');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<PartnerDocument>): Promise<PartnerDocument> => {
    try {
      const { data, error } = await supabase
        .from('partner_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Document ${id}`);
      throw error;
    }
  },

  approve: async (id: string, adminId: string): Promise<PartnerDocument> => {
    return partnerDocumentsApi.update(id, {
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
    });
  },

  reject: async (id: string, adminId: string, reason: string): Promise<PartnerDocument> => {
    return partnerDocumentsApi.update(id, {
      status: 'rejected',
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason,
    });
  },

  /**
   * Dosya yükleme (Supabase Storage)
   */
  uploadFile: async (
    partnerId: string,
    file: File,
    documentType: string
  ): Promise<string> => {
    try {
      const fileName = `${partnerId}/${documentType}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('partner-documents')
        .upload(fileName, file);

      if (error) throw error;

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('partner-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      handleError(error, 'Upload Partner Document');
      throw error;
    }
  },
};

// ============================================
// SUPPORT TICKETS API
// ============================================

export const supportTicketsApi = {
  getAll: async (): Promise<SupportTicket[]> => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Support Tickets');
      return [];
    }
  },

  getByPartnerId: async (partnerId: string): Promise<SupportTicket[]> => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Tickets for Partner ${partnerId}`);
      return [];
    }
  },

  create: async (ticket: Omit<SupportTicket, 'id' | 'createdAt'>): Promise<SupportTicket> => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert(ticket)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Support Ticket');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<SupportTicket>): Promise<SupportTicket> => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Ticket ${id}`);
      throw error;
    }
  },

  resolve: async (id: string, resolution: string, adminId: string): Promise<SupportTicket> => {
    return supportTicketsApi.update(id, {
      status: 'resolved',
      resolution,
      assignedTo: adminId,
    });
  },
};

// ============================================
// PARTNER VEHICLES API
// ============================================

export const partnerVehiclesApi = {
  getAll: async (): Promise<PartnerVehicle[]> => {
    try {
      const { data, error } = await supabase
        .from('partner_vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Partner Vehicles');
      return [];
    }
  },

  getByPartnerId: async (partnerId: string): Promise<PartnerVehicle[]> => {
    try {
      const { data, error } = await supabase
        .from('partner_vehicles')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Vehicles for Partner ${partnerId}`);
      return [];
    }
  },

  create: async (vehicle: Omit<PartnerVehicle, 'id' | 'createdAt'>): Promise<PartnerVehicle> => {
    try {
      const { data, error } = await supabase
        .from('partner_vehicles')
        .insert(vehicle)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Partner Vehicle');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<PartnerVehicle>): Promise<PartnerVehicle> => {
    try {
      const { data, error } = await supabase
        .from('partner_vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Vehicle ${id}`);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('partner_vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, `Delete Vehicle ${id}`);
    }
  },
};

// ============================================
// PARTNER CREDITS API
// ============================================

export const partnerCreditsApi = {
  getByPartnerId: async (partnerId: string): Promise<PartnerCredit | null> => {
    try {
      const { data, error } = await supabase
        .from('partner_credits')
        .select('*')
        .eq('partner_id', partnerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Get Credits for Partner ${partnerId}`);
      return null;
    }
  },

  addCredits: async (
    partnerId: string,
    partnerName: string,
    amount: number,
    description: string
  ): Promise<CreditTransaction> => {
    try {
      // 1. Mevcut bakiyeyi getir
      const credit = await partnerCreditsApi.getByPartnerId(partnerId);
      const balanceBefore = credit?.balance || 0;
      const balanceAfter = balanceBefore + amount;

      // 2. İşlem kaydı oluştur
      const { data: transaction, error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          partner_id: partnerId,
          partner_name: partnerName,
          type: 'purchase',
          amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      return transaction;
    } catch (error) {
      handleError(error, 'Add Partner Credits');
      throw error;
    }
  },

  useCredits: async (
    partnerId: string,
    partnerName: string,
    amount: number,
    description: string,
    requestId?: string
  ): Promise<CreditTransaction> => {
    try {
      const credit = await partnerCreditsApi.getByPartnerId(partnerId);
      const balanceBefore = credit?.balance || 0;

      if (balanceBefore < amount) {
        throw new Error('Yetersiz kredi bakiyesi');
      }

      const balanceAfter = balanceBefore - amount;

      const { data: transaction, error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          partner_id: partnerId,
          partner_name: partnerName,
          type: 'usage',
          amount: -amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description,
          request_id: requestId,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      return transaction;
    } catch (error) {
      handleError(error, 'Use Partner Credits');
      throw error;
    }
  },

  getTransactions: async (partnerId: string): Promise<CreditTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Transactions for Partner ${partnerId}`);
      return [];
    }
  },
};

// ============================================
// EMPTY TRUCK ROUTES API
// ============================================

export const emptyTruckRoutesApi = {
  getAll: async (): Promise<EmptyTruckRoute[]> => {
    try {
      const { data, error } = await supabase
        .from('empty_truck_routes')
        .select('*')
        .eq('status', 'active')
        .order('departure_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Empty Truck Routes');
      return [];
    }
  },

  getByPartnerId: async (partnerId: string): Promise<EmptyTruckRoute[]> => {
    try {
      const { data, error } = await supabase
        .from('empty_truck_routes')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Routes for Partner ${partnerId}`);
      return [];
    }
  },

  create: async (route: Omit<EmptyTruckRoute, 'id' | 'createdAt'>): Promise<EmptyTruckRoute> => {
    try {
      const { data, error } = await supabase
        .from('empty_truck_routes')
        .insert(route)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Empty Truck Route');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<EmptyTruckRoute>): Promise<EmptyTruckRoute> => {
    try {
      const { data, error } = await supabase
        .from('empty_truck_routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Route ${id}`);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('empty_truck_routes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, `Delete Route ${id}`);
    }
  },
};

// ============================================
// ADMIN USERS API
// ============================================

export const adminUsersApi = {
  getAll: async (): Promise<AdminUser[]> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get All Admin Users');
      return [];
    }
  },

  create: async (admin: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert(admin)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create Admin User');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<AdminUser>): Promise<AdminUser> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, `Update Admin User ${id}`);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, `Delete Admin User ${id}`);
    }
  },
};

// ============================================
// SYSTEM LOGS API
// ============================================

export const systemLogsApi = {
  create: async (log: Omit<SystemLog, 'id' | 'createdAt'>): Promise<SystemLog> => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .insert(log)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create System Log');
      throw error;
    }
  },

  getAll: async (limit: number = 100): Promise<SystemLog[]> => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Get System Logs');
      return [];
    }
  },

  getByEntity: async (entity: string, entityId: string): Promise<SystemLog[]> => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('entity', entity)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, `Get Logs for ${entity} ${entityId}`);
      return [];
    }
  },
};

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export const realtimeApi = {
  /**
   * Taleplerdeki değişiklikleri dinle
   */
  subscribeToRequests: (callback: (payload: any) => void) => {
    const subscription = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        callback
      )
      .subscribe();

    return subscription;
  },

  /**
   * Tekliflerdeki değişiklikleri dinle
   */
  subscribeToOffers: (requestId: string, callback: (payload: any) => void) => {
    const subscription = supabase
      .channel(`offers-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers',
          filter: `request_id=eq.${requestId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  /**
   * İş aşamalarındaki değişiklikleri dinle
   */
  subscribeToJobStages: (requestId: string, callback: (payload: any) => void) => {
    const subscription = supabase
      .channel(`job-stages-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${requestId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  /**
   * Aboneliği iptal et
   */
  unsubscribe: (subscription: any) => {
    supabase.removeChannel(subscription);
  },
};

// ============================================
// ANALYTICS & REPORTING
// ============================================

export const analyticsApi = {
  /**
   * Partner istatistikleri view'ını kullan
   */
  getPartnerStats: async () => {
    try {
      const { data, error } = await supabase
        .from('partner_stats')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Get Partner Stats');
      return [];
    }
  },

  /**
   * Müşteri istatistikleri
   */
  getCustomerStats: async () => {
    try {
      const { data, error } = await supabase
        .from('customer_stats')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Get Customer Stats');
      return [];
    }
  },

  /**
   * Günlük istatistikler
   */
  getDailyStats: async (limit: number = 30) => {
    try {
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Get Daily Stats');
      return [];
    }
  },
};

// ============================================
// EXPORT ALL APIs
// ============================================

const supabaseApi = {
  auth: authApi,
  customers: customersApi,
  partners: partnersApi,
  requests: requestsApi,
  offers: offersApi,
  completedJobs: completedJobsApi,
  partnerReviews: partnerReviewsApi,
  partnerDocuments: partnerDocumentsApi,
  supportTickets: supportTicketsApi,
  partnerVehicles: partnerVehiclesApi,
  partnerCredits: partnerCreditsApi,
  emptyTruckRoutes: emptyTruckRoutesApi,
  adminUsers: adminUsersApi,
  systemLogs: systemLogsApi,
  realtime: realtimeApi,
  analytics: analyticsApi,
};

export { supabaseApi };
export default supabaseApi;
