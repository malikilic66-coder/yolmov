/**
 * Admin Financial Management Tab
 * Ödeme takibi, komisyon analizi, partner kazanç yönetimi
 */

import React, { useState } from 'react';
import { Search, DollarSign, TrendingUp, TrendingDown, Calendar, Eye, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAdminFilter } from '../hooks/useAdminFilter';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';

interface Payment {
  id: string;
  partnerId: string;
  partnerName: string;
  jobId: string;
  service: string;
  amount: number;
  commission: number;
  partnerEarning: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'kredi_karti' | 'nakit' | 'havale';
  date: string;
  customer: string;
  transactionId?: string;
}

// MOCK DATA
const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'PAY-001',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    jobId: 'JOB-4923',
    service: 'Çekici Hizmeti',
    amount: 2500,
    commission: 375, // 15%
    partnerEarning: 2125,
    status: 'completed',
    paymentMethod: 'kredi_karti',
    date: '2024-11-22 15:30',
    customer: 'Ahmet Yılmaz',
    transactionId: 'TRX-8921',
  },
  {
    id: 'PAY-002',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    jobId: 'JOB-4920',
    service: 'Akü Takviyesi',
    amount: 800,
    commission: 120, // 15%
    partnerEarning: 680,
    status: 'completed',
    paymentMethod: 'nakit',
    date: '2024-11-19 10:15',
    customer: 'Mehmet K.',
  },
  {
    id: 'PAY-003',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    jobId: 'JOB-4918',
    service: 'Çekici Hizmeti',
    amount: 3200,
    commission: 480, // 15%
    partnerEarning: 2720,
    status: 'pending',
    paymentMethod: 'kredi_karti',
    date: '2024-11-15 14:00',
    customer: 'Selin Kaya',
    transactionId: 'TRX-8918',
  },
  {
    id: 'PAY-004',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    jobId: 'JOB-4915',
    service: 'Çekici Hizmeti',
    amount: 2800,
    commission: 420, // 15%
    partnerEarning: 2380,
    status: 'refunded',
    paymentMethod: 'kredi_karti',
    date: '2024-11-12 09:30',
    customer: 'Burak Y.',
    transactionId: 'TRX-8915',
  },
  {
    id: 'PAY-005',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    jobId: 'JOB-4912',
    service: 'Lastik Değişimi',
    amount: 600,
    commission: 90, // 15%
    partnerEarning: 510,
    status: 'completed',
    paymentMethod: 'nakit',
    date: '2024-11-10 16:45',
    customer: 'Zeynep Aydın',
  },
  {
    id: 'PAY-006',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    jobId: 'JOB-4910',
    service: 'Yakıt Desteği',
    amount: 400,
    commission: 60, // 15%
    partnerEarning: 340,
    status: 'completed',
    paymentMethod: 'kredi_karti',
    date: '2024-11-08 11:20',
    customer: 'Caner Erkin',
    transactionId: 'TRX-8910',
  },
  {
    id: 'PAY-007',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    jobId: 'JOB-4908',
    service: 'Çekici Hizmeti',
    amount: 2900,
    commission: 435, // 15%
    partnerEarning: 2465,
    status: 'failed',
    paymentMethod: 'kredi_karti',
    date: '2024-11-05 08:45',
    customer: 'Elif Demir',
    transactionId: 'TRX-8908',
  },
  {
    id: 'PAY-008',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    jobId: 'JOB-4905',
    service: 'Akü Takviyesi',
    amount: 750,
    commission: 112.5, // 15%
    partnerEarning: 637.5,
    status: 'completed',
    paymentMethod: 'havale',
    date: '2024-11-03 14:20',
    customer: 'Ayşe Kara',
    transactionId: 'TRX-8905',
  },
];

