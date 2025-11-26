
import React, { useState, useEffect } from 'react';
import { 
  Clock, MapPin, ShieldCheck, Search, 
  ClipboardList, ArrowRight, User, Calendar, 
  CheckCircle2, Star, ChevronRight, Map
} from 'lucide-react';
import { PROVIDERS } from '../constants';
import { Provider } from '../types';
import { motion } from 'framer-motion';

interface ListingPageProps {
  initialCity?: string;
  initialDistrict?: string;
  initialServiceId?: string;
  onNavigateToQuote: () => void;
  onProviderClick: (provider: Provider) => void;
}

const ProviderCard = ({ provider, index, onClick }: { provider: Provider, index: number, onClick: (provider: Provider) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick(provider)}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-orange/30 transition-all cursor-pointer group flex flex-col md:flex-row items-center gap-6 md:gap-8"
    >
      {/* LEFT: Profile & Main Info */}
      <div className="flex items-center gap-4 w-full md:w-auto min-w-[240px]">
          <div className="relative shrink-0">
              <img 
              src={provider.image} 
              alt={provider.name} 
              className="w-16 h-16 rounded-full object-cover border border-gray-100 group-hover:border-brand-orange transition-colors"
              />
              {provider.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <CheckCircle2 size={18} className="text-blue-500 fill-white" />
              </div>
              )}
          </div>
          <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-orange transition-colors leading-tight mb-1">
                  {provider.name}
              </h3>
              <div className="flex items-center gap-1.5 mb-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-gray-800">{provider.rating}</span>
                  <span className="text-xs text-gray-400">({provider.reviewCount})</span>
              </div>
              <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                  {provider.serviceType}
              </span>
          </div>
      </div>

      {/* MIDDLE: Location Only (Updated) */}
      <div className="flex-1 w-full md:w-auto flex items-center md:border-l md:border-gray-100 md:pl-8 py-2">
          <div className="flex flex-col justify-center w-full">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mb-0.5">
                  <Map size={14} /> Konum
              </div>
              <div className="text-gray-800 font-semibold text-sm md:text-base truncate">
                  {provider.location}
              </div>
          </div>
      </div>

      {/* RIGHT: Select Button */}
      <div className="w-full md:w-auto shrink-0">
          <button 
              onClick={(e) => {
                e.stopPropagation();
                onClick(provider);
              }}
              className="w-full bg-brand-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-lightOrange transition-colors shadow-md shadow-orange-100 flex items-center justify-center gap-2"
          >
              Seç <ChevronRight size={18} />
          </button>
      </div>

    </motion.div>
  );
};

