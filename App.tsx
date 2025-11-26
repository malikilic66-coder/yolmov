
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import HowItWorks from './components/HowItWorks';
import Advantages from './components/Advantages';
import Campaigns from './components/Campaigns';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import CustomerProfilePage from './components/CustomerProfilePage';
import ListingPage from './components/ListingPage';
import QuotePage from './components/QuotePage';
import ProviderDetailPage from './components/ProviderDetailPage';
import PartnerRegisterPage from './components/PartnerRegisterPage';
import PartnerDashboard from './components/PartnerDashboard';
import OffersPanel from './components/OffersPanel';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AboutPage from './components/AboutPage';
import ServicesPage from './components/ServicesPage';
import FAQPage from './components/FAQPage';
import ContactPage from './components/ContactPage';
import CareerPage from './components/CareerPage';
import BlogPage from './components/BlogPage';
import NotFoundPage from './components/NotFoundPage';
import CampaignsPage from './components/CampaignsPage';
import CampaignDetailPage from './components/CampaignDetailPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import NotificationTestPage from './components/NotificationTestPage';
import CookieConsentBanner from './components/CookieConsentBanner';
import { Provider, Customer } from './types';
import { initDemoData } from './services/demoData';
import { requestNotificationPermission, startTestNotifications } from './services/testNotifications';

