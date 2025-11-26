import React from 'react';
import { ArrowLeft, Calendar, Tag, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string;
  badgeText: string;
}

interface CampaignDetailPageProps {
  campaign: Campaign;
  onBack?: () => void;
}

const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({ campaign, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px]">
        <img 
          src={campaign.image} 
          alt={campaign.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12">
          {onBack && (
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-white hover:text-brand-orange mb-6 text-sm font-bold w-fit bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl"
            >
              <ArrowLeft size={18}/> Geri Dön
            </button>
          )}

          <div>
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-white/30 shadow-sm mb-4">
              <Tag size={14} className="inline mr-2" />
              {campaign.badgeText}
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              {campaign.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Kampanya Detayları</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {campaign.description}
              </p>
            </section>

            <section className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-brand-orange" />
                Kampanya Avantajları
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange mt-1">•</span>
                  <span>YOLMOV kullanıcılarına özel indirim fırsatı</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange mt-1">•</span>
                  <span>7/24 kesintisiz hizmet desteği</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange mt-1">•</span>
                  <span>Güvenilir ve doğrulanmış hizmet sağlayıcılar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange mt-1">•</span>
                  <span>Anında teklif alma ve karşılaştırma imkanı</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Kampanya Koşulları</h3>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <Calendar size={16} className="text-gray-400 mt-0.5" />
                  <span>Kampanya süresi ve koşulları değişiklik gösterebilir.</span>
                </p>
                <p>• Bu kampanya YOLMOV platformu üzerinden yapılan hizmet taleplerinde geçerlidir.</p>
                <p>• Kampanya kapsamındaki indirimler partner firmalar tarafından uygulanır.</p>
                <p>• YOLMOV, kampanya koşullarında değişiklik yapma hakkını saklı tutar.</p>
                <p>• Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.</p>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  const event = new CustomEvent('yolmov:navigate', { detail: { page: 'quote' } });
                  window.dispatchEvent(event);
                }}
                className="w-full md:w-auto px-8 py-4 bg-brand-orange text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg"
              >
                Hemen Teklif Al
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
