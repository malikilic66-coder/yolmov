import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import HowItWorks from './components/HowItWorks';
import Advantages from './components/Advantages';
import Campaigns from './components/Campaigns';
import Footer from './components/Footer';
import CookieConsentBanner from './components/CookieConsentBanner';
import { initDemoData } from './services/demoData';

// Lazy load pages for better performance
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const ServicesPage = React.lazy(() => import('./components/ServicesPage'));
const FAQPage = React.lazy(() => import('./components/FAQPage'));
const ContactPage = React.lazy(() => import('./components/ContactPage'));
const CareerPage = React.lazy(() => import('./components/CareerPage'));
const BlogPage = React.lazy(() => import('./components/BlogPage'));
const CampaignsPage = React.lazy(() => import('./components/CampaignsPage'));
const CampaignDetailPage = React.lazy(() => import('./components/CampaignDetailPage'));
const LoginPage = React.lazy(() => import('./components/LoginPage'));
const PartnerRegisterPage = React.lazy(() => import('./components/PartnerRegisterPage'));
const PartnerDashboard = React.lazy(() => import('./components/PartnerDashboard'));
const CustomerProfilePage = React.lazy(() => import('./components/CustomerProfilePage'));
const OffersPanel = React.lazy(() => import('./components/OffersPanel'));
const QuotePage = React.lazy(() => import('./components/QuotePage'));
const ListingPage = React.lazy(() => import('./components/ListingPage'));
const ProviderDetailPage = React.lazy(() => import('./components/ProviderDetailPage'));
const AdminLoginPage = React.lazy(() => import('./components/AdminLoginPage'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const AdminSystemLogs = React.lazy(() => import('./components/AdminSystemLogs'));
const AdminUserDetailPage = React.lazy(() => import('./components/admin/pages/AdminUserDetailPage'));
const AdminPartnerDetailPage = React.lazy(() => import('./components/admin/pages/AdminPartnerDetailPage'));
const AdminRequestDetailPage = React.lazy(() => import('./components/admin/pages/AdminRequestDetailPage'));
const AdminOfferDetailPage = React.lazy(() => import('./components/admin/pages/AdminOfferDetailPage'));
const AdminFleetDetailPage = React.lazy(() => import('./components/admin/pages/AdminFleetDetailPage'));
const NotificationTestPage = React.lazy(() => import('./components/NotificationTestPage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('./components/TermsOfServicePage'));
const NotFoundPage = React.lazy(() => import('./components/NotFoundPage'));

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-orange"></div>
  </div>
);

// Home page component
const HomePage = () => {
  const navigate = useNavigate();
  
  const handleSearch = (city: string, district: string, serviceId: string) => {
    navigate(`/liste?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}&serviceId=${encodeURIComponent(serviceId)}`);
  };
  
  return (
    <>
      <Hero onSearch={handleSearch} />
      <ServicesSection />
      <HowItWorks />
      <Advantages />
      <Campaigns />
    </>
  );
};

// Layout wrapper component to handle Header/Footer visibility
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Hide header/footer on these routes
  const hideHeaderFooter = ['/partner', '/admin', '/admin/giris', '/admin/sistem-loglari'].some(
    path => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-brand-dark selection:bg-brand-orange selection:text-white">
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
      <CookieConsentBanner />
    </div>
  );
};

function App() {
  // Initialize demo data on first load
  useEffect(() => {
    initDemoData();
  }, []);

  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />
            
            {/* Static Pages */}
            <Route path="/hakkimizda" element={<AboutPage />} />
            <Route path="/hizmetler" element={<ServicesPage />} />
            <Route path="/sss" element={<FAQPage />} />
            <Route path="/iletisim" element={<ContactPage />} />
            <Route path="/kariyer" element={<CareerPage />} />
            <Route path="/blog" element={<BlogPage />} />
            
            {/* Campaigns */}
            <Route path="/kampanyalar" element={<CampaignsPage />} />
            <Route path="/kampanya/:id" element={<CampaignDetailPage />} />
            
            {/* Auth & Registration */}
            <Route path="/giris/musteri" element={<LoginPage userType="customer" />} />
            <Route path="/giris/partner" element={<LoginPage userType="partner" />} />
            <Route path="/partner/kayit" element={<PartnerRegisterPage />} />
            
            {/* Partner Dashboard */}
            <Route path="/partner" element={<PartnerDashboard />} />
            
            {/* Customer */}
            <Route path="/musteri/profil" element={<CustomerProfilePage />} />
            <Route path="/musteri/teklifler" element={<OffersPanel />} />
            
            {/* Quote & Listing */}
            <Route path="/teklif" element={<QuotePage />} />
            <Route path="/liste" element={<ListingPage />} />
            <Route path="/hizmet/:id" element={<ProviderDetailPage />} />
            
            {/* Admin */}
            <Route path="/admin/giris" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/kullanicilar" element={<AdminDashboard />} />
            <Route path="/admin/partnerler" element={<AdminDashboard />} />
            <Route path="/admin/talepler" element={<AdminDashboard />} />
            <Route path="/admin/teklifler" element={<AdminDashboard />} />
            <Route path="/admin/raporlar" element={<AdminDashboard />} />
            <Route path="/admin/belgeler" element={<AdminDashboard />} />
            <Route path="/admin/filo" element={<AdminDashboard />} />
            <Route path="/admin/degerlendirmeler" element={<AdminDashboard />} />
            <Route path="/admin/finansal" element={<AdminDashboard />} />
            <Route path="/admin/krediler" element={<AdminDashboard />} />
            <Route path="/admin/is-gecmisi" element={<AdminDashboard />} />
            <Route path="/admin/kullanici/:id" element={<AdminUserDetailPage />} />
            <Route path="/admin/partner/:id" element={<AdminPartnerDetailPage />} />
            <Route path="/admin/talep/:id" element={<AdminRequestDetailPage />} />
            <Route path="/admin/teklif/:id" element={<AdminOfferDetailPage />} />
            <Route path="/admin/filo/:vehicleId" element={<AdminFleetDetailPage />} />
            <Route path="/admin/sistem-loglari" element={<AdminSystemLogs />} />
            
            {/* Special Pages */}
            <Route path="/bildirim-test" element={<NotificationTestPage />} />
            <Route path="/gizlilik-politikasi" element={<PrivacyPolicyPage />} />
            <Route path="/kullanim-kosullari" element={<TermsOfServicePage />} />
            
            {/* Legacy /operasyon redirect */}
            <Route path="/operasyon" element={<AdminLoginPage />} />
            
            {/* 404 - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