function App() {
  // Expanded routing state
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'services' | 'faq' | 'contact' | 'career' | 'blog' | 'campaigns' | 'campaign-detail' | 'privacy-policy' | 'terms-of-service' | 'login-customer' | 'login-partner' | 'partner-register' | 'listing' | 'quote' | 'detail' | 'partner-dashboard' | 'customer-profile' | 'customer-offers' | 'admin-login' | 'admin-dashboard' | 'notification-test' | 'not-found'>('home');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [customer, setCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('yolmov_customer');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Search Params State
  const [searchParams, setSearchParams] = useState({
    city: '',
    district: '',
    serviceId: ''
  });

  // Initialize demo data on first load
  useEffect(() => {
    initDemoData();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Check for /operasyon path in URL for admin access
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/operasyon' || path.startsWith('/operasyon/')) {
      setCurrentPage('admin-login');
      // Replace URL without reload
      window.history.replaceState({}, '', '/');
    }
    // Bildirim test sayfası için
    if (path === '/notification-test' || path.startsWith('/notification-test')) {
      setCurrentPage('notification-test');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Basit custom event ile iç bileşenlerden yönlendirme (örn. CustomerProfilePage içindeki Teklifleri Gör butonu)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.page) {
        setCurrentPage(detail.page);
        if (detail.campaign) {
          setSelectedCampaign(detail.campaign);
        }
      }
    };
    window.addEventListener('yolmov:navigate', handler);
    return () => window.removeEventListener('yolmov:navigate', handler);
  }, []);

  const handleSearch = (city: string, district: string, serviceId: string) => {
    setSearchParams({ city, district, serviceId });
    setCurrentPage('listing');
  };

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setCurrentPage('detail');
  };

  const handleCustomerLogin = (phone: string) => {
    // Mock create customer profile
    const fakeCustomer: Customer = {
      id: 'CUST-' + Date.now(),
      firstName: 'Misafir',
      lastName: 'Kullanıcı',
      phone,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('yolmov_customer', JSON.stringify(fakeCustomer));
    setCustomer(fakeCustomer);
    setCurrentPage('customer-profile');
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('yolmov_customer');
    setCustomer(null);
    setCurrentPage('home');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'faq':
        return <FAQPage />;
      case 'contact':
        return <ContactPage />;
      case 'career':
        return <CareerPage />;
      case 'blog':
        return <BlogPage />;
      case 'login-customer':
        return <LoginPage userType="customer" onLoginSuccess={handleCustomerLogin} />;
      case 'login-partner':
        return <LoginPage userType="partner" onNavigateToRegister={() => setCurrentPage('partner-register')} onLoginSuccess={() => setCurrentPage('partner-dashboard')} />;
      case 'partner-register':
        return <PartnerRegisterPage />;
      case 'partner-dashboard':
        return <PartnerDashboard onLogout={() => setCurrentPage('home')} />;
      case 'admin-login':
        return <AdminLoginPage onLogin={() => setCurrentPage('admin-dashboard')} />;
      case 'admin-dashboard':
        return <AdminDashboard onLogout={() => setCurrentPage('home')} />;
      case 'customer-profile':
        return customer ? (
          <CustomerProfilePage 
            customer={customer} 
            onUpdate={(c) => {
              localStorage.setItem('yolmov_customer', JSON.stringify(c));
              setCustomer(c);
            }} 
            onLogout={handleCustomerLogout}
            onBackHome={() => setCurrentPage('home')}
            onViewOffers={() => setCurrentPage('customer-offers')}
          />
        ) : (
          <div className="flex items-center justify-center h-[50vh]">Profil bulunamadı</div>
        );
      case 'customer-offers':
        return customer ? (
          <OffersPanel 
            customer={customer}
            onBack={() => setCurrentPage('customer-profile')}
          />
        ) : <div className="flex items-center justify-center h-[50vh]">Önce giriş yapın</div>;
      case 'quote':
        return <QuotePage 
          onHome={() => setCurrentPage('home')} 
          onViewOffers={() => customer ? setCurrentPage('customer-offers') : setCurrentPage('login-customer')}
        />;
      case 'listing':
        return (
          <ListingPage 
            initialCity={searchParams.city}
            initialDistrict={searchParams.district}
            initialServiceId={searchParams.serviceId}
            onNavigateToQuote={() => setCurrentPage('quote')}
            onProviderClick={handleProviderClick}
          />
        );
      case 'detail':
        return selectedProvider ? (
          <ProviderDetailPage 
            provider={selectedProvider} 
            onBack={() => setCurrentPage('listing')}
            onBook={() => setCurrentPage('quote')} 
          />
        ) : (
          <div className="flex items-center justify-center h-[50vh]">Provider not found</div>
        );
      case 'campaigns':
        return <CampaignsPage onBack={() => setCurrentPage('home')} />;
      case 'campaign-detail':
        return selectedCampaign ? (
          <CampaignDetailPage 
            campaign={selectedCampaign}
            onBack={() => setCurrentPage('campaigns')} 
          />
        ) : (
          <div className="flex items-center justify-center h-[50vh]">Campaign not found</div>
        );
      case 'privacy-policy':
        return <PrivacyPolicyPage onBack={() => setCurrentPage('home')} />;
      case 'terms-of-service':
        return <TermsOfServicePage onBack={() => setCurrentPage('home')} />;
      case 'notification-test':
        return <NotificationTestPage />;
      case 'not-found':
        return <NotFoundPage onNavigateHome={() => setCurrentPage('home')} />;
      case 'home':
      default:
        return (
          <>
            <Hero onSearch={handleSearch} />
            <ServicesSection />
            <HowItWorks />
            <Advantages />
            <Campaigns />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-brand-dark selection:bg-brand-orange selection:text-white">
      {/* Hide Header on Partner Dashboard and Admin Dashboard for full screen experience */}
      {currentPage !== 'partner-dashboard' && currentPage !== 'admin-dashboard' && currentPage !== 'admin-login' && (
        <Header 
          onNavigate={(page) => setCurrentPage(page)}
          onLoginClick={() => setCurrentPage('login-customer')}
          onAgencyLoginClick={() => setCurrentPage('login-partner')}
          onPartnerClick={() => setCurrentPage('partner-register')}
          customer={customer}
          onCustomerProfile={() => setCurrentPage('customer-profile')}
          onCustomerLogout={handleCustomerLogout}
        />
      )}
      
      <main className="flex-grow">
        {renderContent()}
      </main>
      
      {/* Hide Footer on Partner Dashboard and Admin Dashboard */}
      {currentPage !== 'partner-dashboard' && currentPage !== 'admin-dashboard' && currentPage !== 'admin-login' && (
        <Footer onNavigate={(page) => setCurrentPage(page)} />
      )}
      
      <CookieConsentBanner />
    </div>
  );
}

export default App;
