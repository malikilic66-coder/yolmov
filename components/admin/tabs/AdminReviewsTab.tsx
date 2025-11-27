/**
 * Admin Reviews Management Tab
 * Müşteri değerlendirmeleri ve itiraz yönetimi
 */

import React, { useState } from 'react';
import { Search, Star, ThumbsDown, AlertTriangle, Eye, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { useAdminFilter } from '../hooks/useAdminFilter';
import EmptyState from '../ui/EmptyState';

interface Review {
  id: string;
  jobId: string;
  partnerId: string;
  partnerName: string;
  customerName: string;
  service: string;
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  tags: string[];
  objection?: {
    reason: string;
    details: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    resolvedBy?: string;
    resolvedAt?: string;
  };
}

// MOCK DATA
const MOCK_REVIEWS: Review[] = [
  {
    id: 'REV-001',
    jobId: 'JOB-4923',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    customerName: 'Ahmet Yılmaz',
    service: 'Çekici Hizmeti',
    date: '2024-11-22 15:30',
    rating: 5,
    comment: 'Çok hızlı geldi, işini profesyonelce yaptı. Teşekkürler!',
    tags: ['Kibar Müşteri', 'Sorunsuz Ödeme', 'Bahşiş Bıraktı'],
  },
  {
    id: 'REV-002',
    jobId: 'JOB-4920',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    customerName: 'Mehmet K.',
    service: 'Akü Takviyesi',
    date: '2024-11-19 10:15',
    rating: 2,
    comment: 'Geç geldi, müşteri hizmetleri vasat.',
    tags: ['Geç Geldi', 'İletişim Zor'],
    objection: {
      reason: 'Haksız değerlendirme',
      details: 'Trafikte kaza oldu, bu yüzden geç kaldım. Müşteriye bilgi verdim ama yine de kötü puan verdi.',
      submittedAt: '2024-11-19 16:00',
      status: 'pending',
    },
  },
  {
    id: 'REV-003',
    jobId: 'JOB-4918',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    customerName: 'Selin Kaya',
    service: 'Çekici Hizmeti',
    date: '2024-11-15 14:00',
    rating: 4,
    comment: 'Gayet iyiydi, fiyat biraz yüksek geldi ama memnunum.',
    tags: ['Anlayışlı', 'İletişim Kolaydı'],
  },
  {
    id: 'REV-004',
    jobId: 'JOB-4915',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    customerName: 'Burak Y.',
    service: 'Çekici Hizmeti',
    date: '2024-11-12 09:30',
    rating: 1,
    comment: 'Çok kötü bir deneyimdi, asla tavsiye etmem.',
    tags: ['Kaba Davranış', 'Ödeme Sorunu'],
    objection: {
      reason: 'Müşteri saldırgan davrandı',
      details: 'Müşteri sarhoş ve saldırgan davrandı. Poliçe tutanak var. Bu değerlendirme haksız.',
      submittedAt: '2024-11-12 14:00',
      status: 'approved',
      resolvedBy: 'Admin User',
      resolvedAt: '2024-11-13 10:00',
    },
  },
  {
    id: 'REV-005',
    jobId: 'JOB-4912',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    customerName: 'Zeynep Aydın',
    service: 'Lastik Değişimi',
    date: '2024-11-10 16:45',
    rating: 5,
    comment: 'Hayat kurtardınız! Çok teşekkürler, kesinlikle tavsiye ederim.',
    tags: ['Konum Doğruydu', 'Sorunsuz Ödeme'],
  },
  {
    id: 'REV-006',
    jobId: 'JOB-4910',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    customerName: 'Caner Erkin',
    service: 'Yakıt Desteği',
    date: '2024-11-08 11:20',
    rating: 5,
    comment: 'Çok hızlı ve profesyonel hizmet. Teşekkürler!',
    tags: ['Kibar Müşteri', 'Konum Doğruydu'],
  },
  {
    id: 'REV-007',
    jobId: 'JOB-4908',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    customerName: 'Elif Demir',
    service: 'Çekici Hizmeti',
    date: '2024-11-05 08:45',
    rating: 3,
    comment: 'İdare eder, fiyat biraz yüksek.',
    tags: ['Ödeme Sorunu'],
  },
];

const AdminReviewsTab: React.FC = () => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const { filtered, searchTerm, setSearchTerm } = useAdminFilter<Review>(
    reviews,
    { searchKeys: ['partnerName', 'customerName', 'service'] }
  );

  const filteredByRating = ratingFilter === 'all' 
    ? filtered 
    : filtered.filter(r => {
        if (ratingFilter === 2) return r.rating <= 2;
        return r.rating === ratingFilter;
      });

  const stats = {
    total: reviews.length,
    avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    fiveStar: reviews.filter(r => r.rating === 5).length,
    fourStar: reviews.filter(r => r.rating === 4).length,
    threeStar: reviews.filter(r => r.rating === 3).length,
    lowRating: reviews.filter(r => r.rating <= 2).length,
    objections: reviews.filter(r => r.objection).length,
    pendingObjections: reviews.filter(r => r.objection?.status === 'pending').length,
  };

  const handleApproveObjection = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId && r.objection
        ? { ...r, objection: { ...r.objection, status: 'approved', resolvedBy: 'Admin User', resolvedAt: new Date().toISOString() } }
        : r
    ));
    setSelectedReview(null);
  };

  const handleRejectObjection = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId && r.objection
        ? { ...r, objection: { ...r.objection, status: 'rejected', resolvedBy: 'Admin User', resolvedAt: new Date().toISOString() } }
        : r
    ));
    setSelectedReview(null);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-yellow-400" fill="#FBBF24" />
            <span className="text-xs font-bold text-slate-500">Ortalama</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.avgRating}</p>
        </div>
        <button
          onClick={() => setRatingFilter('all')}
          className={`bg-white rounded-xl border-2 p-4 text-left transition-all ${ratingFilter === 'all' ? 'border-slate-400' : 'border-slate-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Tümü</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
        </button>
        <button
          onClick={() => setRatingFilter(5)}
          className={`bg-green-50 rounded-xl border-2 p-4 text-left transition-all ${ratingFilter === 5 ? 'border-green-400' : 'border-green-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-green-600" fill="#16a34a" />
            <span className="text-xs font-bold text-green-600">5★</span>
          </div>
          <p className="text-2xl font-black text-green-700">{stats.fiveStar}</p>
        </button>
        <button
          onClick={() => setRatingFilter(4)}
          className={`bg-blue-50 rounded-xl border-2 p-4 text-left transition-all ${ratingFilter === 4 ? 'border-blue-400' : 'border-blue-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-blue-600" fill="#2563eb" />
            <span className="text-xs font-bold text-blue-600">4★</span>
          </div>
          <p className="text-2xl font-black text-blue-700">{stats.fourStar}</p>
        </button>
        <button
          onClick={() => setRatingFilter(3)}
          className={`bg-yellow-50 rounded-xl border-2 p-4 text-left transition-all ${ratingFilter === 3 ? 'border-yellow-400' : 'border-yellow-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-yellow-600" fill="#ca8a04" />
            <span className="text-xs font-bold text-yellow-600">3★</span>
          </div>
          <p className="text-2xl font-black text-yellow-700">{stats.threeStar}</p>
        </button>
        <button
          onClick={() => setRatingFilter(2)}
          className={`bg-red-50 rounded-xl border-2 p-4 text-left transition-all ${ratingFilter === 2 ? 'border-red-400' : 'border-red-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <ThumbsDown size={20} className="text-red-600" />
            <span className="text-xs font-bold text-red-600">≤2★</span>
          </div>
          <p className="text-2xl font-black text-red-700">{stats.lowRating}</p>
        </button>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle size={20} className="text-orange-600" />
            <span className="text-xs font-bold text-orange-600">İtiraz</span>
          </div>
          <p className="text-2xl font-black text-orange-700">{stats.pendingObjections}/{stats.objections}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Partner, müşteri veya hizmet ara..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSearchTerm(e.target.value === 'all' ? '' : e.target.value)}
        >
          <option value="all">Tüm Partnerler</option>
          {[...new Set(MOCK_REVIEWS.map(r => r.partnerName))].sort().map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSearchTerm(e.target.value === 'all' ? '' : e.target.value)}
        >
          <option value="all">Tüm Hizmetler</option>
          {[...new Set(MOCK_REVIEWS.map(r => r.service))].sort().map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
      </div>

      {/* Reviews List - Tablo Formatı */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredByRating.length === 0 ? (
          <EmptyState title="Değerlendirme Bulunamadı" description="Arama kriterinize uygun değerlendirme yok." />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Partner / Müşteri</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Hizmet</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Puan</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Yorum</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Tarih</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Durum</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredByRating.map((review) => (
                <tr 
                  key={review.id} 
                  className={`hover:bg-slate-50 cursor-pointer ${review.objection?.status === 'pending' ? 'bg-orange-50/50' : ''}`}
                  onClick={() => setSelectedReview(review)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{review.partnerName}</p>
                      <p className="text-xs text-slate-500">{review.customerName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{review.service}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? getRatingColor(review.rating) : 'text-slate-300'}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                      <span className={`ml-1 text-sm font-bold ${getRatingColor(review.rating)}`}>{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 line-clamp-2 max-w-xs">{review.comment}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{review.date}</td>
                  <td className="px-6 py-4">
                    {review.objection ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        review.objection.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        review.objection.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {review.objection.status === 'pending' ? 'İtiraz Bekliyor' :
                         review.objection.status === 'approved' ? 'İtiraz Onaylandı' : 'İtiraz Reddedildi'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      {review.objection?.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveObjection(review.id)}
                            className="p-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectObjection(review.id)}
                            className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReview(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Değerlendirme Detayları</h2>
              <button onClick={() => setSelectedReview(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <XCircle size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Partner</p>
                  <p className="font-bold text-slate-900">{selectedReview.partnerName}</p>
                  <p className="text-xs text-slate-500">{selectedReview.partnerId}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Müşteri</p>
                  <p className="font-bold text-slate-900">{selectedReview.customerName}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Hizmet & Tarih</p>
                <p className="font-bold text-slate-900">{selectedReview.service}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedReview.date} • {selectedReview.jobId}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Puan</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={i < selectedReview.rating ? getRatingColor(selectedReview.rating) : 'text-slate-300'}
                      fill={i < selectedReview.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                  <span className="ml-2 text-2xl font-bold text-slate-900">{selectedReview.rating}/5</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Yorum</p>
                <p className="text-slate-900">{selectedReview.comment}</p>
              </div>

              {selectedReview.tags.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">Etiketler</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.tags.map((tag, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedReview.rating >= 4 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReview.objection && (
                <div className={`rounded-xl p-4 border-2 ${
                  selectedReview.objection.status === 'pending' ? 'bg-orange-50 border-orange-200' :
                  selectedReview.objection.status === 'approved' ? 'bg-green-50 border-green-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <p className="text-xs font-bold text-slate-700 mb-1">İTİRAZ BİLGİSİ</p>
                  <p className="font-bold text-slate-900 mb-2">{selectedReview.objection.reason}</p>
                  <p className="text-sm text-slate-700 mb-3">{selectedReview.objection.details}</p>
                  <p className="text-xs text-slate-500">Gönderim: {selectedReview.objection.submittedAt}</p>
                  {selectedReview.objection.resolvedBy && (
                    <p className="text-xs text-slate-500 mt-1">
                      Çözüm: {selectedReview.objection.resolvedBy} • {selectedReview.objection.resolvedAt}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsTab;