const ListingPage: React.FC<ListingPageProps> = ({ 
  initialCity = 'İstanbul', 
  initialDistrict = '', 
  initialServiceId = '',
  onNavigateToQuote,
  onProviderClick
}) => {
  const [sortBy, setSortBy] = useState('eta');
  
  // Demo State: Randomly force empty state to show the "No Results" design
  const [forceEmpty, setForceEmpty] = useState(false);

  useEffect(() => {
    // 50% chance to show empty state on mount for demo purposes
    setForceEmpty(Math.random() < 0.5);
  }, []);

  const filteredProviders = PROVIDERS; // In real app, filter by city/service
  const displayProviders = forceEmpty ? [] : filteredProviders;

  // --- NEW COMPONENTS FOR THIS DESIGN ---

  // 1. Horizontal Search Bar (Top)
  const SearchStrip = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[80px] z-30 hidden md:block">
      <div className="container mx-auto px-4 md:px-8 lg:px-24 xl:px-32">
        <div className="flex flex-col md:flex-row md:items-center h-20 gap-4 md:gap-0">
          
          {/* Location Input Group */}
          <div className="flex-1 flex items-center gap-3 border-r border-gray-100 pr-4">
             <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0"></div>
             <div className="flex-1">
                <div className="text-xs text-gray-400 font-bold">Konum</div>
                <div className="text-gray-800 font-semibold truncate">{initialDistrict || 'Tüm İlçeler'}, {initialCity}</div>
             </div>
          </div>

          <div className="flex items-center justify-center w-12 text-gray-300">
             <ArrowRight size={20} />
          </div>

          {/* Destination (User) Group */}
          <div className="flex-1 flex items-center gap-3 border-r border-gray-100 px-4">
             <div className="w-5 h-5 rounded-full border-2 border-gray-800 shrink-0"></div>
             <div className="flex-1">
                <div className="text-xs text-gray-400 font-bold">Hedef (Siz)</div>
                <div className="text-gray-800 font-semibold truncate">Mevcut Konum</div>
             </div>
          </div>

          {/* Date Group */}
          <div className="flex-1 flex items-center gap-3 border-r border-gray-100 px-4">
             <Calendar className="text-gray-400 shrink-0" size={20} />
             <div className="flex-1">
                <div className="text-xs text-gray-400 font-bold">Tarih</div>
                <div className="text-gray-800 font-semibold">Bugün</div>
             </div>
          </div>

          {/* Passenger/Vehicle Group */}
          <div className="flex-1 flex items-center gap-3 px-4">
             <User className="text-gray-400 shrink-0" size={20} />
             <div className="flex-1">
                <div className="text-xs text-gray-400 font-bold">Araç Tipi</div>
                <div className="text-gray-800 font-semibold">Otomobil</div>
             </div>
          </div>

          {/* Button */}
          <button className="bg-brand-orange hover:bg-brand-lightOrange text-white font-bold py-2.5 px-8 rounded-xl transition-colors shadow-md shadow-orange-100 ml-4">
             Ara
          </button>
        </div>
      </div>
    </div>
  );

  // 2. Sort & Filter Sidebar
  const Sidebar = () => (
    <div className="space-y-8">
      
      {/* Sort Section */}
      <div>
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-brand-dark text-lg">Sırala</h3>
            <button className="text-xs text-brand-orange font-semibold hover:underline">Tümünü temizle</button>
         </div>
         <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sortBy === 'eta' ? 'border-brand-orange' : 'border-gray-300 group-hover:border-brand-orange'}`}>
                  {sortBy === 'eta' && <div className="w-2.5 h-2.5 rounded-full bg-brand-orange"></div>}
               </div>
               <input type="radio" name="sort" className="hidden" checked={sortBy === 'eta'} onChange={() => setSortBy('eta')} />
               <div className="flex items-center gap-2 text-gray-600 group-hover:text-brand-dark">
                  <Clock size={18} />
                  <span>En erken varış</span>
               </div>
            </label>

             <label className="flex items-center gap-3 cursor-pointer group">
               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sortBy === 'dist' ? 'border-brand-orange' : 'border-gray-300 group-hover:border-brand-orange'}`}>
                  {sortBy === 'dist' && <div className="w-2.5 h-2.5 rounded-full bg-brand-orange"></div>}
               </div>
               <input type="radio" name="sort" className="hidden" checked={sortBy === 'dist'} onChange={() => setSortBy('dist')} />
               <div className="flex items-center gap-2 text-gray-600 group-hover:text-brand-dark">
                  <MapPin size={18} />
                  <span>Kalkış yerine yakın</span>
               </div>
            </label>
         </div>
      </div>

      <div className="w-full h-px bg-gray-200"></div>

      {/* Trust Filter */}
      <div>
         <h3 className="font-bold text-brand-dark text-lg mb-4">Güven ve Güvenlik</h3>
         <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
               <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange" />
               <span className="text-gray-600 group-hover:text-gray-900">Doğrulanmış Profil</span>
            </div>
            <ShieldCheck size={18} className="text-brand-orange" />
         </label>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* Top Search Strip */}
      <SearchStrip />

      <div className="container mx-auto px-4 md:px-8 lg:px-24 xl:px-32 py-8">
        
        {/* Header Info */}
        <div className="flex justify-between items-end mb-6">
           <div>
              <div className="text-sm text-gray-400 mb-1">
                 {initialCity} bölgesinde
              </div>
              <h1 className="text-xl font-bold text-brand-dark">
                 {displayProviders.length} hizmet veren mevcut
              </h1>
           </div>
           {/* Mobile Filter Toggle could go here */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar (Left) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-32">
             <Sidebar />
          </div>

          {/* Main Content (Right) */}
          <div className="col-span-1 lg:col-span-8 space-y-4">
            
            {displayProviders.length > 0 ? (
              displayProviders.map((provider, index) => (
                <ProviderCard key={provider.id} provider={provider} index={index} onClick={onProviderClick} />
              ))
            ) : (
              /* --- EMPTY STATE --- */
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm"
               >
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Search size={40} className="text-brand-orange" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Şu an müsait araç yok
                  </h2>
                  <p className="text-gray-500 max-w-md mb-8 leading-relaxed text-sm">
                  Aradığınız kriterlere uygun hizmet veren şu anda bulunamadı. Ancak talep oluşturarak tüm firmalara bildirim gönderebilirsiniz.
                  </p>

                  <button 
                     onClick={onNavigateToQuote}
                     className="w-full md:w-auto px-8 py-4 bg-brand-orange text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-brand-lightOrange transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                  >
                     <ClipboardList size={20} /> Hemen Ücretsiz Teklif Al
                  </button>
               </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;
