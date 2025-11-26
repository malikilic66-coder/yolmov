/**
 * Admin Fleet Management Tab
 * Tüm partnerlerin araç yönetimi
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Truck, Eye, Edit, CheckCircle, XCircle, User, Calendar, Wrench, MapPin } from 'lucide-react';
import { useAdminFilter } from '../hooks/useAdminFilter';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';

interface Vehicle {
  id: string;
  partnerId: string;
  partnerName: string;
  plate: string;
  model: string;
  type: string;
  driver: string;
  status: 'active' | 'maintenance' | 'disabled';
  registrationDate: string;
  lastService?: string;
  totalJobs: number;
  totalEarnings: number;
  image: string;
}

// MOCK DATA
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-001',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    plate: '34 AB 1234',
    model: '2020 Ford F-Max',
    type: 'Kayar Kasa',
    driver: 'Mehmet Yıldız',
    status: 'active',
    registrationDate: '2023-09-10',
    lastService: '2024-10-15',
    totalJobs: 128,
    totalEarnings: 45600,
    image: 'https://images.unsplash.com/photo-1605218427360-6982bc998200?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'VEH-002',
    partnerId: 'PTR-001',
    partnerName: 'Yılmaz Oto Kurtarma',
    plate: '34 CD 5678',
    model: '2019 Mercedes Atego',
    type: 'Platform',
    driver: 'Ali Kaya',
    status: 'active',
    registrationDate: '2023-09-10',
    lastService: '2024-11-05',
    totalJobs: 95,
    totalEarnings: 32400,
    image: 'https://images.unsplash.com/photo-1586015604658-650561417675?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'VEH-003',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    plate: '34 XY 9988',
    model: '2018 Isuzu NPR',
    type: 'Ahtapot Vinç',
    driver: 'Ahmet Demir',
    status: 'maintenance',
    registrationDate: '2023-08-20',
    lastService: '2024-11-20',
    totalJobs: 203,
    totalEarnings: 78900,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'VEH-004',
    partnerId: 'PTR-002',
    partnerName: 'Hızlı Yol Yardım',
    plate: '06 ZZ 4321',
    model: '2021 Iveco Daily',
    type: 'Çekici',
    driver: 'Selin Yılmaz',
    status: 'active',
    registrationDate: '2023-08-20',
    lastService: '2024-09-12',
    totalJobs: 167,
    totalEarnings: 56700,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'VEH-005',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    plate: '35 TT 7890',
    model: '2017 MAN TGX',
    type: 'Ağır Çekici',
    driver: 'Burak Özkan',
    status: 'disabled',
    registrationDate: '2024-02-15',
    lastService: '2024-08-20',
    totalJobs: 45,
    totalEarnings: 18900,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'VEH-006',
    partnerId: 'PTR-003',
    partnerName: 'Mega Çekici',
    plate: '35 MM 1122',
    model: '2022 Renault Trucks D',
    type: 'Platform',
    driver: 'Zeynep Aydın',
    status: 'active',
    registrationDate: '2024-02-15',
    lastService: '2024-11-10',
    totalJobs: 44,
    totalEarnings: 16200,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=300',
  },
];

const AdminFleetTab: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);

  const { filtered, searchTerm, setSearchTerm, filterType, setFilterType } = useAdminFilter<Vehicle>(
    vehicles,
    { searchKeys: ['plate', 'partnerName', 'driver'], statusKey: 'status' }
  );

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    disabled: vehicles.filter(v => v.status === 'disabled').length,
    totalJobs: vehicles.reduce((sum, v) => sum + v.totalJobs, 0),
    totalEarnings: vehicles.reduce((sum, v) => sum + v.totalEarnings, 0),
  };

  const updateVehicleStatus = (vehicleId: string, newStatus: Vehicle['status']) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Truck size={20} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Toplam</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-xs font-bold text-green-600">Aktif</span>
          </div>
          <p className="text-2xl font-black text-green-700">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Wrench size={20} className="text-yellow-600" />
            <span className="text-xs font-bold text-yellow-600">Bakımda</span>
          </div>
          <p className="text-2xl font-black text-yellow-700">{stats.maintenance}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle size={20} className="text-red-600" />
            <span className="text-xs font-bold text-red-600">Devre Dışı</span>
          </div>
          <p className="text-2xl font-black text-red-700">{stats.disabled}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={20} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-600">Toplam İş</span>
          </div>
          <p className="text-2xl font-black text-blue-700">{stats.totalJobs}</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <MapPin size={20} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-600">Kazanç</span>
          </div>
          <p className="text-2xl font-black text-purple-700">₺{stats.totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Plaka, partner veya sürücü ile ara..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="maintenance">Bakımda</option>
          <option value="disabled">Devre Dışı</option>
        </select>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <EmptyState title="Araç Bulunamadı" description="Arama kriterinize uygun araç yok." />
        ) : (
          filtered.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  <StatusBadge type="vehicle" status={vehicle.status} />
                </div>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-900">{vehicle.plate}</h3>
                  <p className="text-sm text-slate-500">{vehicle.model}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Partner:</span>
                    <span className="font-semibold text-slate-900">{vehicle.partnerName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Araç Tipi:</span>
                    <span className="font-semibold text-slate-900">{vehicle.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Sürücü:</span>
                    <span className="font-semibold text-slate-900">{vehicle.driver}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tamamlanan İş:</span>
                    <span className="font-semibold text-blue-600">{vehicle.totalJobs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Toplam Kazanç:</span>
                    <span className="font-semibold text-green-600">₺{vehicle.totalEarnings.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/admin/filo/${vehicle.id}`)}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  Detayları Gör
                </button>
              </div>
            </div>
          ))
        )}
      </div>


    </div>
  );
};

export default AdminFleetTab;
