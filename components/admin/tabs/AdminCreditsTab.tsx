/**
 * Admin Credits Management Tab
 * Müşterilere ulaşmak için satın alınan iletişim kredisi yönetimi
 */

import React, { useState } from 'react';
import { Search, Wallet, Plus, Minus, Phone, ShoppingCart, Eye, Calendar, Filter } from 'lucide-react';
import { useAdminFilter } from '../hooks/useAdminFilter';
import EmptyState from '../ui/EmptyState';

interface CreditAccount {
  partnerId: string;
  partnerName: string;
  balance: number; // Kalan iletişim kredisi
  totalPurchased: number; // Toplam satın alınan kredi
  totalUsed: number; // Kullanılan kredi (müşteriye ulaşma)
  lastTransaction: string;
}

interface CreditTransaction {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'purchase' | 'usage' | 'adjustment' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  date: string;
  requestId?: string; // Hangi talep için kullanıldı
  adminUser?: string;
}

// MOCK DATA
const MOCK_ACCOUNTS: CreditAccount[] = [
  {
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    balance: 25, // Kalan iletişim hakkı
    totalPurchased: 100, // Toplam satın aldığı kredi
    totalUsed: 75, // Kullandığı kredi (müşteriye ulaşma)
    lastTransaction: '2024-11-22 15:30',
  },
  {
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    balance: 50,
    totalPurchased: 200,
    totalUsed: 150,
    lastTransaction: '2024-11-15 14:00',
  },
  {
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    balance: 10,
    totalPurchased: 50,
    totalUsed: 40,
    lastTransaction: '2024-11-10 16:45',
  },
];

const MOCK_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'TRX-001',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    type: 'usage',
    amount: -1,
    balanceBefore: 26,
    balanceAfter: 25,
    description: 'Müşteri iletişim talebi - Çekici Hizmeti',
    date: '2024-11-22 15:30',
    requestId: 'REQ-4923',
  },
  {
    id: 'TRX-002',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    type: 'purchase',
    amount: 50,
    balanceBefore: 26,
    balanceAfter: 76,
    description: 'Kredi paketi satın alındı - 50 Kredi',
    date: '2024-11-20 10:00',
  },
  {
    id: 'TRX-003',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    type: 'usage',
    amount: -1,
    balanceBefore: 51,
    balanceAfter: 50,
    description: 'Müşteri iletişim talebi - Akü Takviyesi',
    date: '2024-11-19 10:15',
    requestId: 'REQ-4920',
  },
  {
    id: 'TRX-004',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    type: 'purchase',
    amount: 100,
    balanceBefore: 0,
    balanceAfter: 100,
    description: 'Kredi paketi satın alındı - 100 Kredi',
    date: '2024-11-15 14:00',
  },
  {
    id: 'TRX-005',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    type: 'adjustment',
    amount: 10,
    balanceBefore: 0,
    balanceAfter: 10,
    description: 'Manuel kredi ekleme - Promosyon',
    date: '2024-11-10 16:45',
    adminUser: 'Admin User',
  },
];

