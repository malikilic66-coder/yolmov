import React from 'react';
import { CAMPAIGNS } from '../constants';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface CampaignsPageProps {
  onBack?: () => void;
}

const CampaignsPage: React.FC<CampaignsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {onBack && (
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 text-sm font-bold"
            >
              <ArrowLeft size={18}/> Geri Dön
            </button>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-sm font-bold uppercase tracking-wider mb-6">
              Kampanyalar
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Tüm Fırsatlar ve<br />
              <span className="text-brand-orange">Kampanyalar</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              YOLMOV kullanıcılarına özel avantajlar, indirimler ve iş birlikleri.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAMPAIGNS.map((camp, index) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  const event = new CustomEvent('yolmov:navigate', { 
                    detail: { 
                      page: 'campaign-detail',
                      campaign: camp
                    } 
                  });
                  window.dispatchEvent(event);
                }}
                className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all"
              >
                {/* Background Image */}
                <img 
                  src={camp.image} 
                  alt={camp.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="flex justify-start">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-white/30 shadow-sm flex items-center gap-2">
                      <Tag size={14} />
                      {camp.badgeText}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-brand-orange transition-colors">
                      {camp.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {camp.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                      <Calendar size={14} />
                      <span>Geçerlilik: Kampanya koşullarına tabidir</span>
                    </div>

                    <button className="px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors w-full">
                      Kampanya Detayları
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
