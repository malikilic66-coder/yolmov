import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from './shared/NotificationCenter';
import { Customer } from '../types';
import supabaseApi from '../services/supabaseApi';

interface HeaderProps {
  // Remove callback props - using useNavigate instead
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Manuel session kontrolü - localStorage'dan oku
  useEffect(() => {
    let isMounted = true;
    
    const loadCustomer = async (userId: string) => {
      try {
        const customerData = await supabaseApi.customers.getById(userId);
        if (isMounted && customerData) {
          setCustomer(customerData);
        }
      } catch (error) {
        console.error('Customer yükleme hatası:', error);
      }
    };

    const checkSession = async () => {
      try {
        // Manuel session okuma - localStorage'dan
        const sessionStr = localStorage.getItem('yolmov-auth-session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session?.user?.id) {
            await loadCustomer(session.user.id);
          }
        } else {
          if (isMounted) setCustomer(null);
        }
      } catch (error) {
        console.error('Session kontrol hatası:', error);
        if (isMounted) setCustomer(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    // Storage event'lerini dinle (başka tab'da login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'yolmov-auth-session') {
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Her 5 saniyede bir kontrol et (polling)
    const intervalId = setInterval(checkSession, 5000);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []); // Boş dependency array - sadece mount'ta çalışır

  const handleLogout = async () => {
    try {
      // Manuel logout - localStorage'dan sil
      localStorage.removeItem('yolmov-auth-session');
      setCustomer(null);
      setIsProfileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      navigate('/');
    }
  };

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100 h-[80px] flex items-center">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 xl:px-32 flex items-center justify-between h-full">
        
        {/* Left Side: Logo + Navigation */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Logo Area */}
          <div 
            className="flex items-center cursor-pointer shrink-0"
            onClick={() => navigate('/')}
          >
            <img 
              src="https://raw.githubusercontent.com/yosoyorhan/repo2/refs/heads/main/yolmov-logo-cutter.png" 
              alt="Yolmov Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation - Left Aligned */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <button 
              onClick={() => navigate('/hakkimizda')}
              className="text-gray-600 hover:text-brand-orange font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
            >
              Hakkımızda
            </button>
            <button 
              onClick={() => navigate('/hizmetler')}
              className="text-gray-600 hover:text-brand-orange font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
            >
              Hizmetler
            </button>
            <button 
              onClick={() => navigate('/iletisim')}
              className="text-gray-600 hover:text-brand-orange font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
            >
              İletişim
            </button>
            <button 
              onClick={() => navigate('/sss')}
              className="text-gray-600 hover:text-brand-orange font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
            >
              SSS
            </button>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <NotificationCenter />
          {!customer && (
            <>
              <button 
                onClick={() => navigate('/giris/partner')}
                className="text-sm font-bold text-gray-500 hover:text-blue-600 px-3 py-2 transition-colors flex items-center gap-1"
              >
                <Briefcase size={16} />
                Acente Girişi
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              <button 
                onClick={() => navigate('/giris/musteri')}
                className="px-6 py-2.5 rounded-xl border border-brand-orange text-brand-orange font-semibold hover:bg-orange-50 transition-colors"
              >
                Giriş Yap
              </button>
              <button 
                onClick={() => navigate('/partner/kayit')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-lightOrange text-white font-semibold shadow-md hover:shadow-lg hover:opacity-95 transition-all transform hover:-translate-y-0.5"
              >
                Partner Ol
              </button>
            </>
          )}
          {customer && (
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(v => !v)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 hover:border-brand-orange hover:bg-orange-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                  {customer.avatarUrl ? <img src={customer.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : customer.firstName.charAt(0)}
                </div>
                <span className="font-semibold text-gray-700">{customer.firstName}</span>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                  <button 
                    onClick={() => { navigate('/musteri/profil'); setIsProfileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >Profilim</button>
                  <div className="my-1 h-px bg-gray-100"></div>
                  <button 
                    onClick={() => { handleLogout(); setIsProfileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >Çıkış Yap</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-gray-600" onClick={toggleMenu}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-[80px] left-0 w-full bg-white shadow-lg overflow-hidden md:hidden border-t border-gray-100"
          >
            <div className="flex flex-col p-6 space-y-4">
              <button 
                onClick={() => {
                  navigate('/hakkimizda');
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-gray-700 py-2 border-b border-gray-50 text-left"
              >
                Hakkımızda
              </button>
              <button 
                onClick={() => {
                  navigate('/hizmetler');
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-gray-700 py-2 border-b border-gray-50 text-left"
              >
                Hizmetler
              </button>
              <button 
                onClick={() => {
                  navigate('/iletisim');
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-gray-700 py-2 border-b border-gray-50 text-left"
              >
                İletişim
              </button>
              <button 
                onClick={() => {
                  navigate('/sss');
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-gray-700 py-2 border-b border-gray-50 text-left"
              >
                SSS
              </button>
              <div className="pt-4 flex flex-col gap-3">
                {!customer && (
                  <>
                    <button 
                      onClick={() => {
                        navigate('/giris/musteri');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl border border-brand-orange text-brand-orange font-semibold"
                    >
                      Giriş Yap
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/giris/partner');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl border border-blue-600 text-blue-600 font-semibold flex items-center justify-center gap-2"
                    >
                      <Briefcase size={18} /> Acente Girişi
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/partner/kayit');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-brand-orange text-white font-semibold shadow-md"
                    >
                      Partner Ol
                    </button>
                  </>
                )}
                {customer && (
                  <>
                    <button 
                      onClick={() => {
                        navigate('/musteri/profil');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                    >
                      Profilim
                    </button>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-semibold"
                    >
                      Çıkış Yap
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;