const AdminFinancialTab: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [payments] = useState(MOCK_PAYMENTS);
  const [statusFilter, setStatusFilter] = useState<'all' | Payment['status']>('all');

  const { filtered, searchTerm, setSearchTerm } = useAdminFilter<Payment>(
    payments,
    { searchKeys: ['partnerName', 'customer', 'service', 'jobId'] }
  );

  const filteredByStatus = statusFilter === 'all' 
    ? filtered 
    : filtered.filter(p => p.status === statusFilter);

  const stats = {
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    totalCommission: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.commission, 0),
    totalPartnerEarnings: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.partnerEarning, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    refundedAmount: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0),
    failedAmount: payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
  };

  const getPaymentMethodLabel = (method: Payment['paymentMethod']) => {
    switch (method) {
      case 'kredi_karti': return 'Kredi Kartı';
      case 'nakit': return 'Nakit';
      case 'havale': return 'Havale';
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Partner', 'Müşteri', 'Hizmet', 'Tutar', 'Komisyon', 'Partner Kazancı', 'Durum', 'Tarih'];
    const rows = filteredByStatus.map(p => [
      p.id,
      p.partnerName,
      p.customer,
      p.service,
      `${p.amount}₺`,
      `${p.commission}₺`,
      `${p.partnerEarning}₺`,
      p.status,
      p.date,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yolmov-finansal-rapor-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} />
            <span className="text-xs font-bold">Toplam Gelir</span>
          </div>
          <p className="text-2xl font-black">{stats.totalRevenue.toLocaleString('tr-TR')}₺</p>
          <p className="text-xs opacity-80">{stats.completed} tamamlanan iş</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} />
            <span className="text-xs font-bold">Komisyon</span>
          </div>
          <p className="text-2xl font-black">{stats.totalCommission.toLocaleString('tr-TR')}₺</p>
          <p className="text-xs opacity-80">%{((stats.totalCommission / stats.totalRevenue) * 100).toFixed(1)} oran</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} />
            <span className="text-xs font-bold">Partner Kazancı</span>
          </div>
          <p className="text-2xl font-black">{stats.totalPartnerEarnings.toLocaleString('tr-TR')}₺</p>
          <p className="text-xs opacity-80">Dağıtılan toplam</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={20} className="text-orange-600" />
            <span className="text-xs font-bold text-orange-600">Bekleyen</span>
          </div>
          <p className="text-2xl font-black text-orange-700">{stats.pendingAmount.toLocaleString('tr-TR')}₺</p>
          <p className="text-xs text-orange-600">{stats.pending} işlem</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle size={20} className="text-red-600" />
            <span className="text-xs font-bold text-red-600">Başarısız</span>
          </div>
          <p className="text-2xl font-black text-red-700">{stats.failedAmount.toLocaleString('tr-TR')}₺</p>
          <p className="text-xs text-red-600">{stats.failed} işlem</p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown size={20} className="text-slate-600" />
            <span className="text-xs font-bold text-slate-600">İade</span>
          </div>
          <p className="text-2xl font-black text-slate-700">{stats.refundedAmount.toLocaleString('tr-TR')}₺</p>
          <p className="text-xs text-slate-600">{stats.refunded} işlem</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Partner, müşteri, hizmet veya iş ID ara..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            Tümü
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'completed' ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            Tamamlanan
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === 'pending' ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            Bekleyen
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={16} />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Ödeme ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Partner</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Müşteri</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Hizmet</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Tutar</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Komisyon</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Partner</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Yöntem</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Durum</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredByStatus.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12">
                    <EmptyState title="Ödeme Bulunamadı" description="Arama kriterinize uygun ödeme kaydı yok." />
                  </td>
                </tr>
              ) : (
                filteredByStatus.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{payment.id}</p>
                      <p className="text-xs text-slate-500">{payment.jobId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{payment.partnerName}</p>
                      <p className="text-xs text-slate-500">{payment.partnerId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{payment.customer}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{payment.service}</p>
                      <p className="text-xs text-slate-500">{payment.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{payment.amount.toLocaleString('tr-TR')}₺</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-600">{payment.commission.toLocaleString('tr-TR')}₺</p>
                      <p className="text-xs text-slate-500">%{((payment.commission / payment.amount) * 100).toFixed(0)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-green-600">{payment.partnerEarning.toLocaleString('tr-TR')}₺</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{getPaymentMethodLabel(payment.paymentMethod)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge type="payment" status={payment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                      >
                        <Eye size={18} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPayment(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Ödeme Detayları</h2>
              <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <XCircle size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Ödeme ID</p>
                  <p className="font-bold text-slate-900">{selectedPayment.id}</p>
                  {selectedPayment.transactionId && (
                    <p className="text-xs text-slate-500 mt-1">TRX: {selectedPayment.transactionId}</p>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">İş ID</p>
                  <p className="font-bold text-slate-900">{selectedPayment.jobId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Partner</p>
                  <p className="font-bold text-slate-900">{selectedPayment.partnerName}</p>
                  <p className="text-xs text-slate-500">{selectedPayment.partnerId}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Müşteri</p>
                  <p className="font-bold text-slate-900">{selectedPayment.customer}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Hizmet & Tarih</p>
                <p className="font-bold text-slate-900">{selectedPayment.service}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedPayment.date}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl border-2 border-green-200 p-4">
                  <p className="text-xs text-green-600 mb-1">Toplam Tutar</p>
                  <p className="text-2xl font-bold text-green-700">{selectedPayment.amount.toLocaleString('tr-TR')}₺</p>
                </div>
                <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4">
                  <p className="text-xs text-blue-600 mb-1">Komisyon (%{((selectedPayment.commission / selectedPayment.amount) * 100).toFixed(0)})</p>
                  <p className="text-2xl font-bold text-blue-700">{selectedPayment.commission.toLocaleString('tr-TR')}₺</p>
                </div>
                <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-4">
                  <p className="text-xs text-purple-600 mb-1">Partner Kazancı</p>
                  <p className="text-2xl font-bold text-purple-700">{selectedPayment.partnerEarning.toLocaleString('tr-TR')}₺</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">Ödeme Yöntemi</p>
                  <p className="font-bold text-slate-900">{getPaymentMethodLabel(selectedPayment.paymentMethod)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">Durum</p>
                  <StatusBadge type="payment" status={selectedPayment.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinancialTab;
