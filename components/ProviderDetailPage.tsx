
import React from 'react';
import { 
  ArrowLeft, Star, ShieldCheck, MapPin, Clock, 
  CreditCard, Truck, CheckCircle2, MessageSquare,
  ThumbsUp, Calendar, Navigation
} from 'lucide-react';
import { Provider } from '../types';
import { motion } from 'framer-motion';

interface ProviderDetailPageProps {
  provider: Provider;
  onBack: () => void;
  onBook: () => void;
}

const ProviderDetailPage: React.FC<ProviderDetailPageProps> = ({ provider, onBack, onBook }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 md:py-10">
      <div className="container mx-auto px-4 md:px-8 lg:px-24 xl:px-32">
        
        {/* Back Navigation */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-orange font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Listeye Dön</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Route/Service Summary Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Hizmet Detayları</h2>
              
              <div className="flex flex-col md:flex-row gap-8 relative">
                {/* Vertical Line for Timeline */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 md:hidden"></div>

                {/* Pickup */}
                <div className="flex gap-4 relative z-10">
                   <div className="flex flex-col items-center gap-1">
                      <div className="text-sm font-bold text-gray-900">00:00</div>
                      <div className="w-10 h-10 rounded-full border-2 border-brand-orange bg-white flex items-center justify-center z-10">
                         <MapPin size={18} className="text-brand-orange fill-brand-orange/20" />
                      </div>
                   </div>
                   <div className="pt-1">
                      <h3 className="font-bold text-gray-900 text-lg">Konumunuz</h3>
                      <p className="text-gray-500 text-sm">Mevcut GPS Konumu</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">
                         {provider.distance} uzakta
                      </span>
                   </div>
                </div>

                {/* Duration - Desktop Only Visual */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center px-4">
                   <div className="text-xs font-bold text-gray-400 mb-2">{provider.eta} tahmini varış</div>
                   <div className="w-full h-0.5 bg-gray-200 relative">
                      <div className="absolute right-0 -top-1.5 w-3 h-3 rounded-full bg-gray-300"></div>
                      <Truck className="absolute left-1/2 -top-3 -translate-x-1/2 text-brand-orange" size={20} />
                   </div>
                </div>

                {/* Destination (Simulated) */}
                <div className="flex gap-4 relative z-10">
                   <div className="flex flex-col items-center gap-1 md:hidden">
                      <div className="text-sm font-bold text-gray-900 text-opacity-0">00:00</div>
                      <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                         <Navigation size={18} className="text-gray-400" />
                      </div>
                   </div>
                   <div className="hidden md:flex flex-col items-center gap-1">
                      <div className="text-sm font-bold text-gray-900">~{parseInt(provider.eta) + 15} dk</div>
                      <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                         <Navigation size={18} className="text-gray-400" />
                      </div>
                   </div>

                   <div className="pt-1">
                      <h3 className="font-bold text-gray-900 text-lg">En Yakın Servis</h3>
                      <p className="text-gray-500 text-sm">veya İstediğiniz Konum</p>
                   </div>
                </div>
              </div>
            </div>

            {/* 2. Provider Profile Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <div className="relative shrink-0">
                <img 
                  src={provider.image} 
                  alt={provider.name} 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-100">
                   <ShieldCheck className="text-blue-500 fill-blue-50" size={24} />
                </div>
              </div>
              
              <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-2xl font-bold text-gray-900 mb-1">{provider.name}</h2>
                       <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1 text-yellow-400">
                             <Star size={16} fill="currentColor" />
                             <span className="font-bold text-gray-900">{provider.rating}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 text-sm underline cursor-pointer hover:text-brand-orange">
                             {provider.reviewCount} değerlendirme
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                       <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                       <span>Doğrulanmış Profil</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                       <Clock size={18} className="text-blue-500 shrink-0" />
                       <span>7/24 Hizmet Veriyor</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                       <CreditCard size={18} className="text-purple-500 shrink-0" />
                       <span>Kredi Kartı Geçerli</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                       <ThumbsUp size={18} className="text-brand-orange shrink-0" />
                       <span>%98 Müşteri Memnuniyeti</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* 3. Vehicle Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
               <h3 className="font-bold text-lg text-gray-900 mb-4">Araç Özellikleri</h3>
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 aspect-video bg-gray-100 rounded-xl overflow-hidden relative group">
                     <img 
                        src="https://images.unsplash.com/photo-1605218427360-6982bc998200?auto=format&fit=crop&q=80&w=600" 
                        alt="Tow Truck" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                     <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Ford F-Max
                     </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Araç Tipi</p>
                        <p className="font-semibold text-gray-800">Kayar Kasa Çekici</p>
                     </div>
                     <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Kapasite</p>
                        <p className="font-semibold text-gray-800">3.5 Ton'a kadar</p>
                     </div>
                     <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Sigorta</p>
                        <p className="font-semibold text-green-600">Taşıma Kaskosu Var</p>
                     </div>
                     <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Ekipman</p>
                        <p className="font-semibold text-gray-800">Ahtapot Aparat</p>
                     </div>
                     <div className="col-span-2 pt-2">
                        <p className="text-gray-500 text-sm leading-relaxed">
                           Aracımız son model olup, alçak şasi spor araçlar dahil tüm binek ve hafif ticari araçları hasarsız yükleme garantisi ile taşımaktadır.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* 4. Reviews Preview */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900">Son Değerlendirmeler</h3>
                  <span className="text-brand-orange font-bold text-sm">Tümünü Gör</span>
               </div>
               
               <div className="space-y-6">
                  {[1, 2].map((review) => (
                     <div key={review} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                 <img src={`https://i.pravatar.cc/150?img=${review + 10}`} alt="User" />
                              </div>
                              <span className="font-bold text-sm text-gray-800">Ali K.</span>
                           </div>
                           <span className="text-xs text-gray-400">2 gün önce</span>
                        </div>
                        <div className="flex text-yellow-400 mb-2">
                           {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                        </div>
                        <p className="text-sm text-gray-600">
                           Çok hızlı geldiler. Aracımı özenle yüklediler. Kesinlikle tavsiye ederim, işini bilen profesyonel bir ekip.
                        </p>
                     </div>
                  ))}
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Card */}
          <div className="lg:col-span-4">
             <div className="sticky top-28 space-y-4">
                
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-brand-orange/5 border border-brand-orange/10">
                   <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Hemen Teklif Alın</h3>
                      <p className="text-sm text-gray-500">Detaylı fiyat bilgisi için teklif isteği gönderin</p>
                   </div>

                   <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                         <CheckCircle2 size={16} className="text-green-500" />
                         <span>Ücretsiz Teklif</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                         <CheckCircle2 size={16} className="text-green-500" />
                         <span>Hızlı Yanıt Garantisi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                         <CheckCircle2 size={16} className="text-green-500" />
                         <span>Net Fiyat, Ek Ücret Yok</span>
                      </div>
                   </div>

                   <button 
                      onClick={onBook}
                      className="w-full py-4 bg-brand-orange text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-brand-lightOrange transition-all transform hover:-translate-y-1 active:scale-95 mb-3"
                   >
                      Teklif Al
                   </button>
                   <p className="text-xs text-center text-gray-400 px-4">
                      Teklifi onaylayana kadar herhangi bir ödeme alınmaz.
                   </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
                   <MessageSquare className="text-blue-500 shrink-0 mt-1" size={20} />
                   <div>
                      <h4 className="font-bold text-sm text-blue-900">Soru Sor</h4>
                      <p className="text-xs text-blue-700 mt-1">
                         Hizmet vermeden önce sürücüyle iletişime geçebilirsiniz.
                      </p>
                      <button className="mt-2 text-xs font-bold text-blue-600 hover:underline">Mesaj Gönder</button>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPage;