const AdminCreditsTab: React.FC = () => {
  const [accounts] = useState(MOCK_ACCOUNTS);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [selectedAccount, setSelectedAccount] = useState<CreditAccount | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CreditTransaction['type']>('all');

  const { filtered, searchTerm, setSearchTerm } = useAdminFilter<CreditTransaction>(
    transactions,
    { searchKeys: ['partnerName', 'description', 'requestId'] }
  );

  const filteredByType = typeFilter === 'all' 
    ? filtered 
    : filtered.filter(t => t.type === typeFilter);

  const stats = {
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
    totalPurchased: accounts.reduce((sum, a) => sum + a.totalPurchased, 0),
    totalUsed: accounts.reduce((sum, a) => sum + a.totalUsed, 0),
    activePartners: accounts.length,
  };

  const handleAddAdjustment = () => {
    if (!selectedAccount || !adjustmentAmount || !adjustmentReason) return;

    const amount = parseFloat(adjustmentAmount);
    const newBalance = selectedAccount.balance + amount;

    const newTransaction: CreditTransaction = {
      id: `TRX-${Date.now()}`,
      partnerId: selectedAccount.partnerId,
      partnerName: selectedAccount.partnerName,
      type: 'adjustment',
      amount,
      balanceBefore: selectedAccount.balance,
      balanceAfter: newBalance,
      description: `Manuel düzeltme - ${adjustmentReason}`,
      date: new Date().toISOString(),
      adminUser: 'Admin User',
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setShowAdjustmentModal(false);
    setAdjustmentAmount('');
    setAdjustmentReason('');
    setSelectedAccount(null);
  };

  const getTransactionColor = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return 'text-green-600 bg-green-50';
      case 'usage': return 'text-blue-600 bg-blue-50';
      case 'adjustment': return 'text-purple-600 bg-purple-50';
      case 'refund': return 'text-red-600 bg-red-50';
    }
  };

  const getTransactionLabel = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return 'Satın Alım';
      case 'usage': return 'Kullanım';
      case 'adjustment': return 'Düzeltme';
      case 'refund': return 'İade';
    }
  };

  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return <ShoppingCart size={16} />;
      case 'usage': return <Phone size={16} />;
      case 'adjustment': return <Filter size={16} />;
      case 'refund': return <Minus size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet size={20} />
            <span className="text-xs font-bold">Toplam Bakiye</span>
          </div>
          <p className="text-2xl font-black">{stats.totalBalance.toLocaleString('tr-TR')} Kredi</p>
          <p className="text-xs opacity-80">{stats.activePartners} aktif partner</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart size={20} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-600">Satın Alınan</span>
          </div>
          <p className="text-2xl font-black text-blue-700">{stats.totalPurchased.toLocaleString('tr-TR')} Kredi</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Phone size={20} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-600">Kullanılan</span>
          </div>
          <p className="text-2xl font-black text-purple-700">{stats.totalUsed.toLocaleString('tr-TR')} Kredi</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={20} className="text-orange-600" />
            <span className="text-xs font-bold text-orange-600">Kullanılabilir</span>
          </div>
          <p className="text-2xl font-black text-orange-700">{stats.totalBalance.toLocaleString('tr-TR')} Kredi</p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Filter size={20} className="text-slate-600" />
            <span className="text-xs font-bold text-slate-600">Ortalama</span>
          </div>
          <p className="text-2xl font-black text-slate-700">{(stats.totalBalance / stats.activePartners).toLocaleString('tr-TR')} Kredi</p>
        </div>
      </div>

      {/* Partner Accounts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Partner Hesapları</h3>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.partnerId} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-slate-900">{account.partnerName}</p>
                  <p className="text-xs text-slate-500">{account.partnerId}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-600">{account.balance.toLocaleString('tr-TR')} Kredi</p>
                  <p className="text-xs text-slate-500">Mevcut Bakiye</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500">Toplam Satın Alınan</p>
                  <p className="font-bold text-blue-600">{account.totalPurchased.toLocaleString('tr-TR')} Kredi</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Toplam Kullanılan</p>
                  <p className="font-bold text-purple-600">{account.totalUsed.toLocaleString('tr-TR')} Kredi</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Kalan</p>
                  <p className="font-bold text-orange-600">{account.balance.toLocaleString('tr-TR')} Kredi</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Son İşlem: {account.lastTransaction}</p>
                <button
                  onClick={() => {
                    setSelectedAccount(account);
                    setShowAdjustmentModal(true);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus size={14} />
                  Düzeltme
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Partner, açıklama veya talep ID ara..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${typeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            Tümü
          </button>
          <button
            onClick={() => setTypeFilter('purchase')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${typeFilter === 'purchase' ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            Satın Alım
          </button>
          <button
            onClick={() => setTypeFilter('usage')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${typeFilter === 'usage' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            Kullanım
          </button>
          <button
            onClick={() => setTypeFilter('adjustment')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${typeFilter === 'adjustment' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            Düzeltme
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredByType.length === 0 ? (
          <EmptyState title="İşlem Bulunamadı" description="Arama kriterinize uygun işlem yok." />
        ) : (
          filteredByType.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900">{transaction.partnerName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTransactionColor(transaction.type)}`}>
                        {getTransactionLabel(transaction.type)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{transaction.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <span>{transaction.id}</span>
                      {transaction.requestId && (
                        <>
                          <span>•</span>
                          <span>{transaction.requestId}</span>
                        </>
                      )}
                      {transaction.adminUser && (
                        <>
                          <span>•</span>
                          <span>Admin: {transaction.adminUser}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString('tr-TR')} Kredi
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Önceki: {transaction.balanceBefore.toLocaleString('tr-TR')} → Sonraki: {transaction.balanceAfter.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Adjustment Modal */}
      {showAdjustmentModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdjustmentModal(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Kredi Düzeltme</h2>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Partner</p>
                <p className="font-bold text-slate-900">{selectedAccount.partnerName}</p>
                <p className="text-xs text-slate-500">{selectedAccount.partnerId}</p>
              </div>
              <div className="bg-green-50 rounded-xl border-2 border-green-200 p-4">
                <p className="text-xs text-green-600 mb-1">Mevcut Kredi Bakiyesi</p>
                <p className="text-2xl font-black text-green-700">{selectedAccount.balance.toLocaleString('tr-TR')} Kredi</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kredi Miktarı (+ veya -)</label>
                <input
                  type="number"
                  placeholder="Örn: +50 veya -10"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sebep</label>
                <textarea
                  placeholder="Düzeltme sebebini yazın..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddAdjustment}
                  disabled={!adjustmentAmount || !adjustmentReason}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreditsTab;
