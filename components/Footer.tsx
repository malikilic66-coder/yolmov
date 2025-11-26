import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: 'home' | 'about' | 'services' | 'faq' | 'contact' | 'career' | 'blog') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavigation = (page: 'home' | 'about' | 'services' | 'faq' | 'contact' | 'career' | 'blog') => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 xl:px-32">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div>
            <div className="mb-6 cursor-pointer" onClick={() => handleNavigation('home')}>
              <img 
                src="https://raw.githubusercontent.com/yosoyorhan/repo2/refs/heads/main/yolmov-logo-cutter-beyaz.png" 
                alt="Yolmov Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Yolda kaldığınız her an yanınızdayız. Modern, hızlı ve güvenilir yol yardım platformu.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white/90">Kurumsal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <button onClick={() => handleNavigation('about')} className="hover:text-brand-orange transition-colors text-left">
                  Hakkımızda
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('services')} className="hover:text-brand-orange transition-colors text-left">
                  Hizmetler
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('career')} className="hover:text-brand-orange transition-colors text-left">
                  Kariyer
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('blog')} className="hover:text-brand-orange transition-colors text-left">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('contact')} className="hover:text-brand-orange transition-colors text-left">
                  İletişim
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white/90">Hizmetler</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {['Çekici Hizmeti', 'Akü Takviyesi', 'Lastik Değişimi', 'Yakıt Desteği', 'Oto Kurtarma'].map(link => (
                <li key={link}>
                  <button onClick={() => handleNavigation('services')} className="hover:text-brand-orange transition-colors text-left">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white/90">Bize Ulaşın</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-orange shrink-0" />
                <span>0850 123 45 67</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-orange shrink-0" />
                <span>destek@yolmov.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-orange shrink-0" />
                <span>Maslak Mah. Büyükdere Cad. No:123 Sarıyer / İstanbul</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} YOLMOV Teknoloji A.Ş. Tüm hakları saklıdır.
          </p>
          <div className="flex space-x-6 text-xs text-gray-500">
            <button 
              onClick={() => {
                const event = new CustomEvent('yolmov:navigate', { detail: { page: 'privacy-policy' } });
                window.dispatchEvent(event);
              }}
              className="hover:text-white transition-colors"
            >
              Gizlilik Politikası
            </button>
            <button 
              onClick={() => {
                const event = new CustomEvent('yolmov:navigate', { detail: { page: 'terms-of-service' } });
                window.dispatchEvent(event);
              }}
              className="hover:text-white transition-colors"
            >
              Kullanım Koşulları
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